region = "ap-northeast-2"

# PROD: ops fills these in. Defaults are intentional `PLACEHOLDER` so plan
# fails loudly until real values are set out-of-band.
spa_bucket_name  = ""
account_id_short = "PLACEHOLDER" # last-6 of AWS account ID

route53_zone_name = "PLACEHOLDER" # e.g. "work-manager.molcube.com"
api_record_name   = "PLACEHOLDER" # e.g. "api.work-manager.molcube.com"
spa_record_name   = "PLACEHOLDER" # e.g. "app.work-manager.molcube.com"

spa_domain_aliases = [] # populate after route53_zone_name is real

spa_acm_certificate_arn = ""
alb_acm_certificate_arn = ""

image_api = "PLACEHOLDER.dkr.ecr.ap-northeast-2.amazonaws.com/work-manager/api:prod"

alert_emails           = [] # e.g. ["sre@molcube.com", "oncall@molcube.com"]
pagerduty_endpoint_url = "" # see README §8

enable_waf                  = true
waf_geo_block_country_codes = []
waf_enable_bot_control      = false
