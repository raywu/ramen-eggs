import Script from "next/script";

export default function SignupForm() {
  return (
    <section
      id="signup"
      className="py-20 px-6 md:px-12 lg:px-24 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <Script src="https://static.airtable.com/js/embed/embed_snippet_v1.js" strategy="afterInteractive" />
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">
          Join the beta
        </h2>
        <p className="text-base opacity-70">
          We&apos;re currently accepting sign-ups in Oakland and Berkeley, CA.
        </p>
        <div className="mt-4 w-full overflow-hidden rounded-sm" style={{ border: "1px solid var(--color-border)" }}>
          <iframe
            className="airtable-embed airtable-dynamic-height"
            src="https://airtable.com/embed/app0reAWbVwTy2hZQ/pagUFxDCJ9cuGJtGz/form"
            width="100%"
            height={533}
            style={{ border: "none" }}
            title="Join the Sausage Cloud beta"
          />
        </div>
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
