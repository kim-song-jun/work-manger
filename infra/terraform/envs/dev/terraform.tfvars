region = "ap-northeast-2"

# SPA bucket: leave empty to derive from pattern (`workmanager-dev-spa-<short>`).
# Requires `account_id_short` (last-6 of AWS account ID, supplied via env-specific
# tfvars or -var on the CLI; never hardcode the full account ID in VCS).
spa_bucket_name  = ""
account_id_short = "PLACEHOLDER" # last-6 of AWS account ID — set per operator

# DNS — concrete dev defaults. Operators must own the parent zone first.
route53_zone_name = "dev.work-manager.molcube.com"
api_record_name   = "api.dev.work-manager.molcube.com"
spa_record_name   = "app.dev.work-manager.molcube.com"

spa_domain_aliases = ["app.dev.work-manager.molcube.com"]

# ACM certs — set both to empty when relying on module.acm to issue them.
spa_acm_certificate_arn = ""
alb_acm_certificate_arn = ""

# CI overrides this with the digest for each deploy.
image_api = "PLACEHOLDER.dkr.ecr.ap-northeast-2.amazonaws.com/work-manager/api:dev"

# Alerting
alert_emails           = []   # e.g. ["sre@molcube.com"]
pagerduty_endpoint_url = ""   # see README §8 — leave empty in dev

# WAF — off by default in dev (save ~$5-15/mo). Flip to true to test.
enable_waf                  = false
waf_geo_block_country_codes = []
waf_enable_bot_control      = false
