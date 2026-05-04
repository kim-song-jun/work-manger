output "bucket_name" {
  value       = aws_s3_bucket.updates.id
  description = "S3 bucket name (set as WM_UPDATE_BUCKET in CI release env)."
}

output "bucket_arn" {
  value       = aws_s3_bucket.updates.arn
  description = "S3 bucket ARN (use to scope the publish IAM policy)."
}

output "bucket_regional_domain_name" {
  value       = aws_s3_bucket.updates.bucket_regional_domain_name
  description = "Regional bucket DNS — useful for direct S3 SigV4 update fetches when CF is disabled."
}

output "cf_domain" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.updates[0].domain_name : null
  description = "CloudFront distribution domain (null when disabled)."
}

output "cf_distribution_id" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.updates[0].id : null
  description = "CloudFront distribution ID (for cache-invalidation post-publish)."
}

output "cf_arn" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.updates[0].arn : null
  description = "CloudFront distribution ARN."
}
