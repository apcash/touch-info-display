import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = [
  "https://apcash.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin") ?? "";

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  function reply(body: unknown, status = 200) {
    return Response.json(body, { status, headers });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "GET") {
    return reply({ error: "Use GET." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const ownerId = Deno.env.get("NEST_OWNER_ID");
  const clientId = Deno.env.get("NEST_CLIENT_ID");
  const clientSecret = Deno.env.get("NEST_CLIENT_SECRET");
  const refreshToken = Deno.env.get("NEST_REFRESH_TOKEN");
  const deviceName = Deno.env.get("NEST_DEVICE_NAME");

  if (
    !supabaseUrl || !anonKey || !ownerId ||
    !clientId || !clientSecret || !refreshToken || !deviceName
  ) {
    return reply({ error: "Nest connection is not configured." }, 500);
  }

  const authorization = request.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (!token) {
    return reply({ error: "Sign in to view indoor temperature." }, 401);
  }

  try {
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (
            input: Parameters<typeof fetch>[0],
            init?: Parameters<typeof fetch>[1],
            ) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(10_000),
          }),
      },
    });

    // Verify the token with Supabase, not just decode its contents.
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return reply({ error: "Please sign in again." }, 401);
    }

    if (data.user.id !== ownerId) {
      return reply({ error: "This account cannot access this thermostat." }, 403);
    }

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!tokenResponse.ok) {
      return reply(
        { error: "Unable to renew the Google connection." },
        502,
      );
    }

    const googleTokens = await tokenResponse.json();

    if (typeof googleTokens.access_token !== "string") {
      return reply({ error: "Google returned an invalid token response." }, 502);
    }

    if (!/^enterprises\/[^/]+\/devices\/[^/]+$/.test(deviceName)) {
      return reply({ error: "Nest device configuration is invalid." }, 500);
    }

    const deviceResponse = await fetch(
      `https://smartdevicemanagement.googleapis.com/v1/${deviceName}`,
      {
        headers: {
          Authorization: `Bearer ${googleTokens.access_token}`,
        },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!deviceResponse.ok) {
      return reply({ error: "Unable to retrieve the thermostat reading." }, 502);
    }

    const device = await deviceResponse.json();
    const temperatureC =
      device.traits?.["sdm.devices.traits.Temperature"]
        ?.ambientTemperatureCelsius;

    if (
      typeof temperatureC !== "number" ||
      !Number.isFinite(temperatureC)
    ) {
      return reply({ error: "The thermostat returned no temperature." }, 502);
    }

    return reply({
      temperatureC,
      retrievedAt: new Date().toISOString(),
    });
  } catch {
    return reply({ error: "Indoor temperature is temporarily unavailable." }, 502);
  }
});