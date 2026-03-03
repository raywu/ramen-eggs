type Env = Record<string, unknown>;

interface SignupBody {
  name: string;
  email: string;
  phone: string;
  zip: string;
  eggsCurrently: string;
  eggsDesired: string;
  whyNot?: string;
}

const GOOGLE_FORM_ID = "e/1FAIpQLSc7c6kP2Bi0HXMM8-vtrsg-rMK5NeVaiNlM1i3UfEdakYkUvA";
const ENTRY_IDS = {
  name: "entry.1878275050",
  email: "entry.915034361",
  phone: "entry.982918510",
  zip: "entry.1612587858",
  eggsCurrently: "entry.1344513166",
  eggsDesired: "entry.1548593884",
  whyNot: "entry.1390610783",
} as const;

const REQUIRED_FIELDS: (keyof SignupBody)[] = [
  "name",
  "email",
  "phone",
  "zip",
  "eggsCurrently",
  "eggsDesired",
];

const VALID_EGG_OPTIONS = ["0-1", "2-5", "6-10", "10+"];

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

  let body: SignupBody;
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

  if (!VALID_EGG_OPTIONS.includes(body.eggsCurrently)) {
    return new Response(
      JSON.stringify({ error: "Invalid value for eggsCurrently" }),
      { status: 400, headers }
    );
  }

  if (!VALID_EGG_OPTIONS.includes(body.eggsDesired)) {
    return new Response(
      JSON.stringify({ error: "Invalid value for eggsDesired" }),
      { status: 400, headers }
    );
  }

  const params = new URLSearchParams();
  params.set(ENTRY_IDS.name, body.name.trim());
  params.set(ENTRY_IDS.email, body.email.trim());
  params.set(ENTRY_IDS.phone, body.phone.trim());
  params.set(ENTRY_IDS.zip, body.zip.trim());
  params.set(ENTRY_IDS.eggsCurrently, body.eggsCurrently);
  params.set(ENTRY_IDS.eggsDesired, body.eggsDesired);
  if (body.whyNot?.trim()) {
    params.set(ENTRY_IDS.whyNot, body.whyNot.trim());
  }

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
        JSON.stringify({ error: "Failed to submit signup" }),
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
      JSON.stringify({ error: "Failed to submit signup" }),
      { status: 500, headers }
    );
  }
};
