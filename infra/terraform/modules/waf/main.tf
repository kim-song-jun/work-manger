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
  name_prefix      = "wm-${var.env}"
  enable_geo_block = length(var.geo_block_country_codes) > 0
  enable_logging   = var.log_group_arn != ""
}

# Regional WAFv2 web ACL — attaches to the ALB.
# Default action ALLOW; block decisions are explicit per-rule.
resource "aws_wafv2_web_acl" "this" {
  name        = "${local.name_prefix}-waf"
  description = "WAF for ${local.name_prefix} ALB — managed rules + per-IP rate limit + optional geo / bot-control."
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Rule 1: AWS managed common rule set (OWASP top-10 baseline).
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 0
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-common"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: AWS managed known-bad inputs.
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 1
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3a: per-IP rate limit for /v1/auth/* — tighter cap (default 60 / 5min).
  # Evaluated before the global limit so blocks for /v1/auth/* don't burn the
  # global quota on retries.
  rule {
    name     = "RateLimitAuth"
    priority = 2
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = var.rate_limit_auth
        aggregate_key_type = "IP"
        scope_down_statement {
          byte_match_statement {
            positional_constraint = "STARTS_WITH"
            search_string         = "/v1/auth/"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-rate-auth"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3b: per-IP rate limit for everything else (default 1200 / 5min ≈ 4 rps).
  rule {
    name     = "RateLimitGlobal"
    priority = 3
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = var.rate_limit_global
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-rate-global"
      sampled_requests_enabled   = true
    }
  }

  # Rule 4: geo block — only added when var.geo_block_country_codes non-empty.
  dynamic "rule" {
    for_each = local.enable_geo_block ? [1] : []
    content {
      name     = "GeoBlock"
      priority = 4
      action {
        block {}
      }
      statement {
        geo_match_statement {
          country_codes = var.geo_block_country_codes
        }
      }
      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${local.name_prefix}-waf-geo"
        sampled_requests_enabled   = true
      }
    }
  }

  # Rule 5: bot control — opt-in (cost impact). Uses managed rule set in COUNT
  # mode initially is not the default here; we let the managed group's labels
  # decide. Operators tune by overriding the override_action via tfvars later.
  dynamic "rule" {
    for_each = var.enable_bot_control ? [1] : []
    content {
      name     = "AWSManagedRulesBotControlRuleSet"
      priority = 5
      override_action {
        none {}
      }
      statement {
        managed_rule_group_statement {
          vendor_name = "AWS"
          name        = "AWSManagedRulesBotControlRuleSet"
        }
      }
      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${local.name_prefix}-waf-bot"
        sampled_requests_enabled   = true
      }
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.name_prefix}-waf"
    sampled_requests_enabled   = true
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-waf" })
}

resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.this.arn
}

# Logging — only if a log group ARN is provided. AWS requires the log group
# name to start with `aws-waf-logs-`; observability module enforces that.
resource "aws_wafv2_web_acl_logging_configuration" "this" {
  count                   = local.enable_logging ? 1 : 0
  log_destination_configs = [var.log_group_arn]
  resource_arn            = aws_wafv2_web_acl.this.arn

  # Redact Authorization + Cookie headers from logs (PII / token leakage).
  redacted_fields {
    single_header {
      name = "authorization"
    }
  }
  redacted_fields {
    single_header {
      name = "cookie"
    }
  }
}
