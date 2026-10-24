import { supabase } from "./supabaseClient";

export async function fetchIndoorTemperature() {
  if (!supabase) {
    throw new Error("Account connection is not configured.");
  }

  const { data, error } = await supabase.functions.invoke(
    "nest-temperature",
    {
      method: "GET",
      signal: AbortSignal.timeout(35_000),
    }
  );

  if (error) {
    throw new Error("Unable to retrieve indoor temperature.");
  }

  if (
    !Number.isFinite(data?.temperatureC) ||
    typeof data?.retrievedAt !== "string" ||
    !Number.isFinite(Date.parse(data.retrievedAt))
  ) {
    throw new Error("The thermostat returned an incomplete reading.");
  }

  return data;
}