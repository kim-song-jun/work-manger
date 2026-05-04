variable "env" {
  type        = string
  description = "Environment name (stg|prod). Dev environments don't ship signed releases."
  validation {
    condition     = contains(["stg", "prod"], var.env)
    error_message = "desktop-updates is only used for stg / prod."
  }
}

variable "bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name. Empty → derived from `workmanager-desktop-updates-<env>-<account_id_short>`."
  default     = ""
}

variable "account_id_short" {
  type        = string
  description = "Last-6 digits of the AWS account ID — used to keep bucket names globally unique without leaking the full account ID."
  default     = ""
}

variable "noncurrent_version_retention_days" {
  type        = number
  description = "Days to keep noncurrent (overwritten) object versions before lifecycle expiry."
  default     = 90
}

variable "release_retention_days" {
  type        = number
  description = "Optional: expire installer artifacts (under desktop/) after this many days. 0 disables (recommended for prod — keep all releases for rollback)."
  default     = 0
}

variable "enable_cloudfront" {
  type        = bool
  description = "Front the bucket with a CloudFront distribution + OAC for low-latency global download. Disable for v1 to keep cost minimal — clients will hit S3 SigV4 directly."
  default     = false
}

variable "cloudfront_aliases" {
  type        = list(string)
  description = "Optional CNAMEs for the CloudFront distribution (e.g. [\"updates.work-manager.molcube.com\"]). Requires `acm_certificate_arn`."
  default     = []
}

variable "acm_certificate_arn" {
  type        = string
  description = "ACM certificate ARN (must be in us-east-1) for the CloudFront aliases. Empty → CF default cert."
  default     = ""
}

variable "price_class" {
  type        = string
  description = "CloudFront price class."
  default     = "PriceClass_200"
}

variable "publish_principal_arns" {
  type        = list(string)
  description = "IAM ARNs (user / role) allowed to publish artifacts (CI runner role + electron-builder S3 putObject)."
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
