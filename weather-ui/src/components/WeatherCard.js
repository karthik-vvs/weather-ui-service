import React from "react";
import { WiCloudy, WiDaySunny, WiRain, WiWindy } from "react-icons/wi";

const WeatherCard = ({ city, details }) => {
  const weather = details.weather[0].main;
  const temp = details.main.temp.toFixed(1);
  const humidity = details.main.humidity;
  const wind = details.wind?.speed || details.main.speed;

  const getIcon = () => {
    switch (weather) {
      case "Clouds":
        return <WiCloudy size={60} color="#60a5fa" />;
      case "Rain":
        return <WiRain size={60} color="#3b82f6" />;
      case "Clear":
        return <WiDaySunny size={60} color="#facc15" />;
      default:
        return <WiWindy size={60} color="#64748b" />;
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)",
        borderRadius: "16px",
        padding: "1.8rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        transform: "scale(1)",
      }}
      className="weather-card"
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>{city}</h2>
      <div style={{ fontSize: "3rem" }}>{getIcon()}</div>

      <div style={{ marginTop: "1rem", fontSize: "1.1rem", color: "#444" }}>
        <p>🌡️ <strong>{temp}°C</strong></p>
        <p>💧 Humidity: {humidity}%</p>
        <p>🌬️ Wind: {wind} m/s</p>
      </div>

      <div
        style={{
          marginTop: "1.2rem",
          fontStyle: "italic",
          color: "#555",
          background: "rgba(255,255,255,0.5)",
          padding: "0.5rem",
          borderRadius: "8px",
          fontSize: "0.95rem",
        }}
      >
        {weather === "Clear"
          ? "Perfect day for a walk! ☀️"
          : weather === "Rain"
          ? "Grab your umbrella! 🌧️"
          : weather === "Clouds"
          ? "A bit cloudy — cozy vibes ☁️"
          : "Stay breezy 🌬️"}
      </div>
    </div>
  );
};

export default WeatherCard;
