import { describe, it, expect, vi, beforeEach } from "vitest";

class MockSignJWT {
  setProtectedHeader() { return this; }
  setIssuer() { return this; }
  setAudience() { return this; }
  setIssuedAt() { return this; }
  setExpirationTime() { return this; }
  async sign() { return "mock-jwt"; }
}

vi.mock("jose", () => ({
  importPKCS8: vi.fn().mockResolvedValue("mock-private-key"),
  SignJWT: MockSignJWT,
}));

const validEnv = {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@project.iam.gserviceaccount.com",
  GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----\n",
  CONFIG_SHEET_ID: "test-sheet-id",
};

const sheetData = {
  range: "Config!A1:B15",
  majorDimension: "ROWS",
  values: [
    ["key", "value"],
    ["unit_price", "$1.50"],
    ["pickup_location", "San Pablo Park"],
    ["form_responses_sheet_url", "https://docs.google.com/secret"],
    ["whatsapp_beta_invite_link", "https://chat.whatsapp.com/secret"],
    ["order_deadline", "10:00 PM"],
  ],
};

let onRequestGet: (ctx: { request: Request; env: typeof validEnv }) => Promise<Response>;
let onRequestOptions: (ctx: { request: Request; env: typeof validEnv }) => Promise<Response>;

beforeEach(async () => {
  vi.restoreAllMocks();
  const mod = await import("../api/config");
  onRequestGet = mod.onRequestGet as unknown as typeof onRequestGet;
  onRequestOptions = mod.onRequestOptions as unknown as typeof onRequestOptions;
});

function makeRequest(origin = "https://theasianova.com") {
  return new Request("https://theasianova.com/api/config", {
    method: "GET",
    headers: { Origin: origin },
  });
}

describe("GET /api/config", () => {
  it("returns only public keys from sheet data", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ access_token: "tok" }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sheetData) });

    const res = await onRequestGet({ request: makeRequest(), env: validEnv });
    expect(res.status).toBe(200);

    const data = await res.json();
    const keys = data.values.slice(1).map((r: string[]) => r[0]);
    expect(keys).toContain("unit_price");
    expect(keys).toContain("pickup_location");
    expect(keys).toContain("order_deadline");
    expect(keys).not.toContain("form_responses_sheet_url");
    expect(keys).not.toContain("whatsapp_beta_invite_link");
    expect(data.values[0]).toEqual(["key", "value"]);
  });

  it("returns 500 when env vars are missing", async () => {
    const res = await onRequestGet({
      request: makeRequest(),
      env: { GOOGLE_SERVICE_ACCOUNT_EMAIL: "", GOOGLE_PRIVATE_KEY: "", CONFIG_SHEET_ID: "" },
    });
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Missing configuration");
  });

  it("returns 500 when Google API returns error", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ access_token: "tok" }) })
      .mockResolvedValueOnce({ ok: false, status: 403, text: () => Promise.resolve("Forbidden") });

    const res = await onRequestGet({ request: makeRequest(), env: validEnv });
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Failed to fetch config");
  });

  it("returns 500 when token exchange returns error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve('{"error":"invalid_grant"}'),
    });

    const res = await onRequestGet({ request: makeRequest(), env: validEnv });
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Failed to fetch config");
  });

  it("returns 500 when auth throws", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("network error"));

    const res = await onRequestGet({ request: makeRequest(), env: validEnv });
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Failed to fetch config");
  });

  it("sets CORS headers on success", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ access_token: "tok" }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sheetData) });

    const res = await onRequestGet({ request: makeRequest(), env: validEnv });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://theasianova.com");
  });

  it("sets CORS headers on error", async () => {
    const res = await onRequestGet({
      request: makeRequest(),
      env: { GOOGLE_SERVICE_ACCOUNT_EMAIL: "", GOOGLE_PRIVATE_KEY: "", CONFIG_SHEET_ID: "" },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://theasianova.com");
  });
});

describe("OPTIONS /api/config", () => {
  it("returns 204 with CORS headers", async () => {
    const request = new Request("https://theasianova.com/api/config", {
      method: "OPTIONS",
      headers: { Origin: "https://theasianova.com" },
    });

    const res = await onRequestOptions({ request, env: validEnv });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });

  it("returns 403 for disallowed origin", async () => {
    const request = new Request("https://theasianova.com/api/config", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.com" },
    });

    const res = await onRequestOptions({ request, env: validEnv });
    expect(res.status).toBe(403);
  });
});

describe("CORS origin allowlist", () => {
  it("returns 403 for disallowed origin on GET", async () => {
    const res = await onRequestGet({
      request: makeRequest("https://evil.com"),
      env: validEnv,
    });
    expect(res.status).toBe(403);
  });

  it("allows GET with no Origin header (same-origin)", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ access_token: "tok" }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sheetData) });

    const request = new Request("https://theasianova.com/api/config", {
      method: "GET",
    });
    const res = await onRequestGet({ request, env: validEnv });
    expect(res.status).toBe(200);
  });

  it("allows localhost with port", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ access_token: "tok" }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sheetData) });

    const res = await onRequestGet({
      request: makeRequest("http://localhost:8788"),
      env: validEnv,
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:8788");
  });
});
