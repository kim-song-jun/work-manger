variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "vpc_id" {
  type        = string
  description = "VPC the ALB lives in."
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnets for the ALB (one per AZ)."
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN (regional, must match ALB region) for HTTPS listener. Empty disables HTTPS."
  default     = ""
}

variable "api_port" {
  type        = number
  description = "API container port."
  default     = 4455
}

variable "ws_port" {
  type        = number
  description = "WebSocket (Daphne) container port."
  default     = 4456
}

variable "api_health_path" {
  type        = string
  description = "Health check path for API target group."
  default     = "/v1/health"
}

variable "ws_health_path" {
  type        = string
  description = "Health check path for WS target group."
  default     = "/v1/health"
}

variable "enable_waf" {
  type        = bool
  description = "If true, attach a baseline WAFv2 web ACL (managed common rule set)."
  default     = false
}

variable "access_logs_bucket" {
  type        = string
  description = "S3 bucket for ALB access logs (must already exist with required policy). Empty disables logging."
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
