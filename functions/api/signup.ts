interface Env {
  AIRTABLE_PAT: string;
}

interface SignupBody {
  name: string;
  email: string;
  phone: string;
  zip: string;
  eggsCurrently: string;
  eggsDesired: string;
  whyNot?: string;
}

const AIRTABLE_BASE_ID = "app0reAWbVwTy2hZQ";
const AIRTABLE_TABLE_ID = "tbl2J2MAEBNL0KFnM";

const REQUIRED_FIELDS: (keyof SignupBody)[] = [
  "name",
  "email",
  "phone",
  "zip",
  "eggsCurrently",
  "eggsDesired",
];

const VALID_EGG_OPTIONS = ["0-1", "2-5", "6-10", "10+"];

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin")),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get("Origin");
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

  const airtablePayload = {
    fields: {
      "Your Name": body.name.trim(),
      Email: body.email.trim(),
      "Phone (for WhatsApp)": body.phone.trim(),
      "Zip code": body.zip.trim(),
      "How many ramen eggs do you eat every week?": body.eggsCurrently,
      "How many ramen eggs would you like to eat every week?": body.eggsDesired,
      "If you don't have as many ramen eggs as you'd like to, why not?":
        body.whyNot?.trim() || "",
    },
  };

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AIRTABLE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airtablePayload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Airtable error:", err);
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
    console.error("Airtable request failed:", err);
    return new Response(
      JSON.stringify({ error: "Failed to submit signup" }),
      { status: 500, headers }
    );
  }
};
