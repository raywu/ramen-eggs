import { getGoogleAccessToken } from "../lib/googleAuth";

interface ConfigEnv {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  CONFIG_SHEET_ID: string;
}

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

const PUBLIC_KEYS = new Set([
  "unit_price",
  "bundles",
  "order_deadline",
  "pickup_location",
  "pickup_window_start",
  "pickup_window_end",
  "pickup_dow",
  "order_dow",
  "store_status",
  "store_reopen_date",
  "store_closure_note",
]);

const ALLOWED_ORIGINS = [
  "https://theasianova.com",
  "https://www.theasianova.com",
  "http://localhost",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(
    (allowed) => origin === allowed || origin.startsWith(allowed + ":")
  );
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin":
      origin && isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const onRequestOptions: PagesFunction<ConfigEnv> = async ({
  request,
}) => {
  const origin = request.headers.get("Origin");
  if (origin && !isOriginAllowed(origin)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
};

export const onRequestGet: PagesFunction<ConfigEnv> = async ({
  request,
  env,
}) => {
  const origin = request.headers.get("Origin");
  if (origin && !isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders(origin),
  };

  if (
    !env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !env.GOOGLE_PRIVATE_KEY ||
    !env.CONFIG_SHEET_ID
  ) {
    return new Response(
      JSON.stringify({ error: "Missing configuration" }),
      { status: 500, headers }
    );
  }

  try {
    const token = await getGoogleAccessToken(env);

    const url = `${SHEETS_API}/${env.CONFIG_SHEET_ID}/values/Config`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Sheets API error:", res.status, body);
      return new Response(
        JSON.stringify({ error: "Failed to fetch config" }),
        { status: 500, headers }
      );
    }

    const data: { values?: string[][] } = await res.json();

    if (data.values) {
      data.values = [
        data.values[0],
        ...data.values.slice(1).filter((row) => PUBLIC_KEYS.has(row[0])),
      ];
    }

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (err) {
    console.error("Config fetch failed:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch config" }),
      { status: 500, headers }
    );
  }
};
