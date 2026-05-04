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
  name_prefix    = "wm-${var.env}"
  use_auth_token = var.auth_token_secret_arn != ""
}

data "aws_secretsmanager_secret_version" "auth_token" {
  count     = local.use_auth_token ? 1 : 0
  secret_id = var.auth_token_secret_arn
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "${local.name_prefix}-redis-subnet"
  subnet_ids = var.db_subnet_ids
  tags       = merge(var.tags, { Name = "${local.name_prefix}-redis-subnet" })
}

resource "aws_security_group" "redis" {
  name        = "${local.name_prefix}-redis-sg"
  description = "Redis ingress (6379) from API/WS/worker/beat SGs only."
  vpc_id      = var.vpc_id

  egress {
    description = "Allow internal egress (replication, cluster bus)."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-redis-sg" })
}

resource "aws_security_group_rule" "redis_ingress" {
  for_each                 = toset(var.ingress_security_group_ids)
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  security_group_id        = aws_security_group.redis.id
  source_security_group_id = each.value
  description              = "Redis ingress from app SG"
}

resource "aws_elasticache_parameter_group" "this" {
  name        = "${local.name_prefix}-redis-pg"
  family      = "redis7"
  description = "Tuned Redis7 params for ${local.name_prefix}: allkeys-lru."

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "60"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-redis-pg" })
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id = "${local.name_prefix}-redis"
  description          = "Redis replication group for ${local.name_prefix}."

  engine               = "redis"
  engine_version       = var.engine_version
  node_type            = var.node_type
  num_cache_clusters   = var.num_cache_clusters
  parameter_group_name = aws_elasticache_parameter_group.this.name
  port                 = 6379

  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [aws_security_group.redis.id]
  automatic_failover_enabled = var.automatic_failover_enabled && var.num_cache_clusters > 1
  multi_az_enabled           = var.multi_az_enabled && var.num_cache_clusters > 1

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = local.use_auth_token ? jsondecode(data.aws_secretsmanager_secret_version.auth_token[0].secret_string)["auth_token"] : null

  snapshot_retention_limit = var.snapshot_retention_days
  snapshot_window          = "16:00-17:00" # UTC
  maintenance_window       = "sun:17:00-sun:18:00"

  apply_immediately          = false
  auto_minor_version_upgrade = true

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.slow.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.engine.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "engine-log"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-redis" })

  lifecycle {
    ignore_changes = [auth_token]
  }
}

resource "aws_cloudwatch_log_group" "slow" {
  name              = "/aws/elasticache/${local.name_prefix}/slow"
  retention_in_days = 14
  tags              = merge(var.tags, { Name = "${local.name_prefix}-redis-slow" })
}

resource "aws_cloudwatch_log_group" "engine" {
  name              = "/aws/elasticache/${local.name_prefix}/engine"
  retention_in_days = 14
  tags              = merge(var.tags, { Name = "${local.name_prefix}-redis-engine" })
}
