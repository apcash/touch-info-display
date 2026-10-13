import React, { useEffect, useState } from "react";
import { readSaved, save } from "./storage";
import DailySpacePage from "./pages/DailySpacePage";
import HomePage from "./pages/HomePage";
import DevotionalPage from "./pages/DevotionalPage";

const defaults = {
  unit: "F",
  hour24: false,
  theme: "light",
  lightStart: "07:00",
  darkStart: "19:00",
};

const validTime = (value) =>
  typeof value === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const validSettings = (s) =>
  s &&
  ["F", "C"].includes(s.unit) &&
  typeof s.hour24 === "boolean" &&
  ["light", "dark", "auto"].includes(s.theme) &&
  (s.lightStart === undefined || validTime(s.lightStart)) &&
  (s.darkStart === undefined || validTime(s.darkStart));

const pages = [
  { id: "home", label: "Home" },
  { id: "daily", label: "Daily Space" },
  { id: "devotional", label: "Daily Devotional" },
  { id: "recipes", label: "Recipes" },
  { id: "travel", label: "Travel" },  
  ];

export default function App() {
  const [settings, setSettings] = useState(() => ({
    ...defaults,
    ...readSaved("touch-display.settings", defaults, validSettings),
  }));


  const [showSettings, setShowSettings] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setStorageOk(save("touch-display.settings", settings));
  }, [settings]);
  function changeSetting(key, value) {
    setSettings((previous) => ({ ...previous, [key]: value }));
  }

  useEffect(() => {
  const timer = setInterval(() => {
    setNow(new Date());
  }, 60_000);

  return () => clearInterval(timer);
  }, []);

  const currentIndex = pages.findIndex(
    (page) => page.id === currentPage
  );

  const previousPage = pages[currentIndex - 1];
  const nextPage = pages[currentIndex + 1];

  function toMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lightStart = toMinutes(settings.lightStart);
  const darkStart = toMinutes(settings.darkStart);

  const isLightTime =
    lightStart < darkStart
      ? currentMinutes >= lightStart && currentMinutes < darkStart
      : currentMinutes >= lightStart || currentMinutes < darkStart;

  const scheduledTheme =
    lightStart === darkStart
      ? "light"
      : isLightTime
        ? "light"
        : "dark";

  const effectiveTheme =
  settings.theme === "auto" ? scheduledTheme : settings.theme;

  return (
    <div className={`app ${effectiveTheme} theme-${currentPage}`}>
      <div className="shell">
        <header>
          <a className="brand" href="#main">
            <span className="brand-mark" aria-hidden="true">
              ◈
            </span>{" "}
            at a glance<span className="brand-divider">/</span>
            <span className="brand-sub">{pages[currentIndex].label} · <span className="page-counter">{currentIndex + 1} of {pages.length}</span></span>
          </a>
          <button
            className="settings-button"
            aria-expanded={showSettings}
            aria-controls="settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙ <span>Display settings</span>
          </button>
        </header>
        {showSettings && (
          <section
            id="settings"
            className="settings-panel"
            aria-label="Display settings"
          >
            <label>
              Temperature
              <select
                value={settings.unit}
                onChange={(e) => changeSetting("unit", e.target.value)}
              >
                <option value="F">Fahrenheit (°F)</option>
                <option value="C">Celsius (°C)</option>
              </select>
            </label>
            <label>
              Appearance
              <select
                value={settings.theme}
                onChange={(e) => changeSetting("theme", e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Automatic</option>
              </select>
            </label>
            {settings.theme === "auto" && (
              <>
                <label>
                  Light starts
                  <input
                    type="time"
                    value={settings.lightStart}
                    onChange={(e) => {
                      if (validTime(e.target.value)) {
                        changeSetting("lightStart", e.target.value);
                      }
                    }}
                  />
                </label>

                <label>
                  Dark starts
                  <input
                    type="time"
                    value={settings.darkStart}
                    onChange={(e) => {
                      if (validTime(e.target.value)) {
                        changeSetting("darkStart", e.target.value);
                      }
                    }}
                  />
                </label>

                <p className="schedule-note">
                  Uses this device’s local time. Matching times keep light mode on.
                </p>
              </>
            )}
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.hour24}
                onChange={(e) => changeSetting("hour24", e.target.checked)}
              />
              24-hour clock
            </label>
            {!storageOk && (
              <p role="status">Settings could not be saved on this device.</p>
            )}
          </section>
        )}
          <div hidden={currentPage !== "home"}>
            <HomePage />
          </div>

          <div hidden={currentPage !== "daily"}>
            <DailySpacePage settings={settings} />
          </div>
          <div hidden={currentPage !== "devotional"}>
            <DevotionalPage />
          </div>
          {pages
            .filter((page) => ["recipes", "travel"].includes(page.id))
            .map((page) => (
            <div key={page.id} hidden={currentPage !== page.id}>
              <main>
                <section className="card">
                  <h1>{page.label}</h1>
                  <p>We’ll build this page next.</p>
                </section>
              </main>
            </div>
          ))}
          <nav aria-label="Page navigation">
            {previousPage && (
              <button
                className="page-arrow page-arrow-left"
                onClick={() => setCurrentPage(previousPage.id)}
                aria-label={`Go to ${previousPage.label}`}
              >
                ‹
              </button>
            )}

            {nextPage && (
              <button
                className="page-arrow page-arrow-right"
                onClick={() => setCurrentPage(nextPage.id)}
                aria-label={`Go to ${nextPage.label}`}
              >
                ›
              </button>
            )}
          </nav>
        <footer>
          <span>
            <span className="status-dot" /> Your personal home dashboard
          </span>
          <span>Weather & printer are samples · No services connected</span>
        </footer>
      </div>
    </div>
  );
}
