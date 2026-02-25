"use client";

import { useState, useId, cloneElement, type FormEvent, type ReactElement } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

const EGG_OPTIONS = ["0-1", "2-5", "6-10", "10+"];

export default function SignupForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
      eggsCurrently: data.get("eggsCurrently") as string,
      eggsDesired: data.get("eggsDesired") as string,
      whyNot: data.get("whyNot") as string,
    };

    try {
      const res = await fetch("/api/signup", {
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

  return (
    <section
      id="signup"
      className="py-20 px-6 md:px-12 lg:px-24 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-wordmark)" }}
        >
          Join the beta
        </h2>
        <p className="text-base opacity-70">
          Serving Oakland and Berkeley, CA.
        </p>

        {status === "success" ? (
          <div className="mt-6 p-8 rounded-md text-center flex flex-col items-center gap-4" style={{ backgroundColor: "var(--color-border)" }}>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              ✓
            </div>
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-wordmark)" }}>
              You&apos;re in!
            </h3>
            <p className="opacity-70">
              We&apos;ll add you to our WhatsApp group shortly. Keep an eye on your phone.
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

            <FormField label="Phone (for WhatsApp)" required>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="+1 (510) 555-1234"
              />
            </FormField>

            <FormField
              label="Zip code"
              required
              hint="So that we can organize the beta group into batches"
            >
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

            <FormField
              label="How many ramen eggs do you eat every week?"
              required
              hint="On average, how many a week do you have them?"
            >
              <select name="eggsCurrently" required className="form-input" defaultValue="">
                <option value="" disabled>
                  Select...
                </option>
                {EGG_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="How many ramen eggs would you like to eat every week?"
              required
            >
              <select name="eggsDesired" required className="form-input" defaultValue="">
                <option value="" disabled>
                  Select...
                </option>
                {EGG_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="If you don't have as many ramen eggs as you'd like to, why not?">
              <textarea
                name="whyNot"
                rows={3}
                className="form-input resize-none"
                placeholder="Optional"
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

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactElement<{ id?: string }>;
}) {
  const generatedId = useId();
  const inputId = children.props.id || generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
        {required && (
          <span className="ml-0.5" style={{ color: "var(--color-accent)" }}>
            *
          </span>
        )}
      </label>
      {hint && <span className="text-xs opacity-50">{hint}</span>}
      {cloneElement(children, { id: inputId })}
    </div>
  );
}
