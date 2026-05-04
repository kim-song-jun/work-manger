terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.60.0"
    }
  }
}

locals {
  name_prefix = "wm-${var.env}"
}

resource "aws_sns_topic" "ops" {
  name         = "${local.name_prefix}-ops-alerts"
  display_name = "WM ${var.env} ops alerts"
  tags         = merge(var.tags, { Name = "${local.name_prefix}-ops-alerts" })
}

resource "aws_sns_topic_subscription" "email" {
  for_each  = toset(var.alert_emails)
  topic_arn = aws_sns_topic.ops.arn
  protocol  = "email"
  endpoint  = each.value
}

# PagerDuty + WAF log group live in pagerduty.tf — kept separate to stay <250 lines.

# Application log group: structured Django JSON logs from api/ws (single shared
# group lets metric filters span the whole HTTP plane). Per-service log groups
# stay in the ecs module for per-task troubleshooting.
resource "aws_cloudwatch_log_group" "app" {
  name              = "/wm/${var.env}/app"
  retention_in_days = var.env == "prod" ? 90 : 30
  tags              = merge(var.tags, { Name = "${local.name_prefix}-app-log" })
}

# Metric filter: count log lines emitting `level=ERROR` (Django JSON logger).
resource "aws_cloudwatch_log_metric_filter" "app_errors" {
  name           = "${local.name_prefix}-app-errors"
  log_group_name = aws_cloudwatch_log_group.app.name
  pattern        = "{ $.level = \"ERROR\" }"

  metric_transformation {
    name          = "AppErrors"
    namespace     = "WorkManager/${var.env}"
    value         = "1"
    default_value = "0"
  }
}

# --- ALB 5xx error rate (SLO: API 가용성 99.9%, 출퇴근 성공률 ≥ 99.95%) ---
resource "aws_cloudwatch_metric_alarm" "alb_5xx_rate" {
  alarm_name          = "${local.name_prefix}-alb-5xx-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 1.0
  alarm_description   = "API 5xx ratio > 1% over 5 min (SLO breach signal)."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.ops.arn]
  ok_actions          = [aws_sns_topic.ops.arn]

  metric_query {
    id          = "ratio"
    expression  = "100 * (m_5xx / IF(m_total == 0, 1, m_total))"
    label       = "5xx ratio (%)"
    return_data = true
  }

  metric_query {
    id = "m_5xx"
    metric {
      namespace   = "AWS/ApplicationELB"
      metric_name = "HTTPCode_Target_5XX_Count"
      period      = 300
      stat        = "Sum"
      dimensions = {
        LoadBalancer = var.alb_arn_suffix
        TargetGroup  = var.api_target_group_arn_suffix
      }
    }
  }

  metric_query {
    id = "m_total"
    metric {
      namespace   = "AWS/ApplicationELB"
      metric_name = "RequestCount"
      period      = 300
      stat        = "Sum"
      dimensions = {
        LoadBalancer = var.alb_arn_suffix
        TargetGroup  = var.api_target_group_arn_suffix
      }
    }
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-alb-5xx-rate" })
}

# --- ALB target P95 latency (SLO: ≤ 300ms) ---
resource "aws_cloudwatch_metric_alarm" "alb_p95_latency" {
  alarm_name          = "${local.name_prefix}-alb-p95-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = var.p95_latency_threshold_seconds
  alarm_description   = "API P95 latency > ${var.p95_latency_threshold_seconds}s for 10 min."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.ops.arn]
  ok_actions          = [aws_sns_topic.ops.arn]
  namespace           = "AWS/ApplicationELB"
  metric_name         = "TargetResponseTime"
  extended_statistic  = "p95"
  period              = 300
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.api_target_group_arn_suffix
  }
  tags = merge(var.tags, { Name = "${local.name_prefix}-alb-p95-latency" })
}

# --- RDS CPU (operations-guide §6.1: > 70% → 경고) ---
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${local.name_prefix}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = var.rds_cpu_threshold_pct
  alarm_description   = "RDS CPU > ${var.rds_cpu_threshold_pct}% for 5 min."
  alarm_actions       = [aws_sns_topic.ops.arn]
  ok_actions          = [aws_sns_topic.ops.arn]
  namespace           = "AWS/RDS"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  tags = merge(var.tags, { Name = "${local.name_prefix}-rds-cpu" })
}

resource "aws_cloudwatch_metric_alarm" "rds_replica_lag" {
  alarm_name          = "${local.name_prefix}-rds-replica-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = var.replica_lag_threshold_seconds
  alarm_description   = "RDS replication lag > ${var.replica_lag_threshold_seconds}s."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.ops.arn]
  ok_actions          = [aws_sns_topic.ops.arn]
  namespace           = "AWS/RDS"
  metric_name         = "ReplicaLag"
  statistic           = "Maximum"
  period              = 300
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  tags = merge(var.tags, { Name = "${local.name_prefix}-rds-replica-lag" })
}

resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "${local.name_prefix}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  threshold           = 10737418240 # 10 GB
  alarm_description   = "RDS free storage < 10 GB (operations-guide §6.1: < 20% → 경고)."
  alarm_actions       = [aws_sns_topic.ops.arn]
  namespace           = "AWS/RDS"
  metric_name         = "FreeStorageSpace"
  statistic           = "Minimum"
  period              = 300
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  tags = merge(var.tags, { Name = "${local.name_prefix}-rds-storage-low" })
}

# --- ElastiCache evictions (operations-guide §7) ---
resource "aws_cloudwatch_metric_alarm" "redis_evictions" {
  alarm_name          = "${local.name_prefix}-redis-evictions"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = var.redis_evictions_threshold
  alarm_description   = "Redis evictions > ${var.redis_evictions_threshold} per 5 min (memory pressure)."
  alarm_actions       = [aws_sns_topic.ops.arn]
  ok_actions          = [aws_sns_topic.ops.arn]
  namespace           = "AWS/ElastiCache"
  metric_name         = "Evictions"
  statistic           = "Sum"
  period              = 300
  dimensions = {
    ReplicationGroupId = var.redis_replication_group_id
  }
  tags = merge(var.tags, { Name = "${local.name_prefix}-redis-evictions" })
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "${local.name_prefix}-redis-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 80
  alarm_description   = "Redis used memory > 80% (operations-guide §7)."
  alarm_actions       = [aws_sns_topic.ops.arn]
  namespace           = "AWS/ElastiCache"
  metric_name         = "DatabaseMemoryUsagePercentage"
  statistic           = "Average"
  period              = 300
  dimensions = {
    ReplicationGroupId = var.redis_replication_group_id
  }
  tags = merge(var.tags, { Name = "${local.name_prefix}-redis-memory" })
}

# --- ECS API service CPU (autoscale safety net) ---
resource "aws_cloudwatch_metric_alarm" "ecs_api_cpu" {
  alarm_name          = "${local.name_prefix}-ecs-api-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  threshold           = 85
  alarm_description   = "ECS API service CPU > 85% — auto-scale may be saturating."
  alarm_actions       = [aws_sns_topic.ops.arn]
  namespace           = "AWS/ECS"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_api_service_name
  }
  tags = merge(var.tags, { Name = "${local.name_prefix}-ecs-api-cpu" })
}

# --- App-level error spike from log metric filter ---
resource "aws_cloudwatch_metric_alarm" "app_error_spike" {
  alarm_name          = "${local.name_prefix}-app-error-spike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 50
  alarm_description   = "App emitted > 50 ERROR-level log lines in 5 min."
  alarm_actions       = [aws_sns_topic.ops.arn]
  namespace           = "WorkManager/${var.env}"
  metric_name         = "AppErrors"
  statistic           = "Sum"
  period              = 300
  treat_missing_data  = "notBreaching"
  tags = merge(var.tags, { Name = "${local.name_prefix}-app-error-spike" })
}
