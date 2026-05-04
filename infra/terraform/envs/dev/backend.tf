# Remote state backend.
#
# Bootstrap the bucket / lock table once per AWS account before running
# `terraform init`:
#
#   aws s3api create-bucket --bucket wm-tfstate-<account-id> \
#     --region ap-northeast-2 \
#     --create-bucket-configuration LocationConstraint=ap-northeast-2
#   aws s3api put-bucket-versioning --bucket wm-tfstate-<account-id> \
#     --versioning-configuration Status=Enabled
#   aws s3api put-bucket-encryption --bucket wm-tfstate-<account-id> \
#     --server-side-encryption-configuration '{
#       "Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]
#     }'
#   aws dynamodb create-table --table-name wm-tfstate-lock \
#     --attribute-definitions AttributeName=LockID,AttributeType=S \
#     --key-schema AttributeName=LockID,KeyType=HASH \
#     --billing-mode PAY_PER_REQUEST --region ap-northeast-2
#
# Then init with explicit backend config (do NOT commit the account ID):
#
#   terraform init \
#     -backend-config="bucket=wm-tfstate-<account-id>" \
#     -backend-config="dynamodb_table=wm-tfstate-lock" \
#     -backend-config="region=ap-northeast-2" \
#     -backend-config="key=envs/dev/terraform.tfstate"

terraform {
  backend "s3" {
    # Values supplied via `terraform init -backend-config=...` (see comment above).
    # Hardcoded keys here serve only as documentation defaults.
    key     = "envs/dev/terraform.tfstate"
    region  = "ap-northeast-2"
    encrypt = true
  }
}
