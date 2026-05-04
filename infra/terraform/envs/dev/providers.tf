# Provider aliases for cross-region resources (ACM cert for CloudFront must
# live in us-east-1; everything else is in var.region = ap-northeast-2).

provider "aws" {
  alias  = "regional"
  region = var.region
  default_tags {
    tags = local.common_tags
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = local.common_tags
  }
}
