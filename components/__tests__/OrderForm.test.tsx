import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/orderWindow", () => ({
  isOrderWindowOpen: vi.fn(),
  getNextOrderWindow: vi.fn(),
}));

import OrderForm from "../OrderForm";
import { isOrderWindowOpen, getNextOrderWindow } from "@/lib/orderWindow";

const mockIsOpen = vi.mocked(isOrderWindowOpen);
const mockGetNext = vi.mocked(getNextOrderWindow);

const configValues = {
  values: [
    ["key", "value"],
    ["unit_price", "$1.50"],
    ["order_deadline", "10:00 PM"],
    ["pickup_location", "San Pablo Park"],
    ["pickup_window", "1-3 PM"],
  ],
};

const storeClosedConfig = {
  values: [
    ["key", "value"],
    ["store_status", "closed"],
    ["store_closure_note", "Taking a break for the holidays"],
    ["store_reopen_date", "January 5, 2027"],
  ],
};

const storeClosedNoDateConfig = {
  values: [
    ["key", "value"],
    ["store_status", "closed"],
    ["store_closure_note", "We'll be back soon"],
  ],
};

function mockFetchWithStoreConfig(configData: object) {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/config") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(configData),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
}

function mockFetch(ok: boolean, body: object = {}) {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/config") {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      });
    }
    return Promise.resolve({
      ok,
      json: () => Promise.resolve(body),
    });
  });
}

function mockFetchWithConfig(ok: boolean, body: object = {}) {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/config") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(configValues),
      });
    }
    return Promise.resolve({
      ok,
      json: () => Promise.resolve(body),
    });
  });
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Jane Doe"), "Test User");
  await user.selectOptions(screen.getByRole("combobox"), "10");
  await user.type(
    screen.getByPlaceholderText("+141533333333"),
    "+14155551234"
  );
}

describe("OrderForm — gating", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders closed message when order window is not open", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    render(<OrderForm />);

    expect(
      screen.getByText(/orders are currently closed/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place Order" })).not.toBeInTheDocument();
  });

  it("shows next order window time when closed", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    render(<OrderForm />);

    expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
    expect(screen.getByText(/8:30\s*AM/i)).toBeInTheDocument();
  });

  it("renders the form when ?preview=true on localhost", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    Object.defineProperty(window, "location", {
      value: { search: "?preview=true", hostname: "localhost" },
      writable: true,
    });

    render(<OrderForm />);

    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      value: { search: "", hostname: "localhost" },
      writable: true,
    });
  });

  it("renders the form when ?preview=true on private IP (192.168.x.x)", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    Object.defineProperty(window, "location", {
      value: { search: "?preview=true", hostname: "192.168.68.90" },
      writable: true,
    });

    render(<OrderForm />);

    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      value: { search: "", hostname: "localhost" },
      writable: true,
    });
  });

  it("renders the form when ?preview=true on 10.x.x.x", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    Object.defineProperty(window, "location", {
      value: { search: "?preview=true", hostname: "10.0.0.1" },
      writable: true,
    });

    render(<OrderForm />);

    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      value: { search: "", hostname: "localhost" },
      writable: true,
    });
  });

  it("renders the form when ?preview=true on 172.16.x.x", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    Object.defineProperty(window, "location", {
      value: { search: "?preview=true", hostname: "172.16.0.1" },
      writable: true,
    });

    render(<OrderForm />);

    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      value: { search: "", hostname: "localhost" },
      writable: true,
    });
  });

  it("blocks ?preview=true on production hostname", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    Object.defineProperty(window, "location", {
      value: { search: "?preview=true", hostname: "theasianova.com" },
      writable: true,
    });

    render(<OrderForm />);

    expect(
      screen.getByText(/orders are currently closed/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place Order" })).not.toBeInTheDocument();

    Object.defineProperty(window, "location", {
      value: { search: "", hostname: "localhost" },
      writable: true,
    });
  });

  it("renders the form when order window is open", () => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    render(<OrderForm />);

    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();
    expect(
      screen.queryByText(/orders are currently closed/i)
    ).not.toBeInTheDocument();
  });
});

describe("OrderForm — form rendering", () => {
  beforeEach(() => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders all form fields", () => {
    render(<OrderForm />);

    expect(screen.getByText(/Your Name/)).toBeInTheDocument();
    expect(screen.getByText(/How many Ramen Eggs/)).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp Number/)).toBeInTheDocument();
  });

  it("renders quantity dropdown with correct options", () => {
    render(<OrderForm />);

    const select = screen.getByRole("combobox");
    const options = [...select.querySelectorAll("option")].map(o => o.textContent);
    expect(options).toContain("5");
    expect(options).toContain("10");
    expect(options).toContain("15");
  });

  it("has a submit button", () => {
    render(<OrderForm />);
    expect(
      screen.getByRole("button", { name: "Place Order" })
    ).toBeInTheDocument();
  });
});

describe("OrderForm — submission", () => {
  beforeEach(() => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    expect(
      screen.getByRole("button", { name: "Placing Order..." })
    ).toBeDisabled();
  });

  it("shows success confirmation after successful submission", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(true, { success: true });

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    await waitFor(() => {
      expect(screen.getByText(/order received/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "Place Order" })
    ).not.toBeInTheDocument();
  });

  it("shows error message when submission fails", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(false, { error: "Server error" });

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Server error");
    });

    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("resets to form state when Try again is clicked", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(false, { error: "Server error" });

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    await waitFor(() => {
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Try again"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Place Order" })
    ).toBeEnabled();
  });

  it("sends correct payload to /api/order", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(true, { success: true });

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/order",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const orderCall = calls.find((c) => c[0] === "/api/order");
    expect(orderCall).toBeDefined();
    const body = JSON.parse(orderCall![1].body);
    expect(body.name).toBe("Test User");
    expect(body.phone).toBe("+14155551234");
    expect(body.quantity).toBe("10");
  });
});

describe("OrderForm — store closure", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows store closed message when store_status is closed", async () => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
    global.fetch = mockFetchWithStoreConfig(storeClosedConfig);

    render(<OrderForm />);

    await waitFor(() => {
      expect(screen.getByText("Taking a break for the holidays")).toBeInTheDocument();
    });
    expect(screen.getByText(/January 5, 2027/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place Order" })).not.toBeInTheDocument();
  });

  it("shows store closed message without reopen date when not provided", async () => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
    global.fetch = mockFetchWithStoreConfig(storeClosedNoDateConfig);

    render(<OrderForm />);

    await waitFor(() => {
      expect(screen.getByText("We'll be back soon")).toBeInTheDocument();
    });
    expect(screen.queryByText(/We'll be back on/)).not.toBeInTheDocument();
  });

  it("shows fallback heading when store is closed with no closure note", async () => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
    global.fetch = mockFetchWithStoreConfig({
      values: [
        ["key", "value"],
        ["store_status", "closed"],
      ],
    });

    render(<OrderForm />);

    await waitFor(() => {
      expect(screen.getByText(/temporarily closed/i)).toBeInTheDocument();
    });
  });

  it("shows form when store_status is open and within time window", async () => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
    global.fetch = mockFetchWithStoreConfig({
      values: [
        ["key", "value"],
        ["store_status", "open"],
        ["unit_price", "$1.50"],
      ],
    });

    render(<OrderForm />);

    await waitFor(() => {
      expect(screen.getByTestId("order-info")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();
  });

  it("preview mode bypasses store closure", async () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
    global.fetch = mockFetchWithStoreConfig(storeClosedConfig);

    Object.defineProperty(window, "location", {
      value: { search: "?preview=true", hostname: "localhost" },
      writable: true,
    });

    render(<OrderForm />);

    expect(screen.getByRole("button", { name: "Place Order" })).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      value: { search: "", hostname: "localhost" },
      writable: true,
    });
  });

  it("shows regular closed message when store is open but outside time window", async () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
    global.fetch = mockFetchWithStoreConfig({
      values: [
        ["key", "value"],
        ["store_status", "open"],
      ],
    });

    render(<OrderForm />);

    expect(screen.getByText(/orders are currently closed/i)).toBeInTheDocument();
  });
});

describe("OrderForm — info panel", () => {
  beforeEach(() => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows info panel when config loads", async () => {
    global.fetch = mockFetchWithConfig(true, { success: true });

    render(<OrderForm />);

    await waitFor(() => {
      expect(screen.getByTestId("order-info")).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Fresh ramen eggs, made to order/)).toHaveLength(1);
    expect(screen.getByText(/5 eggs — \$7\.50/)).toBeInTheDocument();
    expect(screen.getByText(/10 eggs — \$15\.00/)).toBeInTheDocument();
    expect(screen.getByText(/15 eggs — \$22\.50/)).toBeInTheDocument();
    expect(screen.getByText(/Orders close tonight at 10:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/San Pablo Park/)).toBeInTheDocument();
    expect(screen.getByText(/Payment via Venmo only/)).toBeInTheDocument();

    // Structural: pricing renders as a list with 3 items
    const orderInfo = screen.getByTestId("order-info");
    const list = orderInfo.querySelector("ul");
    expect(list).not.toBeNull();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);

    // Structural: no background container
    expect(orderInfo).not.toHaveStyle({ backgroundColor: "var(--color-border)" });

    // Structural: each list item has an accent dot
    items.forEach((item) => {
      const dot = item.querySelector("span");
      expect(dot).not.toBeNull();
      expect(dot!.style.backgroundColor).toBe("var(--color-accent)");
    });
  });

  it("shows fallback when config fails", async () => {
    global.fetch = mockFetch(true, { success: true });

    render(<OrderForm />);

    await waitFor(() => {
      expect(screen.getByText(/Fresh ramen eggs, made to order/)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Fresh ramen eggs, made to order/)).toHaveLength(1);
    expect(screen.queryByTestId("order-info")).not.toBeInTheDocument();
  });
});
