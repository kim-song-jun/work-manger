output "alb_arn" {
  value       = aws_lb.this.arn
  description = "ARN of the ALB."
}

output "alb_dns_name" {
  value       = aws_lb.this.dns_name
  description = "Public DNS name of the ALB (Route53 alias target)."
}

output "alb_zone_id" {
  value       = aws_lb.this.zone_id
  description = "Hosted zone ID of the ALB (for Route53 alias)."
}

output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "Security group ID of the ALB (allow as ingress from ECS SGs)."
}

output "api_target_group_arn" {
  value       = aws_lb_target_group.api.arn
  description = "ARN of the API target group (ECS service registers IPs)."
}

output "ws_target_group_arn" {
  value       = aws_lb_target_group.ws.arn
  description = "ARN of the WebSocket target group (sticky sessions enabled)."
}

output "https_listener_arn" {
  value       = try(aws_lb_listener.https[0].arn, "")
  description = "HTTPS listener ARN (empty if no cert provided)."
}
