output "cluster_name" {
  value       = aws_ecs_cluster.this.name
  description = "ECS cluster name."
}

output "cluster_arn" {
  value       = aws_ecs_cluster.this.arn
  description = "ECS cluster ARN."
}

output "api_service_name" {
  value       = aws_ecs_service.api.name
  description = "API service name (used by deploy pipeline)."
}

output "ws_service_name" {
  value       = aws_ecs_service.ws.name
  description = "WS service name."
}

output "worker_service_name" {
  value       = aws_ecs_service.worker.name
  description = "Worker service name."
}

output "beat_service_name" {
  value       = aws_ecs_service.beat.name
  description = "Beat service name."
}

output "api_security_group_id" {
  value       = aws_security_group.api_task.id
  description = "Security group ID of the API task (allow as RDS/Redis ingress source)."
}

output "ws_security_group_id" {
  value       = aws_security_group.ws_task.id
  description = "Security group ID of the WS task."
}

output "worker_security_group_id" {
  value       = aws_security_group.worker_task.id
  description = "Security group ID of the worker task."
}

output "beat_security_group_id" {
  value       = aws_security_group.beat_task.id
  description = "Security group ID of the beat task."
}

output "task_role_arn" {
  value       = aws_iam_role.task.arn
  description = "Task role ARN (attach inline / managed policies for in-app AWS calls)."
}

output "task_execution_role_arn" {
  value       = aws_iam_role.task_execution.arn
  description = "Task execution role ARN."
}

output "ecr_repository_urls" {
  value       = { for k, r in aws_ecr_repository.this : k => r.repository_url }
  description = "Map of ECR repo name → URL (push targets for CI build step)."
}
