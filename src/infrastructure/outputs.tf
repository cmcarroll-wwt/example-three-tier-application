output "web_url" {
  description = "Public URL of the web frontend"
  value       = google_cloud_run_v2_service.web.uri
}

output "api_url" {
  description = "URL of the API service"
  value       = google_cloud_run_v2_service.api.uri
}

output "db_private_ip" {
  description = "Private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.main.private_ip_address
}

output "db_instance_name" {
  description = "Cloud SQL instance connection name"
  value       = google_sql_database_instance.main.connection_name
}

output "vpc_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.main.name
}

output "service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloud_run.email
}

output "db_url_secret_id" {
  description = "Secret Manager secret ID holding the DATABASE_URL"
  value       = google_secret_manager_secret.db_url.secret_id
  sensitive   = true
}
