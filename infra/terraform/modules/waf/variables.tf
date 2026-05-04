variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "alb_arn" {
  type        = string
  description = "ARN of the ALB to associate the web ACL with."
}

variable "log_group_arn" {
  type        = string
  description = "CloudWatch log group ARN for WAF logs (must start with `aws-waf-logs-`). Empty disables logging."
  default     = ""
}

variable "rate_limit_global" {
  type        = number
  description = "Per-IP request limit over a 5 min window for the whole API (matches docs/api/api-spec.md §0.7 inverted)."
  default     = 1200
}

variable "rate_limit_auth" {
  type        = number
  description = "Per-IP request limit over a 5 min window for /v1/auth/* (tighter to deter credential stuffing)."
  default     = 60
}

variable "geo_block_country_codes" {
  type        = list(string)
  description = "ISO 3166-1 alpha-2 country codes to block. Empty list disables geo blocking entirely (default)."
  default     = []
}

variable "enable_bot_control" {
  type        = bool
  description = "If true, enable AWSManagedRulesBotControlRuleSet. Adds ~$10/mo + per-million-request charges; default off."
  default     = false
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
