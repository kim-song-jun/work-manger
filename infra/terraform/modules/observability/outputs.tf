output "sns_topic_arn" {
  value       = aws_sns_topic.ops.arn
  description = "SNS topic ARN for ops alerts (subscribe PagerDuty / Slack here)."
}

output "app_log_group_name" {
  value       = aws_cloudwatch_log_group.app.name
  description = "Shared application log group name (Django JSON logs)."
}

output "alarm_names" {
  value = [
    aws_cloudwatch_metric_alarm.alb_5xx_rate.alarm_name,
    aws_cloudwatch_metric_alarm.alb_p95_latency.alarm_name,
    aws_cloudwatch_metric_alarm.rds_cpu.alarm_name,
    aws_cloudwatch_metric_alarm.rds_replica_lag.alarm_name,
    aws_cloudwatch_metric_alarm.rds_storage.alarm_name,
    aws_cloudwatch_metric_alarm.redis_evictions.alarm_name,
    aws_cloudwatch_metric_alarm.redis_memory.alarm_name,
    aws_cloudwatch_metric_alarm.ecs_api_cpu.alarm_name,
    aws_cloudwatch_metric_alarm.app_error_spike.alarm_name,
  ]
  description = "All alarm names (for Grafana / dashboard integration)."
}
