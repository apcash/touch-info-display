import { supabase } from "./supabaseClient";

export async function fetchPrinterStatus(userId) {
  if (!supabase) {
    throw new Error("Account connection is not configured.");
  }

  if (!userId) {
    throw new Error("Sign in to view printer information.");
  }

  const { data, error } = await supabase
    .from("printer_status")
    .select(`
      printer_name,
      connected,
      state,
      progress_percent,
      remaining_minutes,
      nozzle_temperature_c,
      bed_temperature_c,
      reported_at
    `)
    .eq("owner_id", userId)
    .abortSignal(AbortSignal.timeout(10_000))
    .maybeSingle();

  if (error) {
    throw new Error("Unable to retrieve printer status.");
  }

  return data;
}