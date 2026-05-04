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

# Execution role: ECS agent uses this to pull images and read secrets at task start.
resource "aws_iam_role" "task_execution" {
  name = "${local.name_prefix}-task-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
  tags = merge(var.tags, { Name = "${local.name_prefix}-task-execution" })
}

resource "aws_iam_role_policy_attachment" "task_execution_managed" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow execution role to read the configured Secrets Manager entries.
resource "aws_iam_role_policy" "task_execution_secrets" {
  count = length(var.secret_arns) == 0 ? 0 : 1
  name  = "${local.name_prefix}-task-execution-secrets"
  role  = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [{
        Sid    = "ReadSecrets"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = var.secret_arns
      }],
      length(var.kms_key_arns_for_secrets) == 0 ? [] : [{
        Sid      = "DecryptSecretCmk"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = var.kms_key_arns_for_secrets
      }]
    )
  })
}

# Task role: in-process AWS calls (S3 puts, SES, etc.). Empty by default — operators
# attach inline policies as features are added.
resource "aws_iam_role" "task" {
  name = "${local.name_prefix}-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
  tags = merge(var.tags, { Name = "${local.name_prefix}-task" })
}
