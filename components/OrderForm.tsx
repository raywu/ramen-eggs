"use client";

import { useState, useEffect, type FormEvent } from "react";
import FormField from "./FormField";
import { isOrderWindowOpen, getNextOrderWindow } from "@/lib/orderWindow";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function OrderForm() {
  const [open, setOpen] = useState(() => isOrderWindowOpen(new Date()));
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Re-check the gate every 30 seconds so the form appears/disappears live
  useEffect(() => {
    const id = setInterval(() => {
      setOpen(isOrderWindowOpen(new Date()));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      phone: data.get("phone") as string,
      zip: data.get("zip") as string,
      // TODO: add order-specific fields once Google Form entry IDs are provided
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }

      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setStatus("error");
    }
  }

  if (!open) {
    return <ClosedMessage />;
  }

  return (
    <section
      className="py-20 px-6 md:px-12 lg:px-24 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <h2
          className="text-2xl md:text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-wordmark)" }}
        >
          Place an Order
        </h2>
        <p className="text-base opacity-70">
          Fresh ramen eggs, made to order. Delivered weekly in Oakland &amp; Berkeley.
        </p>

        {status === "success" ? (
          <div
            className="mt-6 p-8 rounded-md text-center flex flex-col items-center gap-4"
            style={{ backgroundColor: "var(--color-border)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              ✓
            </div>
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-wordmark)" }}
            >
              Order received!
            </h3>
            <p className="opacity-70">
              We&apos;ll confirm your order in the WhatsApp group shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
            <FormField label="Your Name" required>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder="Jane Doe"
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="jane@example.com"
              />
            </FormField>

            <FormField label="Phone" required>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="+1 (510) 555-1234"
              />
            </FormField>

            <FormField label="Zip Code" required>
              <input
                type="text"
                name="zip"
                required
                className="form-input"
                placeholder="94612"
                inputMode="numeric"
                pattern="[0-9]{5}"
              />
            </FormField>

            {/* TODO: Add order-specific fields once Google Form entry IDs are provided */}

            {status === "error" && (
              <div
                className="p-3 rounded-md text-sm"
                role="alert"
                style={{
                  backgroundColor: "rgba(255, 92, 56, 0.1)",
                  color: "var(--color-accent)",
                  border: "1px solid var(--color-accent)",
                }}
              >
                {errorMessage}{" "}
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="underline font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="self-start text-base font-medium px-6 py-3 rounded-md transition-all hover:brightness-110 hover:shadow-[0_0_16px_rgba(255,92,56,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              {status === "submitting" ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function ClosedMessage() {
  const next = getNextOrderWindow(new Date());

  const day = next.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/Los_Angeles",
  });

  const time = next.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });

  return (
    <section
      className="py-20 px-6 md:px-12 lg:px-24 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{
            backgroundColor: "var(--color-border)",
          }}
        >
          🥚
        </div>
        <h2
          className="text-2xl md:text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-wordmark)" }}
        >
          Orders are currently closed
        </h2>
        <p className="text-base opacity-70">
          Our order window opens every{" "}
          <span className="font-semibold" style={{ color: "var(--color-accent)" }}>
            {day}
          </span>{" "}
          at{" "}
          <span className="font-semibold" style={{ color: "var(--color-accent)" }}>
            {time} PT
          </span>
          .
        </p>
        <p className="text-sm opacity-50">Check back then to place your order!</p>
      </div>
    </section>
  );
}
