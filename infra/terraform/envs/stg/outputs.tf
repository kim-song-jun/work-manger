output "vpc_id" {
  value       = module.network.vpc_id
  description = "VPC ID."
}

output "alb_dns_name" {
  value       = module.alb.alb_dns_name
  description = "Public ALB DNS name."
}

output "ecs_cluster_name" {
  value       = module.ecs.cluster_name
  description = "ECS cluster name."
}

output "ecr_repository_urls" {
  value       = module.ecs.ecr_repository_urls
  description = "ECR repository URLs."
}

output "rds_primary_endpoint" {
  value       = module.rds.primary_endpoint
  description = "RDS writer endpoint."
}

output "rds_replica_endpoint" {
  value       = module.rds.replica_endpoint
  description = "RDS reader endpoint."
}

output "redis_primary_endpoint" {
  value       = module.elasticache.primary_endpoint
  description = "Redis writer endpoint."
}

output "spa_cloudfront_domain" {
  value       = module.s3_cdn.cloudfront_domain
  description = "CloudFront default domain for the SPA."
}

output "spa_bucket_name" {
  value       = module.s3_cdn.bucket_name
  description = "S3 bucket for the SPA."
}

output "spa_distribution_id" {
  value       = module.s3_cdn.cloudfront_distribution_id
  description = "CloudFront distribution ID."
}

output "ops_sns_topic_arn" {
  value       = module.observability.sns_topic_arn
  description = "SNS topic ARN for ops alerts."
}

output "secret_arns" {
  value       = module.secrets.secret_arns
  description = "Map of category → Secrets Manager ARN."
  sensitive   = true
}
