import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const wordmarkFont = Space_Grotesk({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-wordmark",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteTitle = "Asianova Collective — Fresh Ramen Eggs, Made to Order";
const siteDescription =
  "Gluten-free ramen eggs marinated in-house and delivered weekly in Oakland & Berkeley, CA. Join the beta.";
const siteUrl = "https://theasianova.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Asianova Collective",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
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
