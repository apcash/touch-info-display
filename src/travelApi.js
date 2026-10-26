import { supabase } from "./supabaseClient";

export async function fetchTravelers(ownerId, signal) {
  const { data, error } = await supabase
    .from("travel_people")
    .select("id, name, color")
    .eq("owner_id", ownerId)
    .order("created_at")
    .order("id")
    .abortSignal(signal);
  if (error) throw new Error("Unable to load travelers. Please try again.");
  return data;
}

export async function createTraveler(ownerId, name, color, signal) {
  const { data, error } = await supabase
    .from("travel_people")
    .insert({ owner_id: ownerId, name: name.trim(), color })
    .select("id, name, color")
    .abortSignal(signal)
    .single();
  if (error) {
    throw new Error("Could not confirm the save. Reload the travelers before trying again.");
  }
  return data;
}

export async function fetchVisits(ownerId, personId, signal) {
  const { data, error } = await supabase.from("travel_visits")
    .select("place_type, place_code").eq("owner_id", ownerId)
    .eq("person_id", personId).abortSignal(signal);
  if (error) throw new Error("Unable to load visits. Please reload.");
  return data;
}

export async function setVisited(ownerId, personId, place, visited, signal) {
  const row = { owner_id: ownerId, person_id: personId,
    place_type: place.type, place_code: place.code };
  const query = visited
    ? supabase.from("travel_visits").upsert(row, { onConflict: "person_id,place_type,place_code" })
    : supabase.from("travel_visits").delete().eq("owner_id", ownerId)
      .eq("person_id", personId).eq("place_type", place.type).eq("place_code", place.code);
  const { error } = await query.abortSignal(signal);
  if (error) throw new Error("Could not confirm the change. Reload visits before editing again.");
}

export async function updateTraveler(
  ownerId,
  personId,
  name,
  color,
  signal,
) {
  const { data, error } = await supabase
    .from("travel_people")
    .update({
      name: name.trim(),
      color,
    })
    .eq("owner_id", ownerId)
    .eq("id", personId)
    .select("id, name, color")
    .abortSignal(signal)
    .single();

  if (error) {
    throw new Error(
      "Could not confirm the update. Reload travelers before trying again.",
    );
  }

  return data;
}

export async function deleteTraveler(ownerId, personId, signal) {
  const { data, error } = await supabase
    .from("travel_people")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", personId)
    .select("id")
    .abortSignal(signal);

  if (error || data.length !== 1) {
    throw new Error(
      "Could not confirm the removal. Reload travelers before trying again.",
    );
  }
}