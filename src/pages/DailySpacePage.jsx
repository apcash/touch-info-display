import React, { useEffect, useState } from "react";
import Clock from "../components/Clock";
import WeatherCard from "../components/WeatherCard";
import PrinterCard from "../components/PrinterCard";
import Checklist from "../components/Checklist";
import WifiCard from "../components/WifiCard";
import DailyVerseCard from "../components/DailyVerseCard";
import { dailyVerses } from "../dailyverses";
import { weather } from "../demoData";
import { readSaved, save } from "../storage";
import { fetchDailyVerse, getVerseDateKey  } from "../verseApi";
import { fetchWeather } from "../weatherApi";

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

  const [apiVerse, setApiVerse] = useState(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [verseError, setVerseError] = useState("");
  const [verseDate, setVerseDate] = useState(() => getVerseDateKey());

  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    let active = true;
    let refreshTimer;

    async function loadWeather() {
      let nextRefresh = 15 * 60_000;

      try {
        const result = await fetchWeather();

        if (active) {
          setLiveWeather(result);
          setWeatherError("");
        }
      } catch (error) {
        if (active) {
          setWeatherError(error.message);
        }

        nextRefresh = 5 * 60_000;
      } finally {
        if (active) {
          setWeatherLoading(false);
          refreshTimer = setTimeout(loadWeather, nextRefresh);
        }
      }
    }

    loadWeather();

    return () => {
      active = false;
      clearTimeout(refreshTimer);
    };
  }, []);


  useEffect(() => {
    save("touch-display.wifi", wifi);
  }, [wifi]);

  useEffect(() => {
    let active = true;
    let retryTimer;

    setVerseLoading(true);
    setVerseError("");
    setApiVerse(null);

    async function loadVerse() {
      try {
        const verse = await fetchDailyVerse();

        if (active) {
          setApiVerse(verse);
          setVerseError("");
        }
      } catch (error) {
        if (active) {
          setVerseError(error.message);

          retryTimer = setTimeout(loadVerse, 5 * 60_000);
        }
      } finally {
        if (active) {
          setVerseLoading(false);
        }
      }
    }

    loadVerse();

    return () => {
      active = false;
      clearTimeout(retryTimer);
    };
  }, [verseDate]);

  const [today, setToday] = useState(() => new Date());

  const dayNumber = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) /
      86_400_000
  );

  const verseIndex = dayNumber % dailyVerses.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
      setVerseDate(getVerseDateKey());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

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
        <WeatherCard
          weather={liveWeather ?? weather}
          unit={settings.unit}
          loading={weatherLoading}
          error={weatherError}
          isLive={liveWeather !== null}
        />        
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
        <PrinterCard />
        <DailyVerseCard
          verse={apiVerse ?? dailyVerses[verseIndex]}
          loading={verseLoading}
          error={verseError}
        />
        <Checklist />
      </div>
    </main>
  );
}