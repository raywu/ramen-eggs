import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import OrderForm from "../OrderForm";

// No mock of @/lib/orderWindow — exercises the real time-gate logic.

describe("OrderForm — time-gate integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/config") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the form when window just opened (Tue 8:30 AM PT)", () => {
    // Tue Jan 6 2026, 8:30 AM PST = 16:30 UTC
    vi.setSystemTime(new Date("2026-01-06T16:30:00Z"));
    render(<OrderForm />);
    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();
    expect(screen.queryByText(/orders are currently closed/i)).not.toBeInTheDocument();
  });

  it("shows the form near closing time (Tue 9:59 PM PT)", () => {
    // Tue Jan 6 2026, 9:59 PM PST = next day 05:59 UTC
    vi.setSystemTime(new Date("2026-01-07T05:59:00Z"));
    render(<OrderForm />);
    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();
  });

  it("shows closed message when window just closed (Tue 10:00 PM PT)", () => {
    // Tue Jan 6 2026, 10:00 PM PST = next day 06:00 UTC
    vi.setSystemTime(new Date("2026-01-07T06:00:00Z"));
    render(<OrderForm />);
    expect(screen.getByText(/orders are currently closed/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place Order" })).not.toBeInTheDocument();
  });

  it("shows closed message on wrong day (Mon 12:00 PM PT)", () => {
    // Mon Jan 5 2026, 12:00 PM PST = 20:00 UTC
    vi.setSystemTime(new Date("2026-01-05T20:00:00Z"));
    render(<OrderForm />);
    expect(screen.getByText(/orders are currently closed/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place Order" })).not.toBeInTheDocument();
  });

  it("shows closed message one minute before open (Tue 8:29 AM PT)", () => {
    // Tue Jan 6 2026, 8:29 AM PST = 16:29 UTC
    vi.setSystemTime(new Date("2026-01-06T16:29:00Z"));
    render(<OrderForm />);
    expect(screen.getByText(/orders are currently closed/i)).toBeInTheDocument();
    expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
    expect(screen.getByText(/8:30\s*AM/i)).toBeInTheDocument();
  });
});
