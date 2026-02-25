import Image from "next/image";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-wordmark)", color: "var(--color-text)" }}
          >
            Fresh ramen eggs, made to order.
          </h1>
          <p className="text-lg leading-relaxed opacity-75">
            Gluten-free, marinated in-house, made to order weekly. Now in beta
            in Oakland &amp; Berkeley.
          </p>
          <div>
            <a
              href="#signup"
              className="inline-block text-base font-medium px-6 py-3 rounded-md transition-all hover:brightness-110 hover:shadow-[0_0_16px_rgba(255,92,56,0.4)]"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              Join the Beta ↓
            </a>
          </div>
        </div>
        <div className="relative w-full aspect-square rounded-md overflow-hidden">
          <Image
            src="/egg-in-the-wild.jpg"
            alt="Ramen egg cross-section showing golden gooey yolk"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
