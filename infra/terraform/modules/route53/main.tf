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
  has_zone = var.zone_name != ""
}

# Conditional create of a public hosted zone (off by default — assume the
# zone exists, registered separately at molcube.com level).
resource "aws_route53_zone" "this" {
  count = var.create_zone && local.has_zone ? 1 : 0
  name  = var.zone_name
  tags  = merge(var.tags, { Name = var.zone_name })
}

# Always look up the zone (data source) so `zone_id` is reliably exported
# regardless of `create_zone`. When create_zone=true we still data-lookup
# after the resource exists (depends_on guarantees ordering).
data "aws_route53_zone" "this" {
  count        = local.has_zone ? 1 : 0
  name         = var.zone_name
  private_zone = false

  depends_on = [aws_route53_zone.this]
}

locals {
  zone_id = local.has_zone ? data.aws_route53_zone.this[0].zone_id : ""
}

# API record → ALB alias.
resource "aws_route53_record" "api_alias" {
  count   = var.api_record_name != "" && var.alb_dns_name != "" ? 1 : 0
  zone_id = local.zone_id
  name    = var.api_record_name
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# SPA records → CloudFront alias (A + AAAA). Created by the s3-cdn module
# historically, but the route53 module owns DNS now so callers can disable
# the s3-cdn-side records by leaving its `route53_zone_id` empty if desired.
resource "aws_route53_record" "spa_a" {
  count   = var.spa_record_name != "" && var.cloudfront_domain_name != "" ? 1 : 0
  zone_id = local.zone_id
  name    = var.spa_record_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "spa_aaaa" {
  count   = var.spa_record_name != "" && var.cloudfront_domain_name != "" ? 1 : 0
  zone_id = local.zone_id
  name    = var.spa_record_name
  type    = "AAAA"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}
