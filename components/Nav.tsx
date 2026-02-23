export default function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
      }}
    >
      <span className="font-serif text-base font-semibold tracking-tight">
        Asianova Collective
      </span>
      <a
        href="#signup"
        className="text-sm font-medium px-4 py-2 rounded-sm transition-opacity hover:opacity-80"
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
