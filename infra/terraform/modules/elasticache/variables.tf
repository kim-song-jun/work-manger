variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID."
}

variable "db_subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for the cache subnet group (isolated subnets)."
}

variable "ingress_security_group_ids" {
  type        = list(string)
  description = "Security groups allowed to reach Redis:6379."
}

variable "node_type" {
  type        = string
  description = "ElastiCache node type (e.g. cache.t4g.small, cache.t4g.medium)."
}

variable "engine_version" {
  type        = string
  description = "Redis engine version."
  default     = "7.1"
}

variable "num_cache_clusters" {
  type        = number
  description = "Number of nodes in the replication group (primary + replicas). Min 2 for failover."
  default     = 2
}

variable "automatic_failover_enabled" {
  type        = bool
  description = "Enable automatic failover (requires ≥2 nodes)."
  default     = true
}

variable "multi_az_enabled" {
  type        = bool
  description = "Place replicas in different AZs from the primary."
  default     = true
}

variable "snapshot_retention_days" {
  type        = number
  description = "Daily snapshot retention period in days."
  default     = 1
}

variable "auth_token_secret_arn" {
  type        = string
  description = "Secrets Manager ARN whose `auth_token` JSON key holds the Redis AUTH token. Empty disables AUTH."
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
