const features = [
  "Gluten-free marinade",
  "Golden, gooey yolk",
  "High protein",
  "No additives",
];

export default function TheEgg() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">
          Golden. Gooey. Good for you.
        </h2>
        <p className="text-base leading-relaxed opacity-75">
          Our ramen eggs are marinated in a house-made teriyaki sauce —
          gluten-free soy sauce, mirin, and sugar. The whites are tender and
          deeply savory. The yolk is golden, soft, and just barely set. High in
          protein and made with care.
        </p>
        <ul className="flex flex-col gap-2 mt-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "var(--color-accent)" }}
              />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
