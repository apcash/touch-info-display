import React from "react";
import Clock from "../components/Clock";
import WeatherCard from "../components/WeatherCard";
import PrinterCard from "../components/PrinterCard";
import Checklist from "../components/Checklist";
import { weather, printer } from "../demoData";

export default function DailySpacePage({ settings }) {
  return (
    <main id="main" className="daily-space-page">
      <div className="hero">
        <Clock hour24={settings.hour24} />
        <div className="welcome">
          <span className="status-dot" /> A little calm in your day.
          <p>A calmer view of home and what’s next.</p>
        </div>
      </div>

      <div className="dashboard">
        <WeatherCard weather={weather} unit={settings.unit} />
        <PrinterCard printer={printer} />
        <Checklist />
      </div>
    </main>
  );
}