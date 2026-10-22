function validNumber(
  value: unknown,
  min: number,
  max: number,
  integer = false,
) {
  return value === null || (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max &&
    (!integer || Number.isInteger(value))
  );
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Use POST." },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const uploadToken = Deno.env.get("PRINTER_UPLOAD_TOKEN");
  const ownerId = Deno.env.get("PRINTER_OWNER_ID");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!uploadToken || !ownerId || !supabaseUrl || !serviceKey) {
    return Response.json(
      { error: "Printer service is not configured." },
      { status: 500 },
    );
  }

  if (request.headers.get("x-printer-token") !== uploadToken) {
    return Response.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Expected a JSON body." },
      { status: 400 },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    typeof body.connected !== "boolean"
  ) {
    return Response.json(
      { error: "A boolean connected field is required." },
      { status: 400 },
    );
  }

  // Each upload is a complete snapshot.
  // Missing readings are stored as null, not zero.
  const snapshot = {
    connected: body.connected,
    state: body.state ?? null,
    progress_percent: body.progress_percent ?? null,
    remaining_minutes: body.remaining_minutes ?? null,
    nozzle_temperature_c: body.nozzle_temperature_c ?? null,
    bed_temperature_c: body.bed_temperature_c ?? null,
  };

  if (
    !(
      snapshot.state === null ||
      (typeof snapshot.state === "string" &&
        snapshot.state.length <= 64)
    ) ||
    !validNumber(snapshot.progress_percent, 0, 100, true) ||
    !validNumber(snapshot.remaining_minutes, 0, 100_000, true) ||
    !validNumber(snapshot.nozzle_temperature_c, -50, 500) ||
    !validNumber(snapshot.bed_temperature_c, -50, 200)
  ) {
    return Response.json(
      { error: "Invalid printer readings." },
      { status: 400 },
    );
  }

  const reportedAt = new Date().toISOString();

  try {
    const url = new URL("/rest/v1/printer_status", supabaseUrl);

    // The owner comes from our secret, never from the request.
    url.searchParams.set("owner_id", `eq.${ownerId}`);
    url.searchParams.set("select", "owner_id");

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...snapshot,
        reported_at: reportedAt,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return Response.json(
        { error: "Could not save printer status." },
        { status: 502 },
      );
    }

    const rows = await response.json();

    if (!Array.isArray(rows) || rows.length !== 1) {
      return Response.json(
        { error: "The configured printer row was not found." },
        { status: 404 },
      );
    }

    return Response.json({
      ok: true,
      reported_at: reportedAt,
    });
  } catch {
    return Response.json(
      { error: "Printer storage is temporarily unavailable." },
      { status: 502 },
    );
  }
});