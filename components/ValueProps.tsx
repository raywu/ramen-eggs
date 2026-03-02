const props = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    headline: "Made to order",
    body: "Never pre-made. Each batch is crafted fresh after you place your order.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    headline: "Gluten-free",
    body: "Marinated in gluten-free soy sauce, mirin, and sugar.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    headline: "Eat within a week",
    body: "These eggs are genuinely fresh. Best consumed within 7 days of pickup.",
  },
];

export default function ValueProps() {
  return (
    <section
      className="py-16 px-6 md:px-12 lg:px-24 border-t border-b"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {props.map((p) => (
          <div key={p.headline} className="flex flex-col gap-3">
            <div style={{ color: "var(--color-accent)" }}>{p.icon}</div>
            <h3 className="text-lg font-bold">{p.headline}</h3>
            <p className="text-sm leading-relaxed opacity-70">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
