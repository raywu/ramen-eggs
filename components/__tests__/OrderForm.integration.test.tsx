import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import OrderForm from "../OrderForm";

// No mock of @/lib/orderWindow — exercises the real time-gate logic.

function mockConfigResponse(config: Record<string, string>) {
  const values = [
    ["key", "value"],
    ...Object.entries(config),
  ];
  return {
    ok: true,
    json: () => Promise.resolve({ values }),
  };
}

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

describe("OrderForm — config-driven bundles", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Tue Jan 6 2026, 12:00 PM PST = 20:00 UTC (inside order window)
    vi.setSystemTime(new Date("2026-01-06T20:00:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("uses bundles from config for dropdown options", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/config") {
        return Promise.resolve(mockConfigResponse({
          unit_price: "$2.00",
          bundles: "[3, 6, 9]",
        }));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<OrderForm />);
    await waitFor(() => {
      const options = screen.getAllByRole("option").filter(o => o.getAttribute("value") !== "");
      expect(options.map(o => o.textContent)).toEqual(["3", "6", "9"]);
    });
  });

  it("uses bundles from config for pricing display", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/config") {
        return Promise.resolve(mockConfigResponse({
          unit_price: "$2.00",
          bundles: "[3, 6, 9]",
        }));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<OrderForm />);
    await waitFor(() => {
      expect(screen.getByText(/3 eggs — \$6\.00/)).toBeInTheDocument();
      expect(screen.getByText(/6 eggs — \$12\.00/)).toBeInTheDocument();
      expect(screen.getByText(/9 eggs — \$18\.00/)).toBeInTheDocument();
    });
  });

  it("falls back to default bundles when config has no bundles key", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/config") {
        return Promise.resolve(mockConfigResponse({
          unit_price: "$1.50",
        }));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<OrderForm />);
    await waitFor(() => {
      const options = screen.getAllByRole("option").filter(o => o.getAttribute("value") !== "");
      expect(options.map(o => o.textContent)).toEqual(["5", "10", "15"]);
    });
  });
});
