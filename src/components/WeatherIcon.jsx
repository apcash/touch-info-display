import React from "react";

export default function WeatherIcon({ condition = "", size = 28 }) {
  const text = condition.toLowerCase();

  let drawing;

  const cloud = (
    <path d="M6 17a4 4 0 0 1-.4-8 6 6 0 0 1 11.6-1A4.5 4.5 0 0 1 18 17Z" />
  );

  if (text.includes("thunder")) {
    drawing = (
      <>
        {cloud}
        <path d="m13 13-3 5h4l-3 5" />
      </>
    );
  } else if (text.includes("rain") || text.includes("drizzle")) {
    drawing = (
      <>
        {cloud}
        <path d="m7 20-1 2m6-2-1 2m6-2-1 2" />
      </>
    );
  } else if (text.includes("snow")) {
    drawing = (
      <>
        <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7" />
        <path d="m9 4 3 3 3-3m-6 16 3-3 3 3" />
      </>
    );
  } else if (text.includes("fog")) {
    drawing = (
      <>
        <path d="M5 7h14M2 12h20M5 17h14" />
      </>
    );
  } else if (text.includes("partly")) {
    drawing = (
      <>
        <circle cx="7" cy="7" r="4" />
        <path d="M7 1V0M1 7H0M2 2l1 1" />
        {cloud}
      </>
    );
  } else if (text.includes("cloud") || text.includes("overcast")) {
    drawing = cloud;
  } else if (text.includes("night")) {
    drawing = <path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z" />;
  } else if (text.includes("clear") || text.includes("sun")) {
    drawing = (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    );
  } else {
    drawing = <path d="M8 12h8" />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="-1 -1 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {drawing}
    </svg>
  );
}