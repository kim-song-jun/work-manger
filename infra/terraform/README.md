# Work Manager — Terraform Infrastructure

Terraform definitions for the AWS production stack of the Work Manager
backend / SPA. Three environments (`dev`, `stg`, `prod`) compose the same set
of eleven reusable modules.

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
│   ├── alb/                 ALB + 2 target groups (api 4455, ws 4456 with stickiness), HTTP→HTTPS redirect
│   ├── secrets/             Secrets Manager entries (DB, Django, JWT, FCM, APNs, OAuth, Redis AUTH)
│   ├── observability/       CloudWatch log groups + metric filters + alarms, SNS topic, PagerDuty hook
│   ├── route53/             Hosted-zone helper (lookup or create) + API/SPA alias records
│   ├── waf/                 WAFv2 web ACL — managed rules + per-IP rate limit + optional geo / bot-control
│   └── acm/                 ACM certs in two regions (regional for ALB, us-east-1 for CloudFront) with DNS validation
└── envs/
    ├── dev/
    ├── stg/
    └── prod/
```

Each `envs/<env>/` directory holds:
* `main.tf` — composes the modules with env-specific sizing.
* `providers.tf` — `aws.regional` (ap-northeast-2) + `aws.us_east_1` aliases for cross-region resources (ACM CloudFront).
* `variables.tf` — required runtime inputs (image URI, etc.).
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
| WAFv2 (web ACL + 2 managed rule groups) | n/a | ~$10 | ~$10 |
| ACM certs (DNS-validated, no charge) | $0 | $0 | $0 |
| **Subtotal** | **~$230** | **~$750** | **~$1,040** |

`prod` excludes per-million-request WAF charges (~$0.60/M req) and SES (volume-priced).

---

## 7. Per-env apply order

The modules have implicit dependencies but a clean apply ordering for first
provisioning is:

1. `network` → `secrets`
2. `route53` (zone lookup) → `acm` (issues certs, DNS-validated against the zone)
3. `alb` → `s3_cdn` (consume the regional + us-east-1 cert ARNs respectively)
4. `ecs` (registers with ALB target groups)
5. `rds`, `elasticache`
6. `observability` (creates SNS, optional WAF log group)
7. `waf` (associates web ACL with the ALB; logging needs the obs log group)

Terraform's graph handles all of this — listed here for human ops sanity.

---

## 8. WAF + PagerDuty + ACM

### 8.1 WAFv2 rules

`module.waf` attaches a regional WAFv2 web ACL to the ALB. Default action is
`ALLOW`; rules block per the table below.

| Pri | Rule name | Type | Default behaviour |
|---:|---|---|---|
| 0 | `AWSManagedRulesCommonRuleSet` | Managed (AWS) | OWASP top-10 baseline (XSS, SQLi, LFI, etc.) |
| 1 | `AWSManagedRulesKnownBadInputsRuleSet` | Managed (AWS) | Known exploit payloads (Log4Shell, etc.) |
| 2 | `RateLimitAuth` | Rate-based | 60 req / 5 min / IP for `/v1/auth/*` (configurable via `var.waf_rate_limit_auth` if needed; default constant in module) |
| 3 | `RateLimitGlobal` | Rate-based | 1200 req / 5 min / IP for everything else (≈ 4 rps; matches `docs/api/api-spec.md` §0.7 inverted to 5-min window) |
| 4 | `GeoBlock` | Geo match | **disabled by default** — set `waf_geo_block_country_codes = ["XX", "YY"]` per env to enable |
| 5 | `AWSManagedRulesBotControlRuleSet` | Managed (AWS) | **disabled by default** — set `waf_enable_bot_control = true` per env. Adds ~$10/mo + per-million-request charges |

WAF logs flow to a CloudWatch log group named `aws-waf-logs-wm-<env>` created
by the observability module when `var.enable_waf = true`. The
`Authorization` and `Cookie` request headers are **redacted** in logs (PII /
token leakage prevention).

**Cost**: managed rule sets are ~$1/mo each + $0.60 per million WCUs. Two
managed groups + 2 rate-based rules ≈ $5–10/mo baseline. Bot control adds
~$10/mo + per-request fees.

### 8.2 ACM certificate validation flow

`module.acm` issues two certificates per env:

* **ALB cert** in the regional provider (ap-northeast-2) for HTTPS termination on the ALB.
* **CloudFront cert** in the us-east-1 provider (CloudFront's hard requirement).

Both use **DNS validation** against the Route53 zone passed as `zone_id`:

1. `aws_acm_certificate` requests the cert in the appropriate region.
2. `aws_route53_record` (`for_each` over `domain_validation_options`) writes the validation `_acme-challenge`-style CNAME records to the zone.
3. `aws_acm_certificate_validation` blocks until ACM observes the records and marks the cert `ISSUED`.

Operators do nothing manual — the validation happens during `terraform apply`
provided the Route53 zone is reachable from ACM (i.e. the zone is the
authoritative one, not a private/forwarded copy).

If `var.zone_id == ""` or the relevant `*_domain_name` is empty, the cert
resources are skipped (`count = 0`) and the ALB / CloudFront fall back to
the legacy `var.alb_acm_certificate_arn` / `var.spa_acm_certificate_arn`
inputs (or no HTTPS at all).

### 8.3 PagerDuty integration — step by step

1. In PagerDuty, create (or open) a **Service** → **Integrations** tab → **Add an integration**.
2. Choose **Amazon CloudWatch** (uses the Events API v1) or **Events API V2**
   depending on your account tier. Both produce an HTTPS endpoint URL of the
   form `https://events.pagerduty.com/integration/<integration-key>/enqueue`.
3. Copy the URL.
4. Set `pagerduty_endpoint_url` per env (recommended via a CI secret →
   `-var pagerduty_endpoint_url=...` rather than committing the URL):

   ```bash
   terraform apply -var-file=terraform.tfvars \
     -var "pagerduty_endpoint_url=https://events.pagerduty.com/integration/XXXX/enqueue"
   ```

5. Run `terraform apply`. The `aws_sns_topic_subscription.pagerduty` resource
   subscribes the URL to the ops SNS topic with `endpoint_auto_confirms = true`
   (PagerDuty auto-acks the SNS confirmation).
6. Trigger a synthetic alarm (e.g. `aws cloudwatch set-alarm-state --alarm-name wm-prod-alb-5xx-rate --state-value ALARM --state-reason test`) to verify a PD incident is created.

When `pagerduty_endpoint_url == ""` the resource is `count = 0` so dev/stg
without a PD subscription remain plan-clean.

### 8.4 Email subscribers

`var.alert_emails` (already wired to `module.observability`) creates one
`aws_sns_topic_subscription` per address with protocol `email`. Each
recipient must click the AWS confirmation email before they receive alerts.

### 8.5 S3 bucket naming convention

The SPA bucket name is resolved as:

* `var.spa_bucket_name` if non-empty (overrides everything), **else**
* `var.bucket_name_pattern` (default `workmanager-{env}-spa-{short}`) with
  tokens substituted: `{env}` → `dev|stg|prod`, `{short}` → `var.account_id_short`.

`account_id_short` is the **last 6 digits** of the AWS account ID, supplied
per-env via `terraform.tfvars` (or `-var` on the CLI). This keeps the bucket
name globally unique without leaking the full 12-digit account ID into VCS.

To find the value:

```bash
aws sts get-caller-identity --query Account --output text | tail -c 7
```

Set in tfvars:

```hcl
account_id_short = "123456"
```

Then the bucket name resolves to `workmanager-dev-spa-123456` etc. All
buckets created by these stacks (currently only the SPA bucket; reports-export
bucket deferred per §9) follow the same pattern.

---

## 9. Out of scope / TODO

* Reports-export S3 bucket: not yet provisioned. When added, it will reuse
  `bucket_name_pattern` from §8.5 (token `{env}-reports-{short}`).
* Real AWS account IDs: never committed; supplied at `init` time as backend
  config and at deploy time via `account_id_short` and the `image_api` ECR URI.
* Real Route53 hosted zones: registered domain at `molcube.com` is shared
  with other systems; the helper module supports lookup-only mode by default.
  Operators must own the parent zone before `acm` validation succeeds.
* WAF custom rules beyond the managed sets + rate limits — tune via
  CloudWatch sampled-requests once traffic shape is known. Geo and bot-control
  toggles already exist via `waf_geo_block_country_codes` / `waf_enable_bot_control`.
* Cross-region replication for the SPA bucket (DR) — current single-region
  setup matches the architecture's RTO/RPO targets.
