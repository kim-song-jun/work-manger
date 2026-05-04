output "alb_certificate_arn" {
  value       = try(aws_acm_certificate_validation.alb[0].certificate_arn, "")
  description = "Validated ACM certificate ARN for the ALB (regional). Empty if not enabled."
}

output "cloudfront_certificate_arn" {
  value       = try(aws_acm_certificate_validation.cloudfront[0].certificate_arn, "")
  description = "Validated ACM certificate ARN for CloudFront (us-east-1). Empty if not enabled."
}
