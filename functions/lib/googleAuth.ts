import { SignJWT, importPKCS8 } from "jose";

const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function getGoogleAccessToken(env: {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
}): Promise<string> {
  const pem = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pem, "RS256");

  const jwt = await new SignJWT({
    scope: SCOPES,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string };
  if (!data.access_token) {
    throw new Error("Token response missing access_token");
  }
  return data.access_token;
}
