terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ---------------------------------------------------------
# 1️⃣  Cloud Storage Bucket
# ---------------------------------------------------------
resource "google_storage_bucket" "weather_bucket" {
  name          = var.bucket_name
  location      = var.region
  force_destroy = false
}

# ---------------------------------------------------------
# 2️⃣ Cloud Function - Fetch Weather (Node.js)
# ---------------------------------------------------------
resource "google_cloudfunctions2_function" "fetch_weather" {
  name     = "fetchWeather"
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = "fetchWeather"
    source {
      storage_source {
        bucket = google_storage_bucket.weather_bucket.name
        object = "fetch_weather.zip"
      }
    }
  }

  service_config {
    available_memory   = "256M"
    timeout_seconds    = 60
    ingress_settings = "ALLOW_ALL"
    environment_variables = {
      BUCKET_NAME = google_storage_bucket.weather_bucket.name
    }
  }
}

# ---------------------------------------------------------
# 3️⃣ Cloud Scheduler (Triggers fetch function every 30 mins)
# ---------------------------------------------------------
resource "google_cloud_scheduler_job" "weather_schedule" {
  name     = "weather-fetch-job"
  region   = var.region
  schedule = "*/30 * * * *"

  http_target {
    uri         = google_cloudfunctions2_function.fetch_weather.service_config[0].uri
    http_method = "GET"
  }
}

# ---------------------------------------------------------
# 4️⃣ Cloud Function - Process Weather (Vertex AI)
# ---------------------------------------------------------
resource "google_cloudfunctions2_function" "process_weather" {
  name     = "processWeatherData"
  location = "us-central1"

  build_config {
    runtime     = "nodejs20"
    entry_point = "processWeatherData"
    source {
      storage_source {
        bucket = google_storage_bucket.weather_bucket.name
        object = "process_weather.zip"
      }
    }
  }

  service_config {
    available_memory = "512M"
    timeout_seconds  = 120
    ingress_settings = "ALLOW_ALL"
    environment_variables = {
      BUCKET_NAME = google_storage_bucket.weather_bucket.name
      PROJECT_ID  = var.project_id
      REGION      = "us-central1"
    }
  }

  event_trigger {
    event_type = "google.cloud.storage.object.v1.finalized"
    event_filters {
      attribute = "bucket"
      value     = google_storage_bucket.weather_bucket.name
    }
  }
}

# ---------------------------------------------------------
# 5️⃣ GKE Cluster (Simple: 1 node)
# ---------------------------------------------------------
resource "google_container_cluster" "weather_ui_cluster" {
  name                     = "weather-ui-cluster"
  location                 = "asia-south1-a"   # NOT region → ZONE
  remove_default_node_pool = true
  initial_node_count       = 1

  release_channel {
    channel = "REGULAR"
  }
}

resource "google_container_node_pool" "default_pool" {
  name       = "default-pool"
  cluster    = google_container_cluster.weather_ui_cluster.name
  location   = "asia-south1-a"
  node_count = 1

  node_config {
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
