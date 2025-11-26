require('dotenv').config();
const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const storage = new Storage();
const sm = new SecretManagerServiceClient();

// env-driven config (fallbacks kept for safety)
const bucketName = process.env.BUCKET_NAME || "weather-data-storage-vskarthik";
const projectId = process.env.GCP_PROJECT || process.env.GCP_PROJECT_ID || "bold-streamer-476213-u0";
const secretName = process.env.OPENWEATHER_SECRET || "openweather-api-key";

async function getApiKey() {
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await sm.accessSecretVersion({ name });
  return version.payload.data.toString("utf8");
}

const LOCATIONS = [
  { city: "London", lat: 51.5072, lon: -0.1276 },
  { city: "New York", lat: 40.7128, lon: -74.006 },
  { city: "Tokyo", lat: 35.6764, lon: 139.650 },
  { city: "Sydney", lat: -33.8688, lon: 151.2093 },
  { city: "Delhi", lat: 28.6139, lon: 77.2090 }
];

exports.fetchWeather = async (req, res) => {
  try {
    const results = [];
    const apiKey = await getApiKey();

    for (const { city, lat, lon } of LOCATIONS) {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await axios.get(url);
      results.push({ city, data: response.data });
      await new Promise(r => setTimeout(r, 1000)); // delay to stay under rate limit
    }

    const fileName = `weather_${Date.now()}.json`;
    const file = storage.bucket(bucketName).file(fileName);

    await file.save(JSON.stringify(results, null, 2));
    res.status(200).send("✅ Weather data stored successfully!");
  } catch (err) {
    console.error("Error fetching weather data:", err.response?.data || err.message);
    res.status(500).send("❌ Error fetching weather data.");
  }
};
