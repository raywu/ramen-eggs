const steps = [
  {
    n: 1,
    headline: "Sign up below",
    body: 'We\'ll add you to our WhatsApp group, "Sausage Cloud Ramen Egg Beta."',
  },
  {
    n: 2,
    headline: "Get the weekly ping",
    body: "Every week you'll receive a message with that week's pricing and an order reminder.",
  },
  {
    n: 3,
    headline: "Confirm your order",
    body: "Fill out the order form to lock in your quantity. Pricing is visible before you confirm.",
  },
  {
    n: 4,
    headline: "Pick up your eggs",
    body: "Collect your order throughout the week, or catch us at the South Berkeley Farmers' Market (Tuesdays on Adeline).",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="py-20 px-6 md:px-12 lg:px-24 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">
          How it works
        </h2>
        <ol className="flex flex-col gap-8">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-5">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-bg)",
                }}
              >
                {s.n}
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-base">{s.headline}</span>
                <span className="text-sm leading-relaxed opacity-70">
                  {s.body}
                </span>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs opacity-50">
          Since we&apos;re in beta, pricing may vary week to week.
        </p>
      </div>
    </section>
  );
}
