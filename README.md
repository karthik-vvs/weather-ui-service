**🌦️ Serverless Event-Driven Microservice with GenAI + Visualization on GCP**

End-to-End Cloud-Native Weather Intelligence Platform

This project implements a fully-serverless, event-driven microservice architecture on Google Cloud Platform (GCP).
It collects real-time weather data, enriches it using Vertex AI (Gemini), stores results, and visualizes them through a modern React UI deployed on GKE.
It also includes secure logging, secret management, least-privilege IAM, and cost-optimized infra provisioning using Terraform.

**🚀 Architecture Overview**
```
Cloud Scheduler → Fetch Function → GCS → Process Function → AI Summary → GCS → UI (GKE)
                                      ↑
                               Secret Manager
                                                 ↓
                                       Frontend Logs → Log Receiver (Cloud Run) → Cloud Logging
```

**✅ Core Components**

**1. Weather Data Ingestion (Serverless Cron + Cloud Function)**

**🔹 Cloud Scheduler**

Triggers every **30 minutes**:

 - Calls a Cloud Function (Gen2)

 - Pulls weather for 5 locations (London, New York, Tokyo, Sydney, Delhi)

**🔹 Fetch Function**

 - Calls OpenWeather API

 - Stores raw data in Cloud Storage

 - Reads API key securely from Secret Manager

**🔹 Storage**

 - Raw JSON stored in weather-data-bucket

 - Organized by timestamp

**🔹 Infrastructure as Code**

Implemented fully with **Terraform**:

 - Scheduler

 - Functions

 - Storage

 - Secret Manager

 - Service accounts

 - IAM bindings

**2. AI Processing (Google Vertex AI + Cloud Function)**

**🔹 Process Function**

Triggered automatically when new raw weather JSON arrives in GCS.

Steps:

**1.** Parse raw weather data

**2.** Send prompt to Vertex AI Gemini model

**3.** Produce:

    - Mood (e.g., “gloomy”, “pleasant”, “humid”)

    - Human description (“Partly cloudy with a refreshing breeze.”)

**4.** Store enriched output back to GCS for the UI

This builds practical experience with serverless + AI APIs.

**3. UI Application (React + Docker + GKE)**
**🔹 React Dashboard**

 - Displays weather info in a clean table

 - Loads:

    * Temperature

    * Humidity

    * City

    * Mood (AI-generated)

    * Summary (AI-generated)

**🔹 Containerization**

UI packaged using Docker:
```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
CMD ["npx", "serve", "-s", "build", "-l", "8080"]
```

**🔹 Deployment on GKE**

Single-node cluster

Deployment + Service via manifest or Helm

LoadBalancer exposes the dashboard

**4. Frontend Logging → Cloud Logging (Simple & Serverless)**

**🎯 Goal**

Capture frontend errors and send them to Google Cloud Logging.
No agents, no backend API changes — just a tiny Cloud Function.

✔️ What was added

**A) Frontend error listener**

src/components/logging.js:

const LOG_ENDPOINT = "https://<YOUR_LOG_RECEIVER_URL>";

```
function send(payload) {
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  if (navigator.sendBeacon) return navigator.sendBeacon(LOG_ENDPOINT, blob);

  fetch(LOG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function initLogging() {
  window.addEventListener("error", (event) => {
    send({
      ts: new Date().toISOString(),
      level: "ERROR",
      msg: event.error?.message || event.message,
      url: window.location.href,
      ua: navigator.userAgent,
      source: "frontend",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    send({
      ts: new Date().toISOString(),
      level: "ERROR",
      msg: event.reason?.message || String(event.reason),
      url: window.location.href,
      ua: navigator.userAgent,
      source: "frontend",
    });
  });
}
```

Then activated in:

src/index.js:

```
import { initLogging } from "./components/logging";
initLogging();
```

**B) Log Receiver Function (Cloud Run / Cloud Function Gen2)**

logReceiver/index.js:

```
exports.logReceiver = (req, res) => {
  console.log(
    JSON.stringify({
      resource: "frontend-log",
      timestamp: new Date().toISOString(),
      ...req.body,
    })
  );
  res.status(204).end();
};
```

Deploy:

```
gcloud functions deploy logReceiver \
  --gen2 \
  --region=asia-south1 \
  --runtime=nodejs20 \
  --entry-point=logReceiver \
  --trigger-http \
  --allow-unauthenticated
```

**C) Verification (CLI)**
```
gcloud logging read \
'resource.type="cloud_run_revision" AND resource.labels.service_name="logreceiver"' \
--limit=20 \
--order=desc \
--project=<PROJECT_ID>
```

If you see:
```
jsonPayload.resource="frontend-log"
```

→ Logging works.


**🔐 Security Additions**

**✔️ Secret Manager**

API keys stored in Secret Manager, never hard-coded.

**✔️ Least Privilege IAM**

 - Fetch Function SA → only Secret Accessor

 - Process Function SA → only Storage + Vertex AI permissions

 - GKE Workload Identity recommended

 - Cloud Scheduler → Cloud Functions Invoker only

**💰 Cost Optimization Measures**

 - Cloud Functions (Gen2) — pay per use

 - GCS — almost free for small JSON files

 - GKE — single-node cluster (e2-medium)

 - Vertex AI — only billed per request

 - Logging — small volumes, fits in free tier

 - No VMs, no long-running servers

**📊 Demo Flow (Presentation Script)**

Use this in your final demo:

**1. Show Scheduler → Function → GCS**

 - “Every 30 minutes, the fetch function triggers and stores weather JSON.”

**2. Show Vertex AI Enrichment**

 - “When new data lands, the AI function generates mood + summary.”

**3. Show UI on GKE**

 - “UI retrieves AI-enriched weather and visualizes it.”

**4. Trigger a frontend error**

 - throw new Error("demo-" + Date.now()) in browser console

 - View logs in Cloud Logging.

**5. Show Terraform**

 - “All infrastructure fully reproducible.”

**🏁 Final Outcome**

You have built a complete, production-style cloud system:

✔ Serverless ingestion

✔ Serverless AI processing

✔ Visualization via GKE

✔ Secure secret management

✔ Structured logging pipeline

✔ IAAC (Terraform)

✔ Low-cost and scalable

✔ Clean architecture for presentation