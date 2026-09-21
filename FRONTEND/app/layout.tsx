import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIGIL — Autonomous AI Parking Intelligence",
  description:
    "Next-generation civic traffic command and predictive parking intelligence platform for municipal transit authorities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="bg-background text-foreground antialiased min-h-screen selection:bg-teal/20 selection:text-teal font-sans">
        {children}
      </body>
    </html>
  );
}
