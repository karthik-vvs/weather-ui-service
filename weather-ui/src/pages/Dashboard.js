import React, { useEffect, useState } from "react";
import axios from "axios";
import WeatherCard from "../components/WeatherCard";
import Loader from "../components/Loader";

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const GCS_URL = "https://storage.googleapis.com/weather-data-storage-vskarthik/processed/processed_1762170502597.json";

        axios
            .get(GCS_URL)
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching weather data:", err);
                setLoading(false);
            });
    }, []);

    if(loading) return <Loader />;

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1>🌦️ AI Weather Insights</h1>
            <p style={{ color: "#666"}}>
                Real-time weather and AI-generated summaries.
            </p>

            {data?.raw?.length ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1.5rem",
                        marginTop: "2rem",
                    }}
                >
                    {data.raw.map((item, i) => (
                        <WeatherCard key={i} city={item.city} details={item.data} />
                    ))}
                </div>
            ) : (
                <p>No data found.</p>
            )}

            {data?.ai_output && (
  <div
    style={{
      marginTop: "3rem",
      background: "linear-gradient(135deg, #f0f4ff, #ffffff)",
      padding: "2rem",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      textAlign: "left",
      transition: "all 0.3s ease",
    }}
  >
    <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>🧠 AI Weather Insights</h2>
    <p style={{ color: "#555", marginBottom: "1.5rem" }}>
      Here’s what Gemini thinks about the latest weather trends across cities:
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.2rem",
      }}
    >
      {data.ai_output
                .split("\n\n")
                .filter((section) => section.startsWith("**"))
                .map((section, i) => {
                const cityMatch = section.match(/\*\*(.*?)\*\*/);
                const summaryMatch = section.match(/Short Descriptive Summary:\*\*(.*?)\n/);
                const moodMatch = section.match(/Mood\/Feeling Word:\*\*(.*)/);

                const city = cityMatch ? cityMatch[1] : `City ${i + 1}`;
                const summary = summaryMatch ? summaryMatch[1].trim() : "";
                const mood = moodMatch ? moodMatch[1].trim() : "";

                return (
                    <div
                    key={i}
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "1rem 1.2rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                    <h3 style={{ marginBottom: "0.5rem", color: "#2563eb" }}>{city}</h3>
                    <p style={{ fontSize: "0.95rem", color: "#444", marginBottom: "0.5rem" }}>
                        🌤️ {summary}
                    </p>
                    <p style={{ fontStyle: "italic", color: "#555" }}>
                        💭 Mood: <strong>{mood}</strong>
                    </p>
                    </div>
                );
                })}
            </div>
        </div>
        )}

        </div>
    );
};

export default Dashboard; 