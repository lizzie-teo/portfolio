import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
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
    <html lang="en" className={cn("h-full antialiased font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
