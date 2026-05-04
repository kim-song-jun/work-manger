# Per-service task SGs. ECS tasks need outbound (ECR/Secrets/CloudWatch via NAT,
# DB/Redis intra-VPC). Inbound only from ALB for api/ws; none for worker/beat.

resource "aws_security_group" "api_task" {
  name        = "${local.name_prefix}-api-task-sg"
  description = "API Fargate task SG. Ingress from ALB only."
  vpc_id      = var.vpc_id

  egress {
    description = "All outbound (NAT, RDS, Redis)."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-api-task-sg" })
}

resource "aws_security_group_rule" "api_task_ingress_alb" {
  type                     = "ingress"
  from_port                = var.api_port
  to_port                  = var.api_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.api_task.id
  source_security_group_id = var.alb_security_group_id
  description              = "API ingress from ALB"
}

resource "aws_security_group" "ws_task" {
  name        = "${local.name_prefix}-ws-task-sg"
  description = "WebSocket Fargate task SG. Ingress from ALB only."
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-ws-task-sg" })
}

resource "aws_security_group_rule" "ws_task_ingress_alb" {
  type                     = "ingress"
  from_port                = var.ws_port
  to_port                  = var.ws_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.ws_task.id
  source_security_group_id = var.alb_security_group_id
  description              = "WS ingress from ALB"
}

resource "aws_security_group" "worker_task" {
  name        = "${local.name_prefix}-worker-task-sg"
  description = "Celery worker SG. No ingress."
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-worker-task-sg" })
}

resource "aws_security_group" "beat_task" {
  name        = "${local.name_prefix}-beat-task-sg"
  description = "Celery beat SG. No ingress."
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-beat-task-sg" })
}
