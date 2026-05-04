output "zone_id" {
  value       = local.zone_id
  description = "Route53 hosted zone ID (always populated via data lookup when zone_name is set). Empty if zone_name not set."
}

output "name_servers" {
  value       = try(aws_route53_zone.this[0].name_servers, [])
  description = "Name servers for the created hosted zone (configure at the registrar). Empty when create_zone=false."
}
