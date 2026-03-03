import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SignupForm from "../SignupForm";

function mockFetch(ok: boolean, body: object = {}) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

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
  await user.selectOptions(screen.getAllByRole("combobox")[0], "2-5");
  await user.selectOptions(screen.getAllByRole("combobox")[1], "6-10");
}

describe("SignupForm", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders all form fields with correct labels", () => {
    render(<SignupForm />);

    expect(screen.getByText(/Your Name/)).toBeInTheDocument();
    expect(screen.getByText(/^Email/)).toBeInTheDocument();
    expect(screen.getByText(/Phone \(for WhatsApp\)/)).toBeInTheDocument();
    expect(screen.getByText(/Zip code/)).toBeInTheDocument();
    expect(
      screen.getByText(/How many ramen eggs do you eat every week\?/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /How many ramen eggs would you like to eat every week\?/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/If you don't have as many ramen eggs/)
    ).toBeInTheDocument();
  });

  it("renders helper text for zip and eggs fields", () => {
    render(<SignupForm />);

    expect(
      screen.getByText("So that we can organize the beta group into batches")
    ).toBeInTheDocument();
    expect(
      screen.getByText("On average, how many a week do you have them?")
    ).toBeInTheDocument();
  });

  it("has a submit button", () => {
    render(<SignupForm />);
    expect(
      screen.getByRole("button", { name: "Join the Beta" })
    ).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Join the Beta" }));

    expect(
      screen.getByRole("button", { name: "Joining..." })
    ).toBeDisabled();
  });

  it("shows success confirmation after successful submission", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(true, { success: true });

    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Join the Beta" }));

    await waitFor(() => {
      expect(screen.getByText("You're in!")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "Join the Beta" })
    ).not.toBeInTheDocument();
  });

  it("shows error message when submission fails", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(false, { error: "Server error" });

    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Join the Beta" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Server error");
    });

    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("resets to form state when Try again is clicked", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(false, { error: "Server error" });

    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Join the Beta" }));

    await waitFor(() => {
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Try again"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Join the Beta" })
    ).toBeEnabled();
  });

  it("sends correct payload to /api/signup", async () => {
    const user = userEvent.setup();
    global.fetch = mockFetch(true, { success: true });

    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Join the Beta" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          phone: "5105551234",
          zip: "94612",
          eggsCurrently: "2-5",
          eggsDesired: "6-10",
          whyNot: "",
        }),
      });
    });
  });
});
