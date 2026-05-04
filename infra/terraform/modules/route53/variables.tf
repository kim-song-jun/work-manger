variable "env" {
  type        = string
  description = "Environment name."
}

variable "create_zone" {
  type        = bool
  description = "If true, create a new public hosted zone for `zone_name`. If false, look up existing."
  default     = false
}

variable "zone_name" {
  type        = string
  description = "Hosted zone domain (e.g. `dev.work-manager.molcube.com`). Empty disables lookup."
  default     = ""
}

variable "api_record_name" {
  type        = string
  description = "FQDN for the API record (e.g. `api.dev.work-manager.molcube.com`). Empty skips."
  default     = ""
}

variable "alb_dns_name" {
  type        = string
  description = "ALB DNS name to alias to (from alb module)."
  default     = ""
}

variable "alb_zone_id" {
  type        = string
  description = "ALB hosted zone ID (from alb module)."
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
