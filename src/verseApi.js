import { readSaved, save } from "./storage";


export function getVerseDateKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type) =>
    parts.find((part) => part.type === type).value;

  return [
    getPart("year"),
    getPart("month"),
    getPart("day"),
  ].join("-");
}

export async function fetchDailyVerse() {
    const today = getVerseDateKey();

    const cachedVerse = readSaved(
    "touch-display.daily-verse",
    null,
    (verse) =>
        verse !== null &&
        typeof verse === "object" &&
        verse.date === today &&
        verse.translation === "ESV" &&
        typeof verse.text === "string" &&
        verse.text.trim().length > 0 &&
        typeof verse.reference === "string" &&
        verse.reference.trim().length > 0
    );

    if (cachedVerse) {
    return cachedVerse;
    }

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("Supabase connection settings are missing.");
  }

  const response = await fetch(
    `${baseUrl}/functions/v1/daily-verse`,
    {
      signal: AbortSignal.timeout(15_000),
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Verse request failed (${response.status}).`);
  }

  const data = await response.json();

  if (
    typeof data?.text !== "string" ||
    !data.text.trim() ||
    typeof data?.reference !== "string" ||
    !data.reference.trim() ||
    data.translation !== "ESV" ||
    data.date !== getVerseDateKey()
  ) {
    throw new Error("The verse response was incomplete or out of date.");
  }

  save("touch-display.daily-verse", data);

  return data;
}