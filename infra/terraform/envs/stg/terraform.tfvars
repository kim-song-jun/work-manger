region = "ap-northeast-2"

spa_bucket_name = "wm-stg-spa-PLACEHOLDER"

spa_domain_aliases      = []  # e.g. ["app.stg.work-manager.molcube.com"]
spa_acm_certificate_arn = ""  # us-east-1 ACM cert ARN for SPA aliases
alb_acm_certificate_arn = ""  # ap-northeast-2 ACM cert ARN for ALB

route53_zone_name = ""        # e.g. "stg.work-manager.molcube.com"
api_record_name   = ""        # e.g. "api.stg.work-manager.molcube.com"

image_api = "PLACEHOLDER.dkr.ecr.ap-northeast-2.amazonaws.com/work-manager/api:stg"

alert_emails = []  # e.g. ["sre@molcube.com"]
