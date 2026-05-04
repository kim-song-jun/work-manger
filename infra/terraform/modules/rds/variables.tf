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
  description = "Subnet IDs for the DB subnet group (isolated subnets, ≥2 AZs)."
}

variable "ingress_security_group_ids" {
  type        = list(string)
  description = "Security groups allowed to reach RDS:5432 (api, ws, worker, beat tasks)."
}

variable "instance_class" {
  type        = string
  description = "RDS instance class (e.g. db.t4g.medium, db.t4g.large, db.r6g.xlarge)."
}

variable "allocated_storage_gb" {
  type        = number
  description = "Initial allocated storage (GB)."
  default     = 50
}

variable "max_allocated_storage_gb" {
  type        = number
  description = "Upper bound for autoscaling storage (GB). Set equal to allocated to disable."
  default     = 200
}

variable "multi_az" {
  type        = bool
  description = "Enable Multi-AZ deployment for the primary."
  default     = false
}

variable "create_replica" {
  type        = bool
  description = "Create one read replica."
  default     = false
}

variable "backup_retention_days" {
  type        = number
  description = "Automated backup retention period (days)."
  default     = 7
}

variable "deletion_protection" {
  type        = bool
  description = "Block accidental deletion."
  default     = true
}

variable "engine_version" {
  type        = string
  description = "PostgreSQL engine version."
  default     = "16.4"
}

variable "db_name" {
  type        = string
  description = "Initial database name."
  default     = "work_manager"
}

variable "db_username" {
  type        = string
  description = "Master username."
  default     = "wm_admin"
}

variable "db_password_secret_arn" {
  type        = string
  description = "Secrets Manager ARN whose `password` JSON key holds the master password."
}

variable "performance_insights_enabled" {
  type        = bool
  description = "Enable RDS Performance Insights."
  default     = true
}

variable "monitoring_interval_seconds" {
  type        = number
  description = "Enhanced monitoring interval (0 disables, allowed: 1, 5, 10, 15, 30, 60)."
  default     = 60
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
