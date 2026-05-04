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

resource "aws_route53_zone" "this" {
  count = var.create_zone && local.has_zone ? 1 : 0
  name  = var.zone_name
  tags  = merge(var.tags, { Name = var.zone_name })
}

data "aws_route53_zone" "lookup" {
  count        = !var.create_zone && local.has_zone ? 1 : 0
  name         = var.zone_name
  private_zone = false
}

locals {
  zone_id = local.has_zone ? (
    var.create_zone ? aws_route53_zone.this[0].zone_id : data.aws_route53_zone.lookup[0].zone_id
  ) : ""
}

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
