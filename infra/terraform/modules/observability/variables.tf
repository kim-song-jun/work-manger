variable "env" {
  type        = string
  description = "Environment name."
}

variable "alert_emails" {
  type        = list(string)
  description = "Email subscribers for the SNS ops alerts topic. Each address must confirm the subscription via the AWS-sent email."
  default     = []
}

variable "pagerduty_endpoint_url" {
  type        = string
  description = "PagerDuty Events API URL (https://events.pagerduty.com/integration/<key>/enqueue). Empty disables PD subscription. See README §8."
  default     = ""
  sensitive   = true
}

variable "create_waf_log_group" {
  type        = bool
  description = "If true, create a CloudWatch log group named `aws-waf-logs-wm-<env>` for WAFv2 logging. Required if WAF logging is enabled."
  default     = false
}

variable "alb_arn_suffix" {
  type        = string
  description = "ALB ARN suffix (e.g. `app/wm-prod-alb/abc123`) — taken from `aws_lb.this.arn_suffix`."
}

variable "api_target_group_arn_suffix" {
  type        = string
  description = "API target group ARN suffix (`aws_lb_target_group.api.arn_suffix`)."
}

variable "rds_instance_id" {
  type        = string
  description = "RDS DB identifier (e.g. wm-prod-pg-primary)."
}

variable "redis_replication_group_id" {
  type        = string
  description = "ElastiCache replication group ID."
}

variable "ecs_cluster_name" {
  type        = string
  description = "ECS cluster name (for service-level alarms)."
}

variable "ecs_api_service_name" {
  type        = string
  description = "ECS API service name."
}

variable "p95_latency_threshold_seconds" {
  type        = number
  description = "P95 latency SLO threshold in seconds (300ms = 0.3)."
  default     = 0.3
}

variable "rds_cpu_threshold_pct" {
  type        = number
  description = "RDS CPU alarm threshold (%)."
  default     = 70
}

variable "redis_evictions_threshold" {
  type        = number
  description = "Redis evictions per 5min alarm threshold."
  default     = 1000
}

variable "replica_lag_threshold_seconds" {
  type        = number
  description = "RDS replica lag alarm threshold (seconds)."
  default     = 30
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
