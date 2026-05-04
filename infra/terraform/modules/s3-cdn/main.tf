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
  name_prefix         = "wm-${var.env}"
  use_custom_domain   = var.acm_certificate_arn != "" && length(var.domain_aliases) > 0
  create_route53_alis = var.route53_zone_id != "" && local.use_custom_domain

  # Resolve bucket name: explicit `bucket_name` wins; otherwise expand the
  # pattern. Pattern tokens are `{env}` and `{short}`. Operators must supply
  # `account_id_short` per-env via tfvars (last-6 digits of AWS account ID).
  resolved_bucket_name = var.bucket_name != "" ? var.bucket_name : replace(
    replace(var.bucket_name_pattern, "{env}", var.env),
    "{short}", var.account_id_short,
  )
}

resource "aws_s3_bucket" "spa" {
  bucket        = local.resolved_bucket_name
  force_destroy = var.env != "prod"
  tags          = merge(var.tags, { Name = local.resolved_bucket_name })
}

resource "aws_s3_bucket_public_access_block" "spa" {
  bucket                  = aws_s3_bucket.spa.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "spa" {
  bucket = aws_s3_bucket.spa.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "spa" {
  bucket = aws_s3_bucket.spa.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "spa" {
  bucket = aws_s3_bucket.spa.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_cloudfront_distribution" "spa" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${local.name_prefix} SPA"
  default_root_object = "index.html"
  price_class         = var.price_class
  http_version        = "http2and3"
  aliases             = local.use_custom_domain ? var.domain_aliases : []

  origin {
    domain_name              = aws_s3_bucket.spa.bucket_regional_domain_name
    origin_id                = "spa-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.spa.id
  }

  default_cache_behavior {
    target_origin_id           = "spa-s3"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = aws_cloudfront_cache_policy.index_short.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.spa.id
    compress                   = true
  }

  ordered_cache_behavior {
    path_pattern               = "/assets/*"
    target_origin_id           = "spa-s3"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = aws_cloudfront_cache_policy.asset_long.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.spa.id
    compress                   = true
  }

  # SPA routing: 403 / 404 must serve index.html with a 200 status so the React
  # router can resolve the path client-side.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 10
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = !local.use_custom_domain
    acm_certificate_arn            = local.use_custom_domain ? var.acm_certificate_arn : null
    ssl_support_method             = local.use_custom_domain ? "sni-only" : null
    minimum_protocol_version       = local.use_custom_domain ? "TLSv1.2_2021" : "TLSv1"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-spa-cf" })
}

# OAC bucket policy: allow only this distribution to read the bucket via SigV4.
data "aws_iam_policy_document" "spa" {
  statement {
    sid     = "AllowCloudFrontOAC"
    effect  = "Allow"
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.spa.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.spa.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "spa" {
  bucket = aws_s3_bucket.spa.id
  policy = data.aws_iam_policy_document.spa.json
}

# Route53 alias records for the SPA were moved to modules/route53 (single
# owner of DNS). Pass `route53_zone_id = ""` from the env to keep this disabled.
resource "aws_route53_record" "spa_a" {
  for_each = local.create_route53_alis ? toset(var.domain_aliases) : []
  zone_id  = var.route53_zone_id
  name     = each.value
  type     = "A"
  alias {
    name                   = aws_cloudfront_distribution.spa.domain_name
    zone_id                = aws_cloudfront_distribution.spa.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "spa_aaaa" {
  for_each = local.create_route53_alis ? toset(var.domain_aliases) : []
  zone_id  = var.route53_zone_id
  name     = each.value
  type     = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.spa.domain_name
    zone_id                = aws_cloudfront_distribution.spa.hosted_zone_id
    evaluate_target_health = false
  }
}
