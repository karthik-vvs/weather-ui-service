// src/logging.js
const LOG_ENDPOINT = "https://logreceiver-hazatmij2a-el.a.run.app"; // from gcloud describe

function send(payload) {
  try {
    // sendBeacon is fire-and-forget and best for unload/error scenarios
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon) return navigator.sendBeacon(LOG_ENDPOINT, blob);
    // fallback
    fetch(LOG_ENDPOINT, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } }).catch(()=>{});
  } catch (e) {
    // swallow — logging must not break the app
    console.warn("log send failed", e);
  }
}

export function initLogging() {
  window.addEventListener("error", (event) => {
    const payload = {
      ts: new Date().toISOString(),
      level: "ERROR",
      msg: event.error?.message || String(event.error || event.message),
      url: window.location.href,
      ua: navigator.userAgent,
      source: "frontend"
    };
    send(payload);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const payload = {
      ts: new Date().toISOString(),
      level: "ERROR",
      msg: event.reason?.message || String(event.reason),
      url: window.location.href,
      ua: navigator.userAgent,
      source: "frontend"
    };
    send(payload);
  });
}
