variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "kms_key_arn" {
  type        = string
  description = "Optional CMK to encrypt secrets. Empty uses aws/secretsmanager."
  default     = ""
}

variable "recovery_window_days" {
  type        = number
  description = "Days to retain a deleted secret before permanent removal (0 = immediate, allowed: 0 or 7-30)."
  default     = 30
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
