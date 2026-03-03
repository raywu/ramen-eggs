"use client";

import { useState, useEffect, type FormEvent } from "react";
import FormField from "./FormField";
import { isOrderWindowOpen, getNextOrderWindow } from "@/lib/orderWindow";
import { parseConfigResponse, computePricing, getNextPickupDate } from "@/lib/config";

type FormStatus = "idle" | "submitting" | "success" | "error";

const QUANTITY_OPTIONS = ["5", "10", "15"];

function usePreviewMode() {
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isLocal = window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1";
    if (params.get("preview") === "true" && isLocal) setPreview(true);
  }, []);
  return preview;
}

export default function OrderForm() {
  const preview = usePreviewMode();
  const [open, setOpen] = useState(() => isOrderWindowOpen(new Date()));
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [config, setConfig] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.values) setConfig(parseConfigResponse(data.values));
      })
      .catch(() => {});
  }, []);

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
      phone: data.get("phone") as string,
      quantity: data.get("quantity") as string,
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

  if (!open && !preview) {
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
        {config ? (
          <OrderInfo config={config} />
        ) : (
          <p className="text-base opacity-70">
            Fresh ramen eggs, made to order. Pickup Saturday 1PM–3PM in Oakland / Berkeley.
          </p>
        )}

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
              We&apos;ll confirm your order on WhatsApp shortly.
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

            <FormField
              label="How many Ramen Eggs would you like?"
              required
              hint="Eat them within 7 days"
            >
              <select name="quantity" required className="form-input" defaultValue="">
                <option value="" disabled>
                  Select...
                </option>
                {QUANTITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="WhatsApp Number" required hint="e.g. +141533333333">
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="+141533333333"
              />
            </FormField>

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

const QUANTITIES = [5, 10, 15];

function OrderInfo({ config }: { config: Record<string, string> }) {
  const pricing = config.unit_price
    ? computePricing(config.unit_price, QUANTITIES)
    : [];
  const pickupDate = getNextPickupDate(new Date());
  const pickupWindow = config.pickup_window ?? "";
  const pickupLocation = config.pickup_location ?? "";
  const deadline = config.order_deadline ?? "";

  return (
    <div className="flex flex-col gap-3" data-testid="order-info">
      <p className="text-base opacity-70">Fresh ramen eggs, made to order.</p>
      {pricing.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {pricing.map(({ qty, total }) => (
            <li key={qty} className="flex items-center gap-2 text-sm opacity-70">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "var(--color-accent)" }}
              />
              {qty} eggs — ${total}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-1 text-sm opacity-50">
        {deadline && <p>Orders close tonight at {deadline}.</p>}
        {(pickupWindow || pickupLocation) && (
          <p>
            Pickup: {pickupDate}
            {pickupWindow ? `, ${pickupWindow}` : ""}
            {pickupLocation ? ` at ${pickupLocation}` : ""}.
          </p>
        )}
        <p>
          Payment via Venmo only — you&apos;ll get a link after we process your
          order.
        </p>
      </div>
    </div>
  );
}
