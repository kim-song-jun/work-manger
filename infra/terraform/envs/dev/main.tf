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
  env = "dev"
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
  vpc_cidr             = "10.40.0.0/16"
  azs                  = ["${var.region}a", "${var.region}b", "${var.region}c"]
  public_subnet_cidrs  = ["10.40.0.0/24", "10.40.1.0/24", "10.40.2.0/24"]
  private_subnet_cidrs = ["10.40.10.0/24", "10.40.11.0/24", "10.40.12.0/24"]
  db_subnet_cidrs      = ["10.40.20.0/24", "10.40.21.0/24", "10.40.22.0/24"]
  single_nat_gateway   = true # cost: dev tolerates single NAT
  tags                 = local.common_tags
}

module "secrets" {
  source = "../../modules/secrets"

  env                  = local.env
  recovery_window_days = 7
  tags                 = local.common_tags
}

module "route53" {
  source = "../../modules/route53"

  env                    = local.env
  create_zone            = false
  zone_name              = var.route53_zone_name
  api_record_name        = var.api_record_name
  alb_dns_name           = module.alb.alb_dns_name
  alb_zone_id            = module.alb.alb_zone_id
  spa_record_name        = var.spa_record_name
  cloudfront_domain_name = module.s3_cdn.cloudfront_domain
  tags                   = local.common_tags
}

module "acm" {
  source = "../../modules/acm"
  providers = {
    aws.regional  = aws.regional
    aws.us_east_1 = aws.us_east_1
  }

  env                                  = local.env
  zone_id                              = module.route53.zone_id
  alb_domain_name                      = var.api_record_name
  cloudfront_domain_name               = var.spa_record_name
  cloudfront_subject_alternative_names = var.spa_domain_aliases
  tags                                 = local.common_tags
}

module "alb" {
  source = "../../modules/alb"

  env               = local.env
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  certificate_arn   = module.acm.alb_certificate_arn != "" ? module.acm.alb_certificate_arn : var.alb_acm_certificate_arn
  enable_waf        = false # WAF wired separately via modules/waf below
  tags              = local.common_tags
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
  django_settings_module = "work_manager.settings.dev"
  image_api              = var.image_api

  task_cpu_api    = 512
  task_mem_api    = 1024
  task_cpu_ws     = 512
  task_mem_ws     = 1024
  task_cpu_worker = 512
  task_mem_worker = 1024
  task_cpu_beat   = 256
  task_mem_beat   = 512

  desired_api    = 1
  desired_ws     = 1
  desired_worker = 1
  min_api        = 1
  max_api        = 2

  log_retention_days = 14
  tags               = local.common_tags
}

module "rds" {
  source = "../../modules/rds"

  env           = local.env
  vpc_id        = module.network.vpc_id
  db_subnet_ids = module.network.db_subnet_ids
  ingress_security_group_ids = [
    module.ecs.api_security_group_id,
    module.ecs.ws_security_group_id,
    module.ecs.worker_security_group_id,
    module.ecs.beat_security_group_id,
  ]
  instance_class               = "db.t4g.medium"
  allocated_storage_gb         = 20
  max_allocated_storage_gb     = 50
  multi_az                     = false
  create_replica               = false
  backup_retention_days        = 3
  deletion_protection          = false
  db_password_secret_arn       = module.secrets.db_password_arn
  performance_insights_enabled = true
  monitoring_interval_seconds  = 60
  tags                         = local.common_tags
}

module "elasticache" {
  source = "../../modules/elasticache"

  env           = local.env
  vpc_id        = module.network.vpc_id
  db_subnet_ids = module.network.db_subnet_ids
  ingress_security_group_ids = [
    module.ecs.api_security_group_id,
    module.ecs.ws_security_group_id,
    module.ecs.worker_security_group_id,
    module.ecs.beat_security_group_id,
  ]
  node_type                  = "cache.t4g.small"
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true
  snapshot_retention_days    = 1
  auth_token_secret_arn      = "" # AUTH disabled in dev
  tags                       = local.common_tags
}

module "s3_cdn" {
  source = "../../modules/s3-cdn"

  env                 = local.env
  bucket_name         = var.spa_bucket_name
  account_id_short    = var.account_id_short
  domain_aliases      = var.spa_domain_aliases
  acm_certificate_arn = module.acm.cloudfront_certificate_arn != "" ? module.acm.cloudfront_certificate_arn : var.spa_acm_certificate_arn
  route53_zone_id     = "" # route53 module owns SPA aliases now
  price_class         = "PriceClass_100"
  tags                = local.common_tags
}

module "observability" {
  source = "../../modules/observability"

  env                         = local.env
  alert_emails                = var.alert_emails
  pagerduty_endpoint_url      = var.pagerduty_endpoint_url
  create_waf_log_group        = var.enable_waf
  alb_arn_suffix              = element(split("loadbalancer/", module.alb.alb_arn), 1)
  api_target_group_arn_suffix = element(split(":targetgroup/", module.alb.api_target_group_arn), 1)
  rds_instance_id             = "wm-${local.env}-pg-primary"
  redis_replication_group_id  = module.elasticache.replication_group_id
  ecs_cluster_name            = module.ecs.cluster_name
  ecs_api_service_name        = module.ecs.api_service_name
  tags                        = local.common_tags
}

module "waf" {
  count  = var.enable_waf ? 1 : 0
  source = "../../modules/waf"

  env                     = local.env
  alb_arn                 = module.alb.alb_arn
  log_group_arn           = module.observability.waf_log_group_arn
  geo_block_country_codes = var.waf_geo_block_country_codes
  enable_bot_control      = var.waf_enable_bot_control
  tags                    = local.common_tags
}
