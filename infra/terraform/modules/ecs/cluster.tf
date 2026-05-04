resource "aws_ecs_cluster" "this" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-cluster" })
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name       = aws_ecs_cluster.this.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/ecs/${local.name_prefix}/api"
  retention_in_days = var.log_retention_days
  tags              = merge(var.tags, { Name = "${local.name_prefix}-log-api" })
}

resource "aws_cloudwatch_log_group" "ws" {
  name              = "/aws/ecs/${local.name_prefix}/ws"
  retention_in_days = var.log_retention_days
  tags              = merge(var.tags, { Name = "${local.name_prefix}-log-ws" })
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/aws/ecs/${local.name_prefix}/worker"
  retention_in_days = var.log_retention_days
  tags              = merge(var.tags, { Name = "${local.name_prefix}-log-worker" })
}

resource "aws_cloudwatch_log_group" "beat" {
  name              = "/aws/ecs/${local.name_prefix}/beat"
  retention_in_days = var.log_retention_days
  tags              = merge(var.tags, { Name = "${local.name_prefix}-log-beat" })
}

resource "aws_ecr_repository" "this" {
  for_each             = toset(var.ecr_repos)
  name                 = each.value
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(var.tags, { Name = each.value })
}

resource "aws_ecr_lifecycle_policy" "this" {
  for_each   = aws_ecr_repository.this
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "sha-", "main", "stg", "prod"]
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Expire untagged after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}
