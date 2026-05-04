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

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = var.db_password_secret_arn
}

resource "aws_db_subnet_group" "this" {
  name       = "${local.name_prefix}-db-subnet"
  subnet_ids = var.db_subnet_ids
  tags       = merge(var.tags, { Name = "${local.name_prefix}-db-subnet" })
}

resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "RDS PostgreSQL ingress (5432) from API/WS/worker/beat SGs only."
  vpc_id      = var.vpc_id

  egress {
    description = "Allow internal egress (replication / monitoring)."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-rds-sg" })
}

resource "aws_security_group_rule" "rds_ingress" {
  for_each                 = toset(var.ingress_security_group_ids)
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = each.value
  description              = "PostgreSQL ingress from app SG"
}

resource "aws_kms_key" "rds" {
  description             = "${local.name_prefix} RDS storage encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags                    = merge(var.tags, { Name = "${local.name_prefix}-rds-kms" })
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${local.name_prefix}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

resource "aws_db_parameter_group" "pg16" {
  name        = "${local.name_prefix}-pg16"
  family      = "postgres16"
  description = "Tuned PG16 parameters for ${local.name_prefix}."

  parameter {
    name  = "log_min_duration_statement"
    value = "500"
  }

  parameter {
    name  = "log_lock_waits"
    value = "1"
  }

  parameter {
    name  = "log_temp_files"
    value = "0"
  }

  parameter {
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements"
    apply_method = "pending-reboot"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-pg16" })
}

resource "aws_iam_role" "rds_monitoring" {
  count = var.monitoring_interval_seconds == 0 ? 0 : 1
  name  = "${local.name_prefix}-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })

  tags = merge(var.tags, { Name = "${local.name_prefix}-rds-monitoring" })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count      = var.monitoring_interval_seconds == 0 ? 0 : 1
  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

resource "aws_db_instance" "primary" {
  identifier = "${local.name_prefix}-pg-primary"

  engine                       = "postgres"
  engine_version               = var.engine_version
  instance_class               = var.instance_class
  allocated_storage            = var.allocated_storage_gb
  max_allocated_storage        = var.max_allocated_storage_gb
  storage_type                 = "gp3"
  storage_encrypted            = true
  kms_key_id                   = aws_kms_key.rds.arn

  db_name                      = var.db_name
  username                     = var.db_username
  password                     = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
  port                         = 5432

  db_subnet_group_name         = aws_db_subnet_group.this.name
  vpc_security_group_ids       = [aws_security_group.rds.id]
  parameter_group_name         = aws_db_parameter_group.pg16.name
  publicly_accessible          = false

  multi_az                     = var.multi_az
  backup_retention_period      = var.backup_retention_days
  backup_window                = "17:00-18:00" # UTC = 02:00-03:00 KST
  maintenance_window           = "sun:18:30-sun:19:30"
  copy_tags_to_snapshot        = true
  deletion_protection          = var.deletion_protection
  skip_final_snapshot          = var.env != "prod"
  final_snapshot_identifier    = var.env == "prod" ? "${local.name_prefix}-pg-final" : null
  delete_automated_backups     = false
  apply_immediately            = false
  auto_minor_version_upgrade   = true

  performance_insights_enabled         = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_enabled ? 7 : null
  performance_insights_kms_key_id      = var.performance_insights_enabled ? aws_kms_key.rds.arn : null
  monitoring_interval                  = var.monitoring_interval_seconds
  monitoring_role_arn                  = var.monitoring_interval_seconds == 0 ? null : aws_iam_role.rds_monitoring[0].arn

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = merge(var.tags, { Name = "${local.name_prefix}-pg-primary" })

  lifecycle {
    ignore_changes = [password] # rotated out-of-band via Secrets Manager
  }
}

resource "aws_db_instance" "replica" {
  count                       = var.create_replica ? 1 : 0
  identifier                  = "${local.name_prefix}-pg-replica"
  replicate_source_db         = aws_db_instance.primary.identifier
  instance_class              = var.instance_class
  publicly_accessible         = false
  vpc_security_group_ids      = [aws_security_group.rds.id]
  parameter_group_name        = aws_db_parameter_group.pg16.name
  performance_insights_enabled = var.performance_insights_enabled
  monitoring_interval         = var.monitoring_interval_seconds
  monitoring_role_arn         = var.monitoring_interval_seconds == 0 ? null : aws_iam_role.rds_monitoring[0].arn
  deletion_protection         = var.deletion_protection
  skip_final_snapshot         = true
  apply_immediately           = false
  auto_minor_version_upgrade  = true

  tags = merge(var.tags, { Name = "${local.name_prefix}-pg-replica" })
}
