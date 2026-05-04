output "secret_arns" {
  value = {
    for k, s in aws_secretsmanager_secret.this : k => s.arn
  }
  description = "Map of category name → Secrets Manager ARN."
}

output "db_password_arn" {
  value       = aws_secretsmanager_secret.this["db_password"].arn
  description = "DB password secret ARN (consumed by rds module)."
}

output "redis_auth_token_arn" {
  value       = aws_secretsmanager_secret.this["redis_auth_token"].arn
  description = "Redis auth token secret ARN (consumed by elasticache module)."
}

output "all_secret_arns_list" {
  value       = [for s in aws_secretsmanager_secret.this : s.arn]
  description = "Flat list of all secret ARNs (for IAM policy resource lists)."
}
