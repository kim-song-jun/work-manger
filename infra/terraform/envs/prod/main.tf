terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.60.0"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = local.common_tags
  }
}

locals {
  env = "prod"
  common_tags = {
    Project   = "work-manager"
    Env       = local.env
    Owner     = "molcube"
    ManagedBy = "terraform"
  }
}

module "network" {
  source = "../../modules/network"

  env                  = local.env
  vpc_cidr             = "10.60.0.0/16"
  azs                  = ["${var.region}a", "${var.region}b", "${var.region}c"]
  public_subnet_cidrs  = ["10.60.0.0/24", "10.60.1.0/24", "10.60.2.0/24"]
  private_subnet_cidrs = ["10.60.10.0/24", "10.60.11.0/24", "10.60.12.0/24"]
  db_subnet_cidrs      = ["10.60.20.0/24", "10.60.21.0/24", "10.60.22.0/24"]
  single_nat_gateway   = false # one NAT per AZ for HA
  tags                 = local.common_tags
}

module "secrets" {
  source = "../../modules/secrets"

  env                  = local.env
  recovery_window_days = 30
  tags                 = local.common_tags
}

module "alb" {
  source = "../../modules/alb"

  env             = local.env
  vpc_id          = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  certificate_arn = var.alb_acm_certificate_arn
  enable_waf      = true
  tags            = local.common_tags
}

module "ecs" {
  source = "../../modules/ecs"

  env                    = local.env
  region                 = var.region
  vpc_id                 = module.network.vpc_id
  private_subnet_ids     = module.network.private_subnet_ids
  alb_security_group_id  = module.alb.alb_security_group_id
  api_target_group_arn   = module.alb.api_target_group_arn
  ws_target_group_arn    = module.alb.ws_target_group_arn
  secret_arns            = module.secrets.all_secret_arns_list
  django_settings_module = "work_manager.settings.prod"
  image_api              = var.image_api

  task_cpu_api    = 1024
  task_mem_api    = 2048
  task_cpu_ws     = 1024
  task_mem_ws     = 2048
  task_cpu_worker = 1024
  task_mem_worker = 2048
  task_cpu_beat   = 512
  task_mem_beat   = 1024

  desired_api    = 2
  desired_ws     = 2
  desired_worker = 2
  min_api        = 2
  max_api        = 6

  log_retention_days = 90
  tags               = local.common_tags
}

module "rds" {
  source = "../../modules/rds"

  env                          = local.env
  vpc_id                       = module.network.vpc_id
  db_subnet_ids                = module.network.db_subnet_ids
  ingress_security_group_ids = [
    module.ecs.api_security_group_id,
    module.ecs.ws_security_group_id,
    module.ecs.worker_security_group_id,
    module.ecs.beat_security_group_id,
  ]
  instance_class                = "db.t4g.large"
  allocated_storage_gb          = 200
  max_allocated_storage_gb      = 1000 # storage autoscaling enabled
  multi_az                      = true
  create_replica                = true
  backup_retention_days         = 14
  deletion_protection           = true
  db_password_secret_arn        = module.secrets.db_password_arn
  performance_insights_enabled  = true
  monitoring_interval_seconds   = 30
  tags                          = local.common_tags
}

module "elasticache" {
  source = "../../modules/elasticache"

  env                        = local.env
  vpc_id                     = module.network.vpc_id
  db_subnet_ids              = module.network.db_subnet_ids
  ingress_security_group_ids = [
    module.ecs.api_security_group_id,
    module.ecs.ws_security_group_id,
    module.ecs.worker_security_group_id,
    module.ecs.beat_security_group_id,
  ]
  node_type                  = "cache.t4g.medium"
  num_cache_clusters         = 2 # 1 primary + 1 replica (cluster-mode-disabled HA)
  automatic_failover_enabled = true
  multi_az_enabled           = true
  snapshot_retention_days    = 7
  auth_token_secret_arn      = module.secrets.redis_auth_token_arn
  tags                       = local.common_tags
}

module "s3_cdn" {
  source = "../../modules/s3-cdn"

  env                 = local.env
  bucket_name         = var.spa_bucket_name
  domain_aliases      = var.spa_domain_aliases
  acm_certificate_arn = var.spa_acm_certificate_arn
  route53_zone_id     = module.route53.zone_id
  price_class         = "PriceClass_200"
  tags                = local.common_tags
}

module "route53" {
  source = "../../modules/route53"

  env             = local.env
  create_zone     = false
  zone_name       = var.route53_zone_name
  api_record_name = var.api_record_name
  alb_dns_name    = module.alb.alb_dns_name
  alb_zone_id     = module.alb.alb_zone_id
  tags            = local.common_tags
}

module "observability" {
  source = "../../modules/observability"

  env                          = local.env
  alert_emails                 = var.alert_emails
  alb_arn_suffix               = element(split("loadbalancer/", module.alb.alb_arn), 1)
  api_target_group_arn_suffix  = element(split(":targetgroup/", module.alb.api_target_group_arn), 1)
  rds_instance_id              = "wm-${local.env}-pg-primary"
  redis_replication_group_id   = module.elasticache.replication_group_id
  ecs_cluster_name             = module.ecs.cluster_name
  ecs_api_service_name         = module.ecs.api_service_name
  tags                         = local.common_tags
}
