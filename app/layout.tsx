import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asianova Collective — Fresh Ramen Eggs, Made to Order",
  description:
    "Gluten-free ramen eggs marinated in-house and delivered weekly in Oakland & Berkeley, CA. Join the beta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
