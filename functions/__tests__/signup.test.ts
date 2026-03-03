import { describe, it, expect, vi, beforeEach } from "vitest";

const GOOGLE_FORMS_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc7c6kP2Bi0HXMM8-vtrsg-rMK5NeVaiNlM1i3UfEdakYkUvA/formResponse";

const validBody = {
  name: "Test User",
  email: "test@example.com",
  phone: "5105551234",
  zip: "94612",
  eggsCurrently: "2-5",
  eggsDesired: "6-10",
  whyNot: "Too expensive",
};

const env = {};

// Import the handler functions dynamically so we can mock fetch
let onRequestPost: (ctx: { request: Request; env: typeof env }) => Promise<Response>;
let onRequestOptions: (ctx: { request: Request; env: typeof env }) => Promise<Response>;

beforeEach(async () => {
  vi.restoreAllMocks();
  const mod = await import("../api/signup");
  onRequestPost = mod.onRequestPost as unknown as typeof onRequestPost;
  onRequestOptions = mod.onRequestOptions as unknown as typeof onRequestOptions;
});

function makeRequest(method: string, body?: object) {
  return new Request("https://theasianova.com/api/signup", {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://theasianova.com",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe("POST /api/signup", () => {
  it("returns 400 for invalid JSON", async () => {
    const request = new Request("https://theasianova.com/api/signup", {
      method: "POST",
      headers: { Origin: "https://theasianova.com" },
      body: "not json",
    });

    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 when required fields are missing", async () => {
    const request = makeRequest("POST", { name: "Test", email: "" });
    const res = await onRequestPost({ request, env });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("returns 400 for invalid egg option", async () => {
    const request = makeRequest("POST", {
      ...validBody,
      eggsCurrently: "999",
    });
    const res = await onRequestPost({ request, env });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid value for eggsCurrently");
  });

  it("returns 200 and posts to Google Forms on valid input", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const request = makeRequest("POST", validBody);
    const res = await onRequestPost({ request, env });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    expect(global.fetch).toHaveBeenCalledWith(GOOGLE_FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: expect.any(String),
    });

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = callArgs[1].body as string;
    expect(body).toContain("entry.");
  });

  it("returns 500 when Google Forms request fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    const request = makeRequest("POST", validBody);
    const res = await onRequestPost({ request, env });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to submit signup");
  });

  it("sets CORS headers on response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const request = makeRequest("POST", validBody);
    const res = await onRequestPost({ request, env });

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://theasianova.com"
    );
  });
});

describe("OPTIONS /api/signup", () => {
  it("returns 204 with CORS headers", async () => {
    const request = new Request("https://theasianova.com/api/signup", {
      method: "OPTIONS",
      headers: { Origin: "https://theasianova.com" },
    });

    const res = await onRequestOptions({ request, env });

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "POST, OPTIONS"
    );
  });

  it("returns 403 for disallowed origin", async () => {
    const request = new Request("https://theasianova.com/api/signup", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.com" },
    });

    const res = await onRequestOptions({ request, env });
    expect(res.status).toBe(403);
  });
});

describe("CORS origin allowlist", () => {
  it("returns 403 for disallowed origin on POST", async () => {
    const request = new Request("https://theasianova.com/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil.com",
      },
      body: JSON.stringify(validBody),
    });

    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(403);
  });

  it("allows private network IP origin", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const request = new Request("http://192.168.68.90:8788/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://192.168.68.90:8788",
      },
      body: JSON.stringify(validBody),
    });

    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://192.168.68.90:8788"
    );
  });

  it("allows localhost with port", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const request = new Request("http://localhost:3000/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:8788",
      },
      body: JSON.stringify(validBody),
    });

    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:8788"
    );
  });
});

describe("Backend validation", () => {
  it("returns 400 for invalid email", async () => {
    const request = makeRequest("POST", {
      ...validBody,
      email: "not-an-email",
    });
    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid email address");
  });

  it("returns 400 for invalid zip code", async () => {
    const request = makeRequest("POST", {
      ...validBody,
      zip: "9461",
    });
    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid zip code");
  });

  it("returns 400 for short phone number", async () => {
    const request = makeRequest("POST", {
      ...validBody,
      phone: "12345",
    });
    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid phone number");
  });

  it("accepts phone with formatting characters", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const request = makeRequest("POST", {
      ...validBody,
      phone: "+1 (510) 555-1234",
    });
    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(200);
  });
});
