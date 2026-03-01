import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the orderWindow module so we can control gating in tests
vi.mock("@/lib/orderWindow", () => ({
  isOrderWindowOpen: vi.fn(),
  getNextOrderWindow: vi.fn(),
}));

import OrderForm from "../OrderForm";
import { isOrderWindowOpen, getNextOrderWindow } from "@/lib/orderWindow";

const mockIsOpen = vi.mocked(isOrderWindowOpen);
const mockGetNext = vi.mocked(getNextOrderWindow);

function mockFetch(ok: boolean, body: object = {}) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

// Fill in the placeholder fields (name + email are always present)
async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Jane Doe"), "Test User");
  await user.type(
    screen.getByPlaceholderText("jane@example.com"),
    "test@example.com"
  );
  await user.type(
    screen.getByPlaceholderText("+1 (510) 555-1234"),
    "5105551234"
  );
  await user.type(screen.getByPlaceholderText("94612"), "94612");
}

describe("OrderForm — gating", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders closed message when order window is not open", () => {
    mockIsOpen.mockReturnValue(false);
    // Next Tuesday 2026-03-03 08:30 PST
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    render(<OrderForm />);

    expect(
      screen.getByText(/orders are currently closed/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });

  it("shows next order window time when closed", () => {
    mockIsOpen.mockReturnValue(false);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    render(<OrderForm />);

    // Should mention Tuesday and 8:30 AM
    expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
    expect(screen.getByText(/8:30\s*AM/i)).toBeInTheDocument();
  });

  it("renders the form when order window is open", () => {
    mockIsOpen.mockReturnValue(true);
    mockGetNext.mockReturnValue(new Date("2026-03-03T16:30:00Z"));

    render(<OrderForm />);

    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
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

  it("renders core contact fields", () => {
    render(<OrderForm />);

    expect(screen.getByText(/Your Name/)).toBeInTheDocument();
    expect(screen.getByText(/^Email/)).toBeInTheDocument();
    expect(screen.getByText(/Phone/)).toBeInTheDocument();
    expect(screen.getByText(/Zip/i)).toBeInTheDocument();
  });

  it("has a submit button", () => {
    render(<OrderForm />);
    expect(
      screen.getByRole("button", { name: "Submit" })
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
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      screen.getByRole("button", { name: "Submitting..." })
    ).toBeDisabled();
  });

  it("shows success confirmation after successful submission", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(true, { success: true });

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.getByText(/order received/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "Submit" })
    ).not.toBeInTheDocument();
  });

  it("shows error message when submission fails", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(false, { error: "Server error" });

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

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
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Try again"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit" })
    ).toBeEnabled();
  });

  it("sends payload to /api/order", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(true, { success: true });

    render(<OrderForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/order",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.name).toBe("Test User");
    expect(body.email).toBe("test@example.com");
    expect(body.phone).toBe("5105551234");
    expect(body.zip).toBe("94612");
  });
});
