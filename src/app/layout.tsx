import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

/* Display face for headings: TeX Gyre Adventor, the free URW digitisation of
   the ITC Avant Garde Gothic design (see src/app/fonts/README.md to swap in
   licensed ITC files). Body copy is Geist — Avant Garde's closed geometric
   forms are hard to read at paragraph sizes. */
const avantGarde = localFont({
  display: "swap",
  variable: "--font-display",
  fallback: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
  src: [
    { path: "./fonts/texgyreadventor-regular.woff2", weight: "300 500", style: "normal" },
    { path: "./fonts/texgyreadventor-bold.woff2", weight: "600 900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Lizzie Teo | UX/UI Design Portfolio",
  description:
    "UX/UI portfolio for complex products, systems thinking, and explanatory product storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-sans", geist.variable, avantGarde.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
