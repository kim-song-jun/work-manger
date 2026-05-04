variable "region" {
  type        = string
  description = "AWS region for all regional resources."
  default     = "ap-northeast-2"
}

variable "alert_emails" {
  type        = list(string)
  description = "Email subscribers for the SNS ops alerts topic."
  default     = []
}

variable "spa_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for the SPA assets."
}

variable "spa_domain_aliases" {
  type        = list(string)
  description = "CloudFront alternate domain names."
  default     = []
}

variable "spa_acm_certificate_arn" {
  type        = string
  description = "ACM cert ARN in us-east-1 for the SPA aliases."
  default     = ""
}

variable "alb_acm_certificate_arn" {
  type        = string
  description = "ACM cert ARN in the ALB's region for the HTTPS listener."
  default     = ""
}

variable "route53_zone_name" {
  type        = string
  description = "Hosted zone domain (e.g. work-manager.molcube.com)."
  default     = ""
}

variable "api_record_name" {
  type        = string
  description = "FQDN of the API record (e.g. api.work-manager.molcube.com)."
  default     = ""
}

variable "image_api" {
  type        = string
  description = "Container image URI for api/ws/worker/beat."
}
