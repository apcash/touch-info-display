import React from "react";
import WeatherIcon from "./WeatherIcon";
import useIndoorTemperature from "../hooks/useIndoorTemperature";


export default function WeatherCard({ 
    weather,
    unit,
    loading,
    error,
    isLive, 
  }) {

    const indoor = useIndoorTemperature();

  const degrees = (c) => Math.round(unit === "F" ? (c * 9) / 5 + 32 : c);

  return (
    <section className="card weather-card" aria-labelledby="weather-title">
      <div className="card-heading">
        <h2 id="weather-title">Outside</h2>
        <span className="badge">
          {loading
            ? "Loading"
            : error
              ? isLive
                ? "Last available"
                : "Sample data"
              : isLive
                ? "Updated"
                : "Sample data"}
        </span>
      </div>
      <p className="muted">{weather.location}</p>
      {error && (
        <p className="muted" role="status">
          {isLive
            ? "Weather refresh failed. Showing the last available forecast."
            : "Weather unavailable. Showing sample data."}
        </p>
      )}
      <div className="weather-main">
        <span className="temperature">
          {degrees(weather.temperatureC)}
          <small>°{unit}</small>
        </span>
        <div className="indoor-reading">
          <span className="indoor-label">Inside</span>
          {indoor.configured && indoor.signedIn && !indoor.loading &&
           !indoor.error && indoor.reading ? (
            <span className="indoor-temperature">
              {degrees(indoor.reading.temperatureC)}<small>°{unit}</small>
            </span>
          ) : (
            <span className="indoor-status">
              {!indoor.configured ? "Not configured" : indoor.loading ? "Loading…" :
                !indoor.signedIn ? "Sign in through Settings" : "Unavailable"}
            </span>
          )}
        </div>
        <span className="sun" aria-hidden="true">
          <WeatherIcon condition={weather.condition} size={64} />
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
            <span
              role="img"
              aria-label={item.condition ?? "Sample conditions"}
            >
              <WeatherIcon condition={item.condition} size={24} />
            </span>
            <strong>{degrees(item.c)}°</strong>
          </div>
        ))}
      </div>
      <div className="card-footer">
        <span>Humidity {weather.humidity}%</span>
        <span>
          Wind{" "}
          {Number.isFinite(weather.windKmh)
            ? `${Math.round(
                unit === "F" ? weather.windKmh / 1.609344 : weather.windKmh
              )} ${unit === "F" ? "mph" : "km/h"}`
            : "—"}
        </span>
        <span title="Current UV is a weather-model estimate">
          UV now{" "}
          {Number.isFinite(weather.uvNow)
            ? weather.uvNow.toFixed(1)
            : "—"}
          {" · Peak "}
          {Number.isFinite(weather.uvMax)
            ? weather.uvMax.toFixed(1)
            : "—"}
        </span>
      </div>
      <p className="weather-credit">
        Weather data by{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open-Meteo
        </a>
      </p>
    </section>
  );
}

