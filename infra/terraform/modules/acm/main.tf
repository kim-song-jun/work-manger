terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = ">= 5.60.0"
      configuration_aliases = [aws.regional, aws.us_east_1]
    }
  }
}

locals {
  name_prefix      = "wm-${var.env}"
  enable_alb       = var.alb_domain_name != "" && var.zone_id != ""
  enable_cf        = var.cloudfront_domain_name != "" && var.zone_id != ""
}

# --- ALB cert (regional, ap-northeast-2) ---
resource "aws_acm_certificate" "alb" {
  count             = local.enable_alb ? 1 : 0
  provider          = aws.regional
  domain_name       = var.alb_domain_name
  subject_alternative_names = var.alb_subject_alternative_names
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-alb-cert" })
}

# DNS validation records for ALB cert (one per domain incl. SANs).
resource "aws_route53_record" "alb_validation" {
  for_each = local.enable_alb ? {
    for dvo in aws_acm_certificate.alb[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id         = var.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "alb" {
  count                   = local.enable_alb ? 1 : 0
  provider                = aws.regional
  certificate_arn         = aws_acm_certificate.alb[0].arn
  validation_record_fqdns = [for r in aws_route53_record.alb_validation : r.fqdn]
}

# --- CloudFront cert (us-east-1, required by CloudFront) ---
resource "aws_acm_certificate" "cloudfront" {
  count                     = local.enable_cf ? 1 : 0
  provider                  = aws.us_east_1
  domain_name               = var.cloudfront_domain_name
  subject_alternative_names = var.cloudfront_subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-cf-cert" })
}

resource "aws_route53_record" "cloudfront_validation" {
  for_each = local.enable_cf ? {
    for dvo in aws_acm_certificate.cloudfront[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id         = var.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "cloudfront" {
  count                   = local.enable_cf ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cloudfront[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cloudfront_validation : r.fqdn]
}
