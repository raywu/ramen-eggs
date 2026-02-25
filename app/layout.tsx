import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const wordmarkFont = Space_Grotesk({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-wordmark",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

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
    <html lang="en" className={`${wordmarkFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
