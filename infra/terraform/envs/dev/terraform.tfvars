region = "ap-northeast-2"

# Operators must override these before `terraform apply`. Defaults are
# intentionally placeholder values so plans show diffs at first use.
spa_bucket_name = "wm-dev-spa-PLACEHOLDER"

# Custom domain wiring (optional in dev).
spa_domain_aliases      = []  # e.g. ["app.dev.work-manager.molcube.com"]
spa_acm_certificate_arn = ""  # us-east-1 ACM cert ARN for the SPA aliases
alb_acm_certificate_arn = ""  # ap-northeast-2 ACM cert ARN for the ALB

route53_zone_name = ""        # e.g. "dev.work-manager.molcube.com"
api_record_name   = ""        # e.g. "api.dev.work-manager.molcube.com"

# CI overrides this with the digest for each deploy.
image_api = "PLACEHOLDER.dkr.ecr.ap-northeast-2.amazonaws.com/work-manager/api:dev"

alert_emails = []  # e.g. ["sre@molcube.com"]
