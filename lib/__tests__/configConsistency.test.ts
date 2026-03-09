import { describe, it, expect } from "vitest";

const DAY_NAME_TO_ISO: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
};

// OPEN_DAY from lib/orderWindow.ts (ISO: 1=Mon … 7=Sun)
const OPEN_DAY = 2; // Tuesday

describe.skipIf(!process.env.CONFIG_SHEET_ID)(
  "config/time-gate consistency (integration)",
  () => {
    it("order_dow from sheet matches hardcoded OPEN_DAY", async () => {
      const { getGoogleAccessToken } = await import("../../functions/lib/googleAuth");
      const env = {
        GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY!,
      };
      const token = await getGoogleAccessToken(env);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.CONFIG_SHEET_ID}/values/Config`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { values?: string[][] } = await res.json();
      const rows = data.values ?? [];
      const orderDowRow = rows.find((r) => r[0] === "order_dow");
      expect(orderDowRow).toBeDefined();
      const orderDow = orderDowRow![1];
      const isoDay = DAY_NAME_TO_ISO[orderDow];
      expect(isoDay).toBeDefined();
      expect(isoDay).toBe(OPEN_DAY);
    });
  },
);
