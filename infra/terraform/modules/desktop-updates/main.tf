terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.60.0"
    }
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# desktop-updates: S3 bucket + (optional) CloudFront distribution that serves
# Electron auto-update artifacts (latest.yml / latest-mac.yml / *.exe / *.dmg /
# *.AppImage / *.zip). The bucket is private; the CI publish role uses SigV4
# (electron-builder S3 provider). Reads at runtime go through CloudFront with
# OAC for low-latency download from KR/JP, OR direct via electron-updater's
# S3 SigV4 signing if `enable_cloudfront = false`.
# ─────────────────────────────────────────────────────────────────────────────

locals {
  name_prefix = "workmanager-desktop-updates-${var.env}"
  resolved_bucket_name = var.bucket_name != "" ? var.bucket_name : (
    var.account_id_short != ""
    ? "${local.name_prefix}-${var.account_id_short}"
    : local.name_prefix
  )
}

resource "aws_s3_bucket" "updates" {
  bucket        = local.resolved_bucket_name
  force_destroy = var.env != "prod"
  tags          = merge(var.tags, { Name = local.resolved_bucket_name, Purpose = "desktop-auto-update" })
}

resource "aws_s3_bucket_public_access_block" "updates" {
  bucket                  = aws_s3_bucket.updates.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "updates" {
  bucket = aws_s3_bucket.updates.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "updates" {
  bucket = aws_s3_bucket.updates.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "updates" {
  bucket = aws_s3_bucket.updates.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_retention_days
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  # Optional: prune older release artifacts after `release_retention_days`.
  # Manifest files (latest*.yml) are tiny — keep forever via the prefix filter.
  dynamic "rule" {
    for_each = var.release_retention_days > 0 ? [1] : []
    content {
      id     = "prune-old-installers"
      status = "Enabled"
      filter {
        and {
          prefix = "desktop/"
          tags   = {}
        }
      }
      expiration {
        days = var.release_retention_days
      }
    }
  }
}

# CORS so renderer-side update probes (if any) work cross-origin during dev.
resource "aws_s3_bucket_cors_configuration" "updates" {
  bucket = aws_s3_bucket.updates.id

  cors_rule {
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 300
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# CloudFront (optional). When enabled the bucket is fronted by an OAC-protected
# distribution — clients fetch update manifests + binaries over HTTPS from the
# nearest edge, and the bucket policy denies everything except the CF principal
# + the publish IAM principal.
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "updates" {
  count                             = var.enable_cloudfront ? 1 : 0
  name                              = "${local.name_prefix}-oac"
  description                       = "OAC for desktop auto-update bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "updates" {
  count               = var.enable_cloudfront ? 1 : 0
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${local.name_prefix} (desktop auto-update CDN)"
  price_class         = var.price_class
  http_version        = "http2and3"
  aliases             = var.cloudfront_aliases

  origin {
    domain_name              = aws_s3_bucket.updates.bucket_regional_domain_name
    origin_id                = "updates-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.updates[0].id
  }

  default_cache_behavior {
    target_origin_id       = "updates-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Manifests must NOT be cached aggressively — clients poll latest.yml.
    min_ttl     = 0
    default_ttl = 60
    max_ttl     = 300

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # Long-lived cache for the actual installer artifacts (immutable per version).
  ordered_cache_behavior {
    path_pattern           = "*.exe"
    target_origin_id       = "updates-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    min_ttl                = 86400
    default_ttl            = 86400 * 30
    max_ttl                = 86400 * 365
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }
  ordered_cache_behavior {
    path_pattern           = "*.dmg"
    target_origin_id       = "updates-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    min_ttl                = 86400
    default_ttl            = 86400 * 30
    max_ttl                = 86400 * 365
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }
  ordered_cache_behavior {
    path_pattern           = "*.zip"
    target_origin_id       = "updates-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    min_ttl                = 86400
    default_ttl            = 86400 * 30
    max_ttl                = 86400 * 365
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }
  ordered_cache_behavior {
    path_pattern           = "*.AppImage"
    target_origin_id       = "updates-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    min_ttl                = 86400
    default_ttl            = 86400 * 30
    max_ttl                = 86400 * 365
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.acm_certificate_arn == ""
    acm_certificate_arn            = var.acm_certificate_arn != "" ? var.acm_certificate_arn : null
    ssl_support_method             = var.acm_certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = var.acm_certificate_arn != "" ? "TLSv1.2_2021" : "TLSv1"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-cf" })
}

# ─────────────────────────────────────────────────────────────────────────────
# Bucket policy: allow CloudFront OAC (if enabled) + the publish principal.
# ─────────────────────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "updates" {
  # CloudFront OAC read access (only if CF is enabled).
  dynamic "statement" {
    for_each = var.enable_cloudfront ? [1] : []
    content {
      sid     = "AllowCloudFrontOAC"
      effect  = "Allow"
      actions = ["s3:GetObject"]
      resources = ["${aws_s3_bucket.updates.arn}/*"]

      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }

      condition {
        test     = "StringEquals"
        variable = "AWS:SourceArn"
        values   = [aws_cloudfront_distribution.updates[0].arn]
      }
    }
  }

  # CI publish principal — full read + write to the desktop/ prefix.
  dynamic "statement" {
    for_each = length(var.publish_principal_arns) > 0 ? [1] : []
    content {
      sid    = "AllowPublishCIWrite"
      effect = "Allow"
      actions = [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:AbortMultipartUpload",
      ]
      resources = [
        aws_s3_bucket.updates.arn,
        "${aws_s3_bucket.updates.arn}/*",
      ]
      principals {
        type        = "AWS"
        identifiers = var.publish_principal_arns
      }
    }
  }
}

resource "aws_s3_bucket_policy" "updates" {
  count  = var.enable_cloudfront || length(var.publish_principal_arns) > 0 ? 1 : 0
  bucket = aws_s3_bucket.updates.id
  policy = data.aws_iam_policy_document.updates.json
}
