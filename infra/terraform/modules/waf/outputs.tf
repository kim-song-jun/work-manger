output "web_acl_arn" {
  value       = aws_wafv2_web_acl.this.arn
  description = "ARN of the WAFv2 web ACL."
}

output "web_acl_id" {
  value       = aws_wafv2_web_acl.this.id
  description = "ID of the WAFv2 web ACL."
}

output "web_acl_name" {
  value       = aws_wafv2_web_acl.this.name
  description = "Name of the WAFv2 web ACL."
}
