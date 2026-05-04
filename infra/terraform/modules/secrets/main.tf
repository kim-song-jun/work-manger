terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.60.0"
    }
  }
}

locals {
  name_prefix = "wm-${var.env}"
  kms_id      = var.kms_key_arn == "" ? null : var.kms_key_arn

  # One Secrets Manager entry per category.
  # Rotation cadence (per operations-guide §8.1):
  #   db_password           : 12 months
  #   django_secret         : 12 months
  #   jwt_signing_key       : 6 months
  #   fcm_credentials       : 6 months
  #   apns_credentials      : 6 months
  #   oauth_clients         : 12 months
  #   redis_auth_token      : 12 months
  categories = [
    "db_password",
    "django_secret",
    "jwt_signing_key",
    "fcm_credentials",
    "apns_credentials",
    "oauth_clients",
    "redis_auth_token",
  ]
}

resource "aws_secretsmanager_secret" "this" {
  for_each                = toset(local.categories)
  name                    = "${local.name_prefix}/${each.value}"
  description             = "Work Manager ${var.env} secret: ${each.value}. Rotation cadence per operations-guide §8.1."
  kms_key_id              = local.kms_id
  recovery_window_in_days = var.recovery_window_days
  tags = merge(var.tags, {
    Name     = "${local.name_prefix}-${each.value}"
    Category = each.value
  })
}

# Initial empty placeholder version so dependent modules (RDS, ECS) can resolve
# the secret immediately. Operators must overwrite via the AWS console or CLI
# before first deploy. Subsequent versions are managed out-of-band.
resource "aws_secretsmanager_secret_version" "placeholder" {
  for_each      = aws_secretsmanager_secret.this
  secret_id     = each.value.id
  secret_string = jsonencode({ placeholder = "REPLACE_ME_VIA_OPERATOR" })

  lifecycle {
    ignore_changes = [secret_string, version_stages]
  }
}
