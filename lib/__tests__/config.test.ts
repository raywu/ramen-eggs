import { describe, it, expect } from "vitest";
import { parseConfigResponse, computePricing, getNextPickupDate, parseBundles } from "../config";

describe("parseConfigResponse", () => {
  it("converts values array to key-value map", () => {
    const values = [
      ["key", "value"],
      ["unit_price", "$1.50"],
      ["pickup_location", "San Pablo Park"],
    ];
    expect(parseConfigResponse(values)).toEqual({
      unit_price: "$1.50",
      pickup_location: "San Pablo Park",
    });
  });

  it("skips header row", () => {
    const values = [
      ["key", "value"],
      ["foo", "bar"],
    ];
    const result = parseConfigResponse(values);
    expect(result).not.toHaveProperty("key");
    expect(result).toEqual({ foo: "bar" });
  });

  it("handles empty values array", () => {
    expect(parseConfigResponse([])).toEqual({});
  });

  it("handles header-only array", () => {
    expect(parseConfigResponse([["key", "value"]])).toEqual({});
  });

  it("handles rows with missing value column", () => {
    const values = [
      ["key", "value"],
      ["foo"],
    ];
    expect(parseConfigResponse(values)).toEqual({ foo: "" });
  });
});

describe("computePricing", () => {
  it("computes bundle prices from unit price string", () => {
    const result = computePricing("$1.50", [5, 10, 15]);
    expect(result).toEqual([
      { qty: 5, total: "7.50" },
      { qty: 10, total: "15.00" },
      { qty: 15, total: "22.50" },
    ]);
  });

  it("handles unit price without dollar sign", () => {
    const result = computePricing("1.50", [5, 10, 15]);
    expect(result).toEqual([
      { qty: 5, total: "7.50" },
      { qty: 10, total: "15.00" },
      { qty: 15, total: "22.50" },
    ]);
  });

  it("returns empty array for invalid price", () => {
    expect(computePricing("free", [5, 10, 15])).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(computePricing("", [5, 10, 15])).toEqual([]);
  });
});

describe("parseBundles", () => {
  it("parses valid JSON array", () => {
    expect(parseBundles("[5, 10, 15]")).toEqual([5, 10, 15]);
  });

  it("parses single-element array", () => {
    expect(parseBundles("[3]")).toEqual([3]);
  });

  it("returns fallback for invalid JSON", () => {
    expect(parseBundles("not json")).toEqual([5, 10, 15]);
  });

  it("returns fallback for empty string", () => {
    expect(parseBundles("")).toEqual([5, 10, 15]);
  });

  it("returns fallback for non-array JSON", () => {
    expect(parseBundles('{"a":1}')).toEqual([5, 10, 15]);
  });

  it("filters out non-number elements", () => {
    expect(parseBundles('[3, "foo", 6]')).toEqual([3, 6]);
  });
});

describe("getNextPickupDate", () => {
  it("returns same-week Saturday when called on Tuesday", () => {
    // Tue Mar 3 2026, 12:00 PM PST = 20:00 UTC
    const result = getNextPickupDate(new Date("2026-03-03T20:00:00Z"));
    expect(result).toBe("Saturday, March 7");
  });

  it("returns that Saturday when called on Saturday", () => {
    // Sat Mar 7 2026, 10:00 AM PST = 18:00 UTC
    const result = getNextPickupDate(new Date("2026-03-07T18:00:00Z"));
    expect(result).toBe("Saturday, March 7");
  });

  it("returns next Saturday when called on Sunday", () => {
    // Sun Mar 8 2026, 10:00 AM PST = 18:00 UTC
    const result = getNextPickupDate(new Date("2026-03-08T18:00:00Z"));
    expect(result).toBe("Saturday, March 14");
  });

  it("returns same-week Saturday when called on Wednesday", () => {
    // Wed Mar 4 2026, 12:00 PM PST = 20:00 UTC
    const result = getNextPickupDate(new Date("2026-03-04T20:00:00Z"));
    expect(result).toBe("Saturday, March 7");
  });

  it("returns same-week Saturday when called on Friday", () => {
    // Fri Mar 6 2026, 12:00 PM PST = 20:00 UTC
    const result = getNextPickupDate(new Date("2026-03-06T20:00:00Z"));
    expect(result).toBe("Saturday, March 7");
  });

  it("computes date in PT regardless of system timezone", () => {
    // Late Saturday night UTC (Sun in many TZs, still Sat in PT)
    // Sat Mar 7 2026, 11:00 PM PST = Sun Mar 8 07:00 UTC
    const result = getNextPickupDate(new Date("2026-03-08T07:00:00Z"));
    expect(result).toBe("Saturday, March 7");
  });

  it("returns next Sunday when called on Tuesday with dow='Sunday'", () => {
    // Tue Mar 3 2026, 12:00 PM PST = 20:00 UTC
    const result = getNextPickupDate(new Date("2026-03-03T20:00:00Z"), "Sunday");
    expect(result).toBe("Sunday, March 8");
  });

  it("returns same-day Sunday when called on Sunday with dow='Sunday'", () => {
    // Sun Mar 8 2026, 10:00 AM PST = 18:00 UTC
    const result = getNextPickupDate(new Date("2026-03-08T18:00:00Z"), "Sunday");
    expect(result).toBe("Sunday, March 8");
  });

  it("returns next Sunday when called on Monday with dow='Sunday'", () => {
    // Mon Mar 2 2026, 12:00 PM PST = 20:00 UTC
    const result = getNextPickupDate(new Date("2026-03-02T20:00:00Z"), "Sunday");
    expect(result).toBe("Sunday, March 8");
  });

  it("falls back to Saturday for invalid dow", () => {
    const result = getNextPickupDate(new Date("2026-03-03T20:00:00Z"), "Funday");
    expect(result).toBe("Saturday, March 7");
  });

  it("output day name matches dow parameter", () => {
    const tue = new Date("2026-03-03T20:00:00Z");
    expect(getNextPickupDate(tue, "Sunday")).toMatch(/^Sunday,/);
    expect(getNextPickupDate(tue, "Saturday")).toMatch(/^Saturday,/);
    const sun = new Date("2026-03-08T18:00:00Z");
    expect(getNextPickupDate(sun, "Sunday")).toMatch(/^Sunday,/);
  });
});
