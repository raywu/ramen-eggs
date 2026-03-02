import { describe, it, expect, vi, beforeEach } from "vitest";

const GOOGLE_FORMS_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeKUZ2-OdTxR2wbVUo6-R2XvYZcydXLLelLn5KKbW8xkvc8qA/formResponse";

const validBody = {
  name: "Test User",
  phone: "+14155551234",
  quantity: "5",
};

const env = {};

let onRequestPost: (ctx: { request: Request; env: typeof env }) => Promise<Response>;
let onRequestOptions: (ctx: { request: Request; env: typeof env }) => Promise<Response>;

beforeEach(async () => {
  vi.restoreAllMocks();
  const mod = await import("../api/order");
  onRequestPost = mod.onRequestPost as unknown as typeof onRequestPost;
  onRequestOptions = mod.onRequestOptions as unknown as typeof onRequestOptions;
});

function makeRequest(method: string, body?: object) {
  return new Request("https://theasianova.com/api/order", {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://theasianova.com",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe("POST /api/order", () => {
  it("returns 400 for invalid JSON", async () => {
    const request = new Request("https://theasianova.com/api/order", {
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
    const request = makeRequest("POST", { name: "Test" });
    const res = await onRequestPost({ request, env });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing required fields");
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
    expect(body).toContain("entry.313849049=5");
    expect(body).toContain("entry.761528982");
    expect(body).toContain("entry.311114154=Test+User");
  });

  it("returns 500 when Google Forms request fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    const request = makeRequest("POST", validBody);
    const res = await onRequestPost({ request, env });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to submit order");
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

describe("OPTIONS /api/order", () => {
  it("returns 204 with CORS headers", async () => {
    const request = new Request("https://theasianova.com/api/order", {
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
    const request = new Request("https://theasianova.com/api/order", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.com" },
    });

    const res = await onRequestOptions({ request, env });
    expect(res.status).toBe(403);
  });
});

describe("CORS origin allowlist", () => {
  it("returns 403 for disallowed origin on POST", async () => {
    const request = new Request("https://theasianova.com/api/order", {
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

  it("allows localhost with port", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const request = new Request("http://localhost:3000/api/order", {
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
  it("returns 400 for invalid quantity", async () => {
    const request = makeRequest("POST", {
      ...validBody,
      quantity: "7",
    });
    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid quantity");
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
      phone: "+1 (415) 555-1234",
    });
    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(200);
  });
});
