region = "ap-northeast-2"

spa_bucket_name  = ""
account_id_short = "PLACEHOLDER" # last-6 of AWS account ID

route53_zone_name = "stg.work-manager.molcube.com"
api_record_name   = "api.stg.work-manager.molcube.com"
spa_record_name   = "app.stg.work-manager.molcube.com"

spa_domain_aliases = ["app.stg.work-manager.molcube.com"]

spa_acm_certificate_arn = ""
alb_acm_certificate_arn = ""

image_api = "PLACEHOLDER.dkr.ecr.ap-northeast-2.amazonaws.com/work-manager/api:stg"

alert_emails           = []
pagerduty_endpoint_url = ""

enable_waf                  = true
waf_geo_block_country_codes = []
waf_enable_bot_control      = false
