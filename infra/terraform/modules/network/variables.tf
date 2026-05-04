variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "vpc_cidr" {
  type        = string
  description = "Primary CIDR block for the VPC."
  default     = "10.40.0.0/16"
}

variable "azs" {
  type        = list(string)
  description = "List of three AZs to span subnets across."
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "Three /24 CIDRs for ALB / NAT public subnets."
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "Three /24 CIDRs for ECS task private subnets."
}

variable "db_subnet_cidrs" {
  type        = list(string)
  description = "Three /24 CIDRs for isolated DB / ElastiCache subnets."
}

variable "single_nat_gateway" {
  type        = bool
  description = "If true, use one NAT GW (cheaper, single AZ outage risk)."
  default     = false
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
