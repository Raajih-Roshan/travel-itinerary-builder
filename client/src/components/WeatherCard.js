import { useState, useEffect } from "react";
import axios from "axios";

const WEATHER_THEMES = {
  Clear:        { icon: "☀️", bg: "#fff9e6", color: "#f59e0b", label: "Clear Sky" },
  Clouds:       { icon: "☁️", bg: "#f0f4f8", color: "#64748b", label: "Cloudy" },
  Rain:         { icon: "🌧️", bg: "#eff6ff", color: "#3b82f6", label: "Rainy" },
  Drizzle:      { icon: "🌦️", bg: "#eff6ff", color: "#60a5fa", label: "Drizzle" },
  Thunderstorm: { icon: "⛈️", bg: "#f5f3ff", color: "#7c3aed", label: "Thunderstorm" },
  Snow:         { icon: "❄️", bg: "#f0f9ff", color: "#0ea5e9", label: "Snowy" },
  Mist:         { icon: "🌫️", bg: "#f8fafc", color: "#94a3b8", label: "Misty" },
  Fog:          { icon: "🌫️", bg: "#f8fafc", color: "#94a3b8", label: "Foggy" },
  Haze:         { icon: "🌫️", bg: "#fefce8", color: "#ca8a04", label: "Hazy" },
  Smoke:        { icon: "🌫️", bg: "#fefce8", color: "#ca8a04", label: "Smoky" },
  Dust:         { icon: "🌪️", bg: "#fefce8", color: "#ca8a04", label: "Dusty" },
  Sand:         { icon: "🌪️", bg: "#fefce8", color: "#ca8a04", label: "Sandy" },
  Tornado:      { icon: "🌪️", bg: "#fff5f5", color: "#e53e3e", label: "Tornado" },
};

export default function WeatherCard({ destination }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!destination || destination.trim() === "") return;

    const apiKey = process.env.REACT_APP_WEATHER_KEY;

    if (!apiKey || apiKey === "your_actual_api_key_here") {
      setError("Add REACT_APP_WEATHER_KEY to client/.env");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    // Extract city — take part before comma
    const city = destination.split(",")[0].trim();

    axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    )
      .then(res => {
        setWeather(res.data);
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          setError("Invalid API key — check your .env file");
        } else if (err.response?.status === 404) {
          setError(`City "${city}" not found — update destination name`);
        } else {
          setError("Could not load weather — try again later");
        }
        setLoading(false);
      });
  }, [destination]);

  // Nothing to show if no destination
  if (!destination || destination.trim() === "") return null;

  // Loading state
  if (loading) return (
    <div className="weather-card" style={{ background: "#f8f8ff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "28px" }}>🌍</span>
        <div>
          <p style={{ fontWeight: "700", color: "#4f46e5", fontSize: "15px" }}>
            Fetching weather...
          </p>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
            📍 {destination}
          </p>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="weather-card" style={{ background: "#fff5f5", border: "1px solid #fed7d7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "24px" }}>❌</span>
        <div>
          <p style={{ fontWeight: "700", color: "#e53e3e", fontSize: "14px" }}>
            {error}
          </p>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
            📍 {destination}
          </p>
        </div>
      </div>
    </div>
  );

  // No data yet
  if (!weather) return null;

  const condition = weather.weather[0].main;
  const theme     = WEATHER_THEMES[condition] || WEATHER_THEMES["Clear"];
  const city      = destination.split(",")[0].trim();

  return (
    <div className="weather-card" style={{ background: theme.bg }}>

      {/* Header Row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "16px"
      }}>
        <div>
          <h3 style={{ color: "#1a1a2e", fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>
            🌍 Current Weather
          </h3>
          <p style={{ fontSize: "13px", color: "#888" }}>
            📍 {weather.name}, {weather.sys.country}
          </p>
        </div>
        <span style={{ fontSize: "44px", lineHeight: 1 }}>{theme.icon}</span>
      </div>

      {/* Temperature */}
      <div style={{
        display: "flex", alignItems: "flex-end",
        gap: "14px", marginBottom: "18px"
      }}>
        <span style={{
          fontSize: "56px", fontWeight: "800",
          color: theme.color, lineHeight: 1
        }}>
          {Math.round(weather.main.temp)}°C
        </span>
        <div style={{ paddingBottom: "8px" }}>
          <p style={{
            fontSize: "16px", fontWeight: "700",
            color: "#1a1a2e", textTransform: "capitalize",
            marginBottom: "2px"
          }}>
            {weather.weather[0].description}
          </p>
          <p style={{ fontSize: "13px", color: "#888" }}>
            Feels like {Math.round(weather.main.feels_like)}°C
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: "8px",
        marginBottom: "14px"
      }}>
        {[
          { icon: "💧", value: weather.main.humidity + "%",                     label: "Humidity" },
          { icon: "💨", value: Math.round(weather.wind.speed * 3.6) + " km/h",  label: "Wind" },
          { icon: "🌡️", value: Math.round(weather.main.temp_min) + "°C",        label: "Min" },
          { icon: "☀️", value: Math.round(weather.main.temp_max) + "°C",        label: "Max" },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.75)",
            borderRadius: "10px", padding: "10px 6px",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "4px",
            border: "1px solid " + theme.color + "22"
          }}>
            <span style={{ fontSize: "16px" }}>{stat.icon}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a2e" }}>
              {stat.value}
            </span>
            <span style={{ fontSize: "11px", color: "#888" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{
        fontSize: "11px", color: "#aaa",
        textAlign: "right", marginTop: "4px"
      }}>
        Updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}