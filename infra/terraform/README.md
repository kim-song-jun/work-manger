# Work Manager — Terraform Infrastructure

Terraform definitions for the AWS production stack of the Work Manager
backend / SPA. Three environments (`dev`, `stg`, `prod`) compose the same set
of nine reusable modules.

> **Reads first**: `docs/architecture/architecture.md` (§10 Infra, §11 Observability,
> §13 Capacity Plan) and `docs/operations/operations-guide.md` (§1, §6–§11).
> The IaC encodes those constraints — change those docs first if you need to
> change a knob.

---

## 1. Layout

```
infra/terraform/
├── README.md                ← this file
├── modules/
│   ├── network/             VPC, 3 public + 3 private + 3 isolated subnets, NAT, RTs
│   ├── ecs/                 ECS Fargate cluster, services (api/ws/worker/beat), task defs, ECR repos, autoscaling
│   ├── rds/                 PG16 (multi-AZ optional, replica optional), KMS, parameter group, enhanced monitoring
│   ├── elasticache/         Redis 7 replication group, TLS + AUTH, parameter group (allkeys-lru)
│   ├── s3-cdn/              SPA bucket (private), CloudFront + OAC, response headers (HSTS), Route53 alias
│   ├── alb/                 ALB + 2 target groups (api 4455, ws 4456 with stickiness), HTTP→HTTPS redirect, WAFv2 baseline
│   ├── secrets/             Secrets Manager entries (DB, Django, JWT, FCM, APNs, OAuth, Redis AUTH)
│   ├── observability/       CloudWatch log groups + metric filters + alarms, SNS topic
│   └── route53/             Hosted-zone helper (lookup or create)
└── envs/
    ├── dev/
    ├── stg/
    └── prod/
```

Each `envs/<env>/` directory holds:
* `main.tf` — composes the modules with env-specific sizing.
* `variables.tf` — required runtime inputs (image URI, ACM ARNs, etc.).
* `terraform.tfvars` — committed defaults (placeholders for secrets / domain).
* `backend.tf` — S3 + DynamoDB remote state (values supplied at `init` time).
* `outputs.tf` — only the values consumed by CI / ops dashboards.

---

## 2. Prereqs

| Tool | Min version | Notes |
|---|---|---|
| Terraform | `>= 1.9.0` | Pinned in every `terraform { required_version }` block. |
| AWS CLI v2 | latest | One named profile per env (`molcube-dev`, `molcube-stg`, `molcube-prod`). |
| jq | any | Used in the bootstrap snippets below. |

Configure profiles:

```bash
aws configure --profile molcube-dev
aws configure --profile molcube-stg
aws configure --profile molcube-prod
```

---

## 3. State backend bootstrap (one-time per AWS account)

The S3 bucket and DynamoDB lock table are **not managed by these stacks** — they
must exist before the first `terraform init`. Create them once per account:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile molcube-prod)
REGION=ap-northeast-2

aws s3api create-bucket \
  --bucket "wm-tfstate-${ACCOUNT_ID}" \
  --region "${REGION}" \
  --create-bucket-configuration "LocationConstraint=${REGION}" \
  --profile molcube-prod

aws s3api put-bucket-versioning \
  --bucket "wm-tfstate-${ACCOUNT_ID}" \
  --versioning-configuration Status=Enabled \
  --profile molcube-prod

aws s3api put-bucket-encryption \
  --bucket "wm-tfstate-${ACCOUNT_ID}" \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' \
  --profile molcube-prod

aws s3api put-public-access-block \
  --bucket "wm-tfstate-${ACCOUNT_ID}" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
  --profile molcube-prod

aws dynamodb create-table \
  --table-name wm-tfstate-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "${REGION}" \
  --profile molcube-prod
```

Then init each env (substitute `<account-id>`):

```bash
cd infra/terraform/envs/dev
terraform init \
  -backend-config="bucket=wm-tfstate-<account-id>" \
  -backend-config="dynamodb_table=wm-tfstate-lock" \
  -backend-config="region=ap-northeast-2" \
  -backend-config="key=envs/dev/terraform.tfstate"
```

---

## 4. Per-env workflow

```bash
export AWS_PROFILE=molcube-dev          # match the env

cd infra/terraform/envs/dev
terraform init -backend-config=...      # see section 3 above
terraform plan -var-file=terraform.tfvars -out plan.tfplan
terraform apply plan.tfplan
```

After `apply`, populate the placeholder Secrets Manager values via the CLI
(never commit real secrets):

```bash
SECRET_PREFIX="wm-dev"
aws secretsmanager put-secret-value \
  --secret-id "${SECRET_PREFIX}/db_password" \
  --secret-string "$(jq -n --arg p "$(openssl rand -base64 32)" '{password:$p}')"
aws secretsmanager put-secret-value \
  --secret-id "${SECRET_PREFIX}/django_secret" \
  --secret-string "$(jq -n --arg s "$(openssl rand -base64 50)" '{secret:$s}')"
aws secretsmanager put-secret-value \
  --secret-id "${SECRET_PREFIX}/jwt_signing_key" \
  --secret-string "$(jq -n --arg k "$(openssl rand -base64 64)" '{key:$k}')"
aws secretsmanager put-secret-value \
  --secret-id "${SECRET_PREFIX}/redis_auth_token" \
  --secret-string "$(jq -n --arg t "$(openssl rand -base64 32)" '{auth_token:$t}')"
# fcm_credentials, apns_credentials, oauth_clients: provider-specific JSON blobs
```

Re-run `terraform apply` after first secret population so RDS / ElastiCache
pick up real values.

### Rotation cadence (per `operations-guide.md` §8.1)

| Secret | Rotation | Notes |
|---|---|---|
| `db_password` | 12 mo | Update Secrets Manager → restart ECS services |
| `django_secret` | 12 mo | Plan window; sessions invalidated |
| `jwt_signing_key` | 6 mo | Dual-key window (1 wk) — old key still verifies |
| `fcm_credentials` | 6 mo | Per FCM project policy |
| `apns_credentials` | 6 mo | Apple key rotation |
| `oauth_clients` | 12 mo | Coordinated with downstream apps |
| `redis_auth_token` | 12 mo | Use `MODIFY` with `auth_token_update_strategy=ROTATE` |

---

## 5. Destroy

```bash
cd infra/terraform/envs/dev
terraform destroy -var-file=terraform.tfvars
```

Notes:
* `prod` has `deletion_protection=true` on RDS and the ALB. Lift it
  with a targeted `terraform apply` first; never disable it casually.
* S3 buckets in `prod` skip `force_destroy` — empty manually before destroy.
* ECR repos with `IMMUTABLE` tags must be emptied (CI artifacts) before destroy.

### Fork from snapshot (rebuild stg from prod data)

1. In the **prod** account, snapshot the RDS instance:
   `aws rds create-db-snapshot --db-instance-identifier wm-prod-pg-primary --db-snapshot-identifier wm-fork-$(date +%F)`
2. Share the snapshot with the **stg** account if accounts differ
   (`modify-db-snapshot-attribute`).
3. In stg, restore manually the first time:
   `aws rds restore-db-instance-from-db-snapshot --db-instance-identifier wm-stg-pg-fork --db-snapshot-identifier wm-fork-...`
4. Update `envs/stg/main.tf` to point the `rds` module at the restored
   instance (use `terraform import` on `module.rds.aws_db_instance.primary`).
5. Run masking SQL (see `operations-guide.md` §1) before any service connects.

---

## 6. Cost estimate (rough monthly, USD, ap-northeast-2 list price)

> Excludes data transfer (CloudFront / ALB egress), Secrets Manager API calls,
> and CloudWatch log ingestion past the free tier. Use the AWS Pricing
> Calculator for binding numbers.

| Component | dev | stg | prod |
|---|---:|---:|---:|
| ECS Fargate (api/ws/worker/beat) | ~$60 | ~$160 | ~$320 |
| RDS PG16 (db.t4g.medium → t4g.large + replica) | ~$70 | ~$310 | ~$320 |
| ElastiCache Redis (t4g.small → t4g.medium × 2) | ~$25 | ~$95 | ~$95 |
| ALB | ~$20 | ~$25 | ~$30 |
| NAT Gateway (1 → 3 AZ) | ~$35 | ~$105 | ~$105 |
| S3 + CloudFront (1 TB / mo egress, prod) | ~$5 | ~$15 | ~$95 |
| Route53 hosted zone | ~$1 | ~$1 | ~$1 |
| CloudWatch (logs + alarms + dashboards) | ~$10 | ~$25 | ~$60 |
| KMS (CMKs for RDS / Secrets) | ~$3 | ~$3 | ~$5 |
| **Subtotal** | **~$230** | **~$740** | **~$1,030** |

`prod` excludes WAF (~$5 base + ~$0.60/M req) and SES (volume-priced).

---

## 7. Out of scope / TODO

* PagerDuty webhook subscription on `module.observability.sns_topic_arn` —
  add once the integration key is available.
* Real ACM certificate ARNs (`*_acm_certificate_arn`): provision via the
  AWS console or a separate `acm` module; SPA cert must live in `us-east-1`.
* Real Route53 hosted zones: registered domain at `molcube.com` is shared
  with other systems; the helper module supports lookup-only mode by default.
* Real SPA bucket names (`spa_bucket_name`): must be globally unique;
  placeholders in `terraform.tfvars` will fail at `apply` time on purpose.
* Real AWS account IDs: never committed; supplied at `init` time as backend
  config and at deploy time via the `image_api` ECR URI.
* WAF custom rules beyond the AWS managed common ruleset — tune via
  CloudWatch sampled-requests once traffic shape is known.
