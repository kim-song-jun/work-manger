# See ../dev/backend.tf for full bootstrap instructions.
#
#   terraform init \
#     -backend-config="bucket=wm-tfstate-<account-id>" \
#     -backend-config="dynamodb_table=wm-tfstate-lock" \
#     -backend-config="region=ap-northeast-2" \
#     -backend-config="key=envs/prod/terraform.tfstate"

terraform {
  backend "s3" {
    key     = "envs/prod/terraform.tfstate"
    region  = "ap-northeast-2"
    encrypt = true
  }
}
