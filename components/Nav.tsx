export default function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b"
      style={{
        backgroundColor: "rgba(17, 17, 17, 0.9)",
        backdropFilter: "blur(8px)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-xl tracking-tight" style={{ fontFamily: "var(--font-wordmark)" }}>
          The Asianova
        </span>
        <span className="hidden md:inline text-sm opacity-50">
          — Golden. Gooey. Good for you.
        </span>
      </div>
      <a
        href="#signup"
        className="text-sm font-medium px-4 py-2 rounded-md transition-all hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,92,56,0.4)]"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "var(--color-bg)",
        }}
      >
        Join the Beta
      </a>
    </nav>
  );
}
