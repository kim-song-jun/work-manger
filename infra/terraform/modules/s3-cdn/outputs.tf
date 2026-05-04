output "bucket_name" {
  value       = aws_s3_bucket.spa.id
  description = "S3 bucket name (CI sync target)."
}

output "bucket_arn" {
  value       = aws_s3_bucket.spa.arn
  description = "S3 bucket ARN."
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.spa.domain_name
  description = "Default CloudFront domain (e.g. d111.cloudfront.net)."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.spa.id
  description = "CloudFront distribution ID (CI cache invalidation target)."
}

output "cloudfront_arn" {
  value       = aws_cloudfront_distribution.spa.arn
  description = "CloudFront distribution ARN."
}
