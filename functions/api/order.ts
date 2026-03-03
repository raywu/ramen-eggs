type Env = Record<string, unknown>;

interface OrderBody {
  name: string;
  phone: string;
  quantity: string;
}

const GOOGLE_FORM_ID = "e/1FAIpQLSeKUZ2-OdTxR2wbVUo6-R2XvYZcydXLLelLn5KKbW8xkvc8qA";
const ENTRY_IDS = {
  quantity: "entry.313849049",
  phone: "entry.761528982",
  name: "entry.311114154",
} as const;

const REQUIRED_FIELDS: (keyof OrderBody)[] = ["name", "phone", "quantity"];
const VALID_QUANTITIES = ["5", "10", "15"];

const ALLOWED_ORIGINS = [
  "https://theasianova.com",
  "https://www.theasianova.com",
  "http://localhost",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.some(
    (allowed) => origin === allowed || origin.startsWith(allowed + ":")
  )) return true;
  try {
    const host = new URL(origin).hostname;
    return host.startsWith("192.168.") ||
           host.startsWith("10.") ||
           /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  } catch { return false; }
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get("Origin");
  if (!isOriginAllowed(origin)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get("Origin");
  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders(origin),
  };

  let body: OrderBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers,
    });
  }

  const missing = REQUIRED_FIELDS.filter((f) => !body[f]?.trim());
  if (missing.length > 0) {
    return new Response(
      JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
      { status: 400, headers }
    );
  }

  if (!VALID_QUANTITIES.includes(body.quantity)) {
    return new Response(
      JSON.stringify({ error: "Invalid quantity" }),
      { status: 400, headers }
    );
  }

  const phoneDigits = body.phone.trim().replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return new Response(
      JSON.stringify({ error: "Invalid phone number" }),
      { status: 400, headers }
    );
  }

  const params = new URLSearchParams();
  params.set(ENTRY_IDS.name, body.name.trim());
  params.set(ENTRY_IDS.phone, body.phone.trim());
  params.set(ENTRY_IDS.quantity, body.quantity);

  try {
    const res = await fetch(
      `https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/formResponse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      console.error("Google Forms error:", res.status);
      return new Response(
        JSON.stringify({ error: "Failed to submit order" }),
        { status: 500, headers }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Google Forms request failed:", err);
    return new Response(
      JSON.stringify({ error: "Failed to submit order" }),
      { status: 500, headers }
    );
  }
};
