output "primary_endpoint" {
  value       = aws_elasticache_replication_group.this.primary_endpoint_address
  description = "Primary endpoint (writer) hostname."
}

output "reader_endpoint" {
  value       = aws_elasticache_replication_group.this.reader_endpoint_address
  description = "Reader endpoint hostname (load-balances replicas)."
}

output "port" {
  value       = aws_elasticache_replication_group.this.port
  description = "Redis port (6379)."
}

output "security_group_id" {
  value       = aws_security_group.redis.id
  description = "Redis security group ID."
}

output "replication_group_id" {
  value       = aws_elasticache_replication_group.this.id
  description = "Replication group ID."
}
