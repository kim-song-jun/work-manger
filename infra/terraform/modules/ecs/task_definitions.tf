# Task definitions render shared env (DJANGO_SETTINGS_MODULE, REGION, ENV) plus
# per-service command. Secrets are injected via Secrets Manager ARNs by the
# caller through env_extra references / out-of-band — task defs only declare the
# canonical secret category names so operators can wire them after creation.

locals {
  base_env = concat(
    [
      { name = "DJANGO_SETTINGS_MODULE", value = var.django_settings_module },
      { name = "WM_ENV",                 value = var.env },
      { name = "AWS_REGION",             value = var.region },
    ],
    [for k, v in var.env_extra : { name = k, value = v }],
  )

  api_container = {
    name  = "api"
    image = var.image_api
    essential = true
    portMappings = [{
      containerPort = var.api_port
      hostPort      = var.api_port
      protocol      = "tcp"
    }]
    command = [
      "gunicorn", "work_manager.wsgi:application",
      "--bind", "0.0.0.0:${var.api_port}",
      "--workers", "3",
      "--access-logfile", "-"
    ]
    environment = local.base_env
    healthCheck = {
      command     = ["CMD-SHELL", "curl -fsS http://localhost:${var.api_port}/v1/health || exit 1"]
      interval    = 15
      timeout     = 5
      retries     = 3
      startPeriod = 30
    }
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "api"
      }
    }
  }

  ws_container = {
    name  = "ws"
    image = var.image_api
    essential = true
    portMappings = [{
      containerPort = var.ws_port
      hostPort      = var.ws_port
      protocol      = "tcp"
    }]
    command = [
      "daphne", "-b", "0.0.0.0", "-p", tostring(var.ws_port),
      "work_manager.asgi:application"
    ]
    environment = local.base_env
    healthCheck = {
      command     = ["CMD-SHELL", "curl -fsS http://localhost:${var.ws_port}/v1/health || exit 1"]
      interval    = 15
      timeout     = 5
      retries     = 3
      startPeriod = 30
    }
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ws.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "ws"
      }
    }
  }

  worker_container = {
    name      = "worker"
    image     = var.image_api
    essential = true
    command   = ["celery", "-A", "work_manager", "worker", "-l", "info"]
    environment = local.base_env
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.worker.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "worker"
      }
    }
  }

  beat_container = {
    name      = "beat"
    image     = var.image_api
    essential = true
    command = [
      "celery", "-A", "work_manager", "beat", "-l", "info",
      "--scheduler", "django_celery_beat.schedulers:DatabaseScheduler"
    ]
    environment = local.base_env
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.beat.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "beat"
      }
    }
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${local.name_prefix}-api"
  cpu                      = var.task_cpu_api
  memory                   = var.task_mem_api
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn
  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }
  container_definitions = jsonencode([local.api_container])
  tags                  = merge(var.tags, { Name = "${local.name_prefix}-api-td" })
}

resource "aws_ecs_task_definition" "ws" {
  family                   = "${local.name_prefix}-ws"
  cpu                      = var.task_cpu_ws
  memory                   = var.task_mem_ws
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn
  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }
  container_definitions = jsonencode([local.ws_container])
  tags                  = merge(var.tags, { Name = "${local.name_prefix}-ws-td" })
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "${local.name_prefix}-worker"
  cpu                      = var.task_cpu_worker
  memory                   = var.task_mem_worker
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn
  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }
  container_definitions = jsonencode([local.worker_container])
  tags                  = merge(var.tags, { Name = "${local.name_prefix}-worker-td" })
}

resource "aws_ecs_task_definition" "beat" {
  family                   = "${local.name_prefix}-beat"
  cpu                      = var.task_cpu_beat
  memory                   = var.task_mem_beat
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn
  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }
  container_definitions = jsonencode([local.beat_container])
  tags                  = merge(var.tags, { Name = "${local.name_prefix}-beat-td" })
}
