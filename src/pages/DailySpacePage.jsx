import React, { useEffect, useState } from "react";
import Clock from "../components/Clock";
import WeatherCard from "../components/WeatherCard";
import PrinterCard from "../components/PrinterCard";
import Checklist from "../components/Checklist";
import WifiCard from "../components/WifiCard";
import { weather, printer } from "../demoData";
import { readSaved, save } from "../storage";

const defaultWifi = {
  name: "",
  password: "",
};

function validWifi(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.password === "string"
  );
}

export default function DailySpacePage({ settings }) {

  const [wifi, setWifi] = useState(() =>
    readSaved("touch-display.wifi", defaultWifi, validWifi)
  );

  useEffect(() => {
    save("touch-display.wifi", wifi);
  }, [wifi]);

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
        <div className="wifi-section">
          <WifiCard wifi={wifi} />
            <details className="wifi-settings">
              <summary>Wi-Fi settings</summary>
                <label>
                  Wi-Fi network name
                  <input
                    type="text"
                    value={wifi.name}
                    onChange={(event) =>
                      setWifi({
                        ...wifi,
                        name: event.target.value,
                      })
                    }
                  />          
                </label>
                <label>
                    Wi-Fi password
                    <input
                      type="password"
                      value={wifi.password}
                      onChange={(event) =>
                        setWifi({
                          ...wifi,
                          password: event.target.value,
                        })
                      }
                    />
                  </label>
              </details>
        </div>
        <PrinterCard printer={printer} />
        <Checklist />
      </div>
    </main>
  );
}