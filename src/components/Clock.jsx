import React, { useEffect, useState } from "react";

export default function Clock({ hour24 }) {
  const [now, setNow] = useState(() => new Date());
  // Effects connect to things outside React. Cleanup prevents duplicate timers.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="clock" aria-label="Current local time">
      <p className="eyebrow">A little space for your day</p>
      <h1>
        {now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: !hour24,
        })}
      </h1>
      <p className="date">
        {now.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
      <span className="local-time">Device local time</span>
    </section>
  );
}
