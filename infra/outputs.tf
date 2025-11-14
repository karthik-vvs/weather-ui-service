output "bucket_name" {
  value = google_storage_bucket.weather_bucket.name
}

output "fetch_weather_url" {
  value = google_cloudfunctions2_function.fetch_weather.service_config[0].uri
}

output "process_weather_region" {
  value = google_cloudfunctions2_function.process_weather.location
}

output "gke_cluster_name" {
  value = google_container_cluster.weather_ui_cluster.name
}
