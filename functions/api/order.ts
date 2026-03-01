type Env = Record<string, unknown>;

interface OrderBody {
  name: string;
  email: string;
  phone: string;
  zip: string;
  // TODO: add order-specific fields once Google Form entry IDs are provided
}

const GOOGLE_FORM_ID = "e/1FAIpQLSeKUZ2-OdTxR2wbVUo6-R2XvYZcydXLLelLn5KKbW8xkvc8qA";
const ENTRY_IDS = {
  name: "entry.PLACEHOLDER_NAME",
  email: "entry.PLACEHOLDER_EMAIL",
  phone: "entry.PLACEHOLDER_PHONE",
  zip: "entry.PLACEHOLDER_ZIP",
  // TODO: add order-specific entry IDs once Google Form details are provided
} as const;

const REQUIRED_FIELDS: (keyof OrderBody)[] = [
  "name",
  "email",
  "phone",
  "zip",
];

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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return new Response(
      JSON.stringify({ error: "Invalid email address" }),
      { status: 400, headers }
    );
  }

  if (!/^\d{5}$/.test(body.zip.trim())) {
    return new Response(
      JSON.stringify({ error: "Invalid zip code" }),
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
  params.set(ENTRY_IDS.email, body.email.trim());
  params.set(ENTRY_IDS.phone, body.phone.trim());
  params.set(ENTRY_IDS.zip, body.zip.trim());
  // TODO: set order-specific entry params once entry IDs are provided

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
