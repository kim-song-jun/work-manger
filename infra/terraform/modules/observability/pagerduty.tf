# PagerDuty integration — wires the ops SNS topic to a PagerDuty Events API
# endpoint. Operators obtain the URL from the PagerDuty service integration
# (see README §8). The resource is created only when the URL is non-empty so
# environments without a PD account remain plan-clean.
#
# Endpoint contract: PagerDuty exposes an HTTPS Events API URL of the form
#   https://events.pagerduty.com/integration/<integration-key>/enqueue
# The SNS protocol is `https` (TLS-only).

resource "aws_sns_topic_subscription" "pagerduty" {
  count                  = var.pagerduty_endpoint_url != "" ? 1 : 0
  topic_arn              = aws_sns_topic.ops.arn
  protocol               = "https"
  endpoint               = var.pagerduty_endpoint_url
  endpoint_auto_confirms = true
  raw_message_delivery   = false
}

# WAF logs — AWS requires the log group name to start with `aws-waf-logs-`.
# Created here (not in modules/waf) because the observability module owns all
# CloudWatch log retention / cross-cutting telemetry concerns.
resource "aws_cloudwatch_log_group" "waf" {
  count             = var.create_waf_log_group ? 1 : 0
  name              = "aws-waf-logs-wm-${var.env}"
  retention_in_days = var.env == "prod" ? 30 : 14
  tags              = merge(var.tags, { Name = "wm-${var.env}-waf-log" })
}
