import { describe, it, expect } from "vitest";
import { isOrderWindowOpen, getNextOrderWindow } from "../orderWindow";

// Helper: create a Date at a specific time in America/Los_Angeles.
// We construct UTC dates that correspond to the desired PT time.
// PT = UTC-8 (PST) or UTC-7 (PDT). These tests use specific UTC timestamps
// to avoid ambiguity.

describe("isOrderWindowOpen", () => {
  // Tuesday 2026-03-03 is a Tuesday

  it("returns true at exact open boundary (Tuesday 8:30 AM PT)", () => {
    // 2026-03-03 08:30 PST = 2026-03-03 16:30 UTC
    const tue830am = new Date("2026-03-03T16:30:00Z");
    expect(isOrderWindowOpen(tue830am)).toBe(true);
  });

  it("returns true mid-window (Tuesday 9:00 AM PT)", () => {
    // 2026-03-03 09:00 PST = 2026-03-03 17:00 UTC
    const tue9am = new Date("2026-03-03T17:00:00Z");
    expect(isOrderWindowOpen(tue9am)).toBe(true);
  });

  it("returns true just before close (Tuesday 9:59 PM PT)", () => {
    // 2026-03-03 21:59 PST = 2026-03-04 05:59 UTC
    const tue959pm = new Date("2026-03-04T05:59:00Z");
    expect(isOrderWindowOpen(tue959pm)).toBe(true);
  });

  it("returns false at exact close boundary (Tuesday 10:00 PM PT)", () => {
    // 2026-03-03 22:00 PST = 2026-03-04 06:00 UTC
    const tue10pm = new Date("2026-03-04T06:00:00Z");
    expect(isOrderWindowOpen(tue10pm)).toBe(false);
  });

  it("returns false just before open (Tuesday 8:29 AM PT)", () => {
    // 2026-03-03 08:29 PST = 2026-03-03 16:29 UTC
    const tue829am = new Date("2026-03-03T16:29:00Z");
    expect(isOrderWindowOpen(tue829am)).toBe(false);
  });

  it("returns false on Monday (wrong day)", () => {
    // Monday 2026-03-02 12:00 PST = 2026-03-02 20:00 UTC
    const monNoon = new Date("2026-03-02T20:00:00Z");
    expect(isOrderWindowOpen(monNoon)).toBe(false);
  });

  it("returns false on Wednesday (wrong day)", () => {
    // Wednesday 2026-03-04 09:00 PST = 2026-03-04 17:00 UTC
    const wed9am = new Date("2026-03-04T17:00:00Z");
    expect(isOrderWindowOpen(wed9am)).toBe(false);
  });

  it("returns false when UTC is Tuesday but PT is Monday (timezone edge)", () => {
    // Tuesday 2026-03-03 03:00 UTC = Monday 2026-03-02 19:00 PST
    const utcTuePtMon = new Date("2026-03-03T03:00:00Z");
    expect(isOrderWindowOpen(utcTuePtMon)).toBe(false);
  });

  it("returns true when UTC is Wednesday but PT is Tuesday evening (timezone edge)", () => {
    // Wednesday 2026-03-04 05:00 UTC = Tuesday 2026-03-03 21:00 PST
    const utcWedPtTue = new Date("2026-03-04T05:00:00Z");
    expect(isOrderWindowOpen(utcWedPtTue)).toBe(true);
  });

  it("handles PDT (daylight saving time) correctly", () => {
    // After DST spring forward (March 8, 2026): PT = UTC-7
    // Tuesday 2026-03-10 09:00 PDT = 2026-03-10 16:00 UTC
    const pdtTue9am = new Date("2026-03-10T16:00:00Z");
    expect(isOrderWindowOpen(pdtTue9am)).toBe(true);

    // Tuesday 2026-03-10 22:00 PDT = 2026-03-11 05:00 UTC
    const pdtTue10pm = new Date("2026-03-11T05:00:00Z");
    expect(isOrderWindowOpen(pdtTue10pm)).toBe(false);
  });
});

describe("getNextOrderWindow", () => {
  it("returns next day when called on Monday", () => {
    // Monday 2026-03-02 12:00 PST = 2026-03-02 20:00 UTC
    const monday = new Date("2026-03-02T20:00:00Z");
    const next = getNextOrderWindow(monday);
    // Should be Tuesday 2026-03-03 08:30 PST = 2026-03-03 16:30 UTC
    expect(next.toISOString()).toBe("2026-03-03T16:30:00.000Z");
  });

  it("returns same day when called on Tuesday before open", () => {
    // Tuesday 2026-03-03 07:00 PST = 2026-03-03 15:00 UTC
    const tueBefore = new Date("2026-03-03T15:00:00Z");
    const next = getNextOrderWindow(tueBefore);
    // Should be Tuesday 2026-03-03 08:30 PST = 2026-03-03 16:30 UTC
    expect(next.toISOString()).toBe("2026-03-03T16:30:00.000Z");
  });

  it("returns next Tuesday when called on Tuesday after close", () => {
    // Tuesday 2026-03-03 22:30 PST = 2026-03-04 06:30 UTC
    const tueAfter = new Date("2026-03-04T06:30:00Z");
    const next = getNextOrderWindow(tueAfter);
    // Next Tuesday is 2026-03-10, which is PDT (after DST Mar 8)
    // Tuesday 2026-03-10 08:30 PDT = 2026-03-10 15:30 UTC
    expect(next.toISOString()).toBe("2026-03-10T15:30:00.000Z");
  });

  it("returns next Tuesday when called on Wednesday", () => {
    // Wednesday 2026-03-04 12:00 PST = 2026-03-04 20:00 UTC
    const wed = new Date("2026-03-04T20:00:00Z");
    const next = getNextOrderWindow(wed);
    // Next Tuesday is 2026-03-10, which is PDT (after DST Mar 8)
    // Tuesday 2026-03-10 08:30 PDT = 2026-03-10 15:30 UTC
    expect(next.toISOString()).toBe("2026-03-10T15:30:00.000Z");
  });

  it("returns next Tuesday when called on Sunday", () => {
    // Sunday 2026-03-08 12:00 PST = 2026-03-08 20:00 UTC
    const sun = new Date("2026-03-08T20:00:00Z");
    const next = getNextOrderWindow(sun);
    // DST springs forward Mar 8 2026, so Mar 10 is PDT (UTC-7)
    // Tuesday 2026-03-10 08:30 PDT = 2026-03-10 15:30 UTC
    expect(next.toISOString()).toBe("2026-03-10T15:30:00.000Z");
  });

  it("returns next Tuesday during DST transition week", () => {
    // DST springs forward Sunday March 8, 2026
    // Saturday 2026-03-07 12:00 PST = 2026-03-07 20:00 UTC
    const sat = new Date("2026-03-07T20:00:00Z");
    const next = getNextOrderWindow(sat);
    // Tuesday 2026-03-10 08:30 PDT = 2026-03-10 15:30 UTC
    expect(next.toISOString()).toBe("2026-03-10T15:30:00.000Z");
  });
});
