"use client";

import { useState } from "react";
export default function SignupForm() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="signup"
      className="py-20 px-6 md:px-12 lg:px-24 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-wordmark)" }}
        >
          Join the beta
        </h2>
        <p className="text-base opacity-70">
          Serving Oakland and Berkeley, CA.
        </p>
        <div className="relative mt-4 w-full overflow-hidden rounded-md">
          <div
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: expanded ? "1100px" : "500px" }}
          >
            <iframe
              className="airtable-embed"
              src="https://airtable.com/embed/app0reAWbVwTy2hZQ/pagUFxDCJ9cuGJtGz/form"
              width="100%"
              height={expanded ? 1100 : 900}
              scrolling="no"
              style={{ border: "none" }}
              title="Join the Asianova Collective beta"
            />
          </div>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4 pt-24 bg-gradient-to-t from-[var(--color-bg)] to-transparent">
              <button
                onClick={() => setExpanded(true)}
                className="cursor-pointer text-sm font-medium px-5 py-2 rounded-md transition-all hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,92,56,0.4)]"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-bg)",
                }}
              >
                Show full form
              </button>
            </div>
          )}
        </div>
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="cursor-pointer self-center text-sm font-medium px-5 py-2 rounded-md transition-all hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,92,56,0.4)]"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-bg)",
            }}
          >
            Collapse form
          </button>
        )}
        <p className="text-sm opacity-60">
          Having trouble with the form?{" "}
          <a
            href="https://airtable.com/app0reAWbVwTy2hZQ/pagUFxDCJ9cuGJtGz/form"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-accent)" }}
          >
            Fill it out directly →
          </a>
        </p>
      </div>
    </section>
  );
}
