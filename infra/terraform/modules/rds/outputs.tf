output "primary_endpoint" {
  value       = aws_db_instance.primary.address
  description = "Primary writer endpoint hostname."
}

output "primary_arn" {
  value       = aws_db_instance.primary.arn
  description = "Primary RDS instance ARN."
}

output "replica_endpoint" {
  value       = try(aws_db_instance.replica[0].address, "")
  description = "Read replica endpoint (empty if not created)."
}

output "port" {
  value       = aws_db_instance.primary.port
  description = "Database port."
}

output "db_name" {
  value       = var.db_name
  description = "Initial database name."
}

output "security_group_id" {
  value       = aws_security_group.rds.id
  description = "RDS security group ID."
}

output "kms_key_arn" {
  value       = aws_kms_key.rds.arn
  description = "KMS key ARN encrypting RDS storage."
}
