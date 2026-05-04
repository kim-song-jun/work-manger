variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "region" {
  type        = string
  description = "AWS region (used to render log group / awslogs config)."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID."
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets for Fargate tasks (egress via NAT)."
}

variable "alb_security_group_id" {
  type        = string
  description = "ALB SG — referenced as the only ingress source for api/ws task SGs."
}

variable "api_target_group_arn" {
  type        = string
  description = "ALB target group for the api service."
}

variable "ws_target_group_arn" {
  type        = string
  description = "ALB target group for the websocket service."
}

variable "secret_arns" {
  type        = list(string)
  description = "Secrets Manager ARNs the task IAM role may read (output from secrets module)."
}

variable "kms_key_arns_for_secrets" {
  type        = list(string)
  description = "KMS key ARNs used by the above secrets (or [aws_kms_alias_default] if none)."
  default     = []
}

variable "django_settings_module" {
  type        = string
  description = "DJANGO_SETTINGS_MODULE for the env (e.g. work_manager.settings.prod)."
}

variable "image_api" {
  type        = string
  description = "Container image URI for api / ws / worker / beat (single Django image)."
}

variable "api_port" {
  type        = number
  default     = 4455
  description = "API container port."
}

variable "ws_port" {
  type        = number
  default     = 4456
  description = "WS container port."
}

variable "task_cpu_api" {
  type        = number
  description = "Fargate vCPU units for api task (256 = 0.25 vCPU)."
}

variable "task_mem_api" {
  type        = number
  description = "Fargate memory MiB for api task."
}

variable "task_cpu_ws" {
  type        = number
  description = "Fargate vCPU units for ws task."
}

variable "task_mem_ws" {
  type        = number
  description = "Fargate memory MiB for ws task."
}

variable "task_cpu_worker" {
  type        = number
  description = "Fargate vCPU units for worker task."
}

variable "task_mem_worker" {
  type        = number
  description = "Fargate memory MiB for worker task."
}

variable "task_cpu_beat" {
  type        = number
  description = "Fargate vCPU units for beat task (singleton)."
}

variable "task_mem_beat" {
  type        = number
  description = "Fargate memory MiB for beat task (singleton)."
}

variable "desired_api" {
  type        = number
  description = "Initial desired count for api service."
}

variable "desired_ws" {
  type        = number
  description = "Initial desired count for ws service."
}

variable "desired_worker" {
  type        = number
  description = "Initial desired count for worker service."
}

variable "min_api" {
  type        = number
  description = "Minimum tasks for api auto-scaling."
}

variable "max_api" {
  type        = number
  description = "Maximum tasks for api auto-scaling."
}

variable "autoscale_cpu_target" {
  type        = number
  description = "Target average CPU utilization (%) for api auto-scaling."
  default     = 60
}

variable "ecr_repos" {
  type        = list(string)
  description = "ECR repository names to create (e.g. [\"work-manager/api\", \"work-manager/web\"])."
  default     = ["work-manager/api", "work-manager/web"]
}

variable "log_retention_days" {
  type        = number
  description = "CloudWatch log retention (days)."
  default     = 30
}

variable "env_extra" {
  type        = map(string)
  description = "Additional plain (non-secret) env vars to inject into all task definitions."
  default     = {}
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
