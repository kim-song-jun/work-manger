output "vpc_id" {
  value       = aws_vpc.this.id
  description = "ID of the VPC."
}

output "vpc_cidr" {
  value       = aws_vpc.this.cidr_block
  description = "CIDR of the VPC."
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "IDs of the public subnets (ALB, NAT)."
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "IDs of the private subnets (ECS tasks)."
}

output "db_subnet_ids" {
  value       = aws_subnet.db[*].id
  description = "IDs of the isolated DB subnets (RDS, ElastiCache)."
}

output "azs" {
  value       = var.azs
  description = "Availability zones used."
}
