import React from "react";
export default function WeatherCard({ weather, unit }) {
  const degrees = (c) => Math.round(unit === "F" ? (c * 9) / 5 + 32 : c);
  return (
    <section className="card weather-card" aria-labelledby="weather-title">
      <div className="card-heading">
        <h2 id="weather-title">Outside</h2>
        <span className="badge">Demo data</span>
      </div>
      <p className="muted">{weather.location}</p>
      <div className="weather-main">
        <span className="temperature">
          {degrees(weather.temperatureC)}
          <small>°{unit}</small>
        </span>
        <span className="sun" aria-hidden="true">
          ☀
        </span>
      </div>
      <p className="condition">{weather.condition}</p>
      <p className="muted">
        High {degrees(weather.highC)}° · Low {degrees(weather.lowC)}°
      </p>
      <div className="forecast">
        {weather.forecast.map((item) => (
          <div key={item.time}>
            <span>{item.time}</span>
            <span aria-hidden="true">☀</span>
            <strong>{degrees(item.c)}°</strong>
          </div>
        ))}
      </div>
      <div className="card-footer">
        <span>Humidity {weather.humidity}%</span>
        <span>Wind {weather.wind}</span>
      </div>
    </section>
  );
}
