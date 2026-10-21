function describeWeather(code, isDay) {
  if (code === 0) {
    return {
      condition: isDay ? "Clear skies" : "Clear night",
      icon: isDay ? "☀" : "☾",
    };
  }

  if (code === 1) {
    return {
      condition: "Mostly clear",
      icon: isDay ? "☀" : "☾",
    };
  }

  if (code === 2) {
    return { condition: "Partly cloudy", icon: "⛅" };
  }

  if (code === 3) {
    return { condition: "Overcast", icon: "☁" };
  }

  if ([45, 48].includes(code)) {
    return { condition: "Foggy", icon: "🌫" };
  }

  if ([51, 53, 55].includes(code)) {
    return { condition: "Drizzle", icon: "🌦" };
  }

  if ([56, 57, 66, 67].includes(code)) {
    return { condition: "Freezing rain or drizzle", icon: "🌧" };
  }

  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return { condition: "Rain", icon: "🌧" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { condition: "Snow", icon: "❄" };
  }

  if ([95, 96, 99].includes(code)) {
    return { condition: "Thunderstorms", icon: "⛈" };
  }

  return { condition: "Conditions unavailable", icon: "—" };
}

export async function fetchWeather() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  // Approximate city coordinates for Citrus Heights, California.
  url.searchParams.set("latitude", "38.7071");
  url.searchParams.set("longitude", "-121.2811");
  url.searchParams.set("timezone", "America/Los_Angeles");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("forecast_days", "2");

  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day,uv_index"
  );

  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,is_day"
  );

  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,uv_index_max"
  );

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status}).`);
  }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    if (
    !Number.isFinite(current?.temperature_2m) ||
    !Number.isFinite(daily?.temperature_2m_max?.[0]) ||
    !Number.isFinite(daily?.temperature_2m_min?.[0])
    ) {
    throw new Error("The weather response was incomplete.");
    }

    const description = describeWeather(
    current.weather_code,
    current.is_day === 1
    );

    const hourly = data.hourly;

    if (
    typeof current.time !== "string" ||
    !Array.isArray(hourly?.time) ||
    !Array.isArray(hourly?.temperature_2m) ||
    !Array.isArray(hourly?.weather_code) ||
    !Array.isArray(hourly?.is_day)
    ) {
    throw new Error("The hourly forecast was incomplete.");
    }

    const firstIndex = hourly.time.findIndex(
    (time) => time > current.time
    );

    const forecast = firstIndex === -1
    ? []
    : [0, 3, 6, 9]
        .map((offset) => {
            const index = firstIndex + offset;
            const timestamp = hourly.time[index];
            const temperature = hourly.temperature_2m[index];

            if (!timestamp || !Number.isFinite(temperature)) {
            return null;
            }

            const hour = Number(timestamp.slice(11, 13));
            const label = `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;

            const description = describeWeather(
            hourly.weather_code[index],
            hourly.is_day[index] === 1
            );

            return {
            time: label,
            c: temperature,
            icon: description.icon,
            condition: description.condition,
            };
        })
        .filter((item) => item !== null);

    return {
    location: "Citrus Heights, CA",
    temperatureC: current.temperature_2m,
    highC: daily.temperature_2m_max[0],
    lowC: daily.temperature_2m_min[0],
    uvMax: daily.uv_index_max?.[0] ?? null,
    uvNow: current.uv_index ?? null,
    condition: description.condition,
    icon: description.icon,
    humidity: current.relative_humidity_2m,
    windKmh: current.wind_speed_10m,
    forecast: forecast,
    };
}