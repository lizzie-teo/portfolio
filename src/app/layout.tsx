import type { Metadata } from "next";
import "./globals.css";
import { Geist, Sacramento } from "next/font/google";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

/* THE SCRIPT FACE, and the narrow job it has. It sets exactly one string on this
   site — the "hello world" on the /world opening plate — and it exists to match
   the hand-lettering on that page's own scene 9, where the same words glow on a
   1984 Macintosh CRT. Sacramento because the reference lettering's defining
   quality is MONOLINE: one uniform stroke, connected, with looped ascenders and
   no thick-thin contrast at all. The obvious script picks (Dancing Script,
   Kaushan, Yellowtail) all modulate their stroke and stop matching the drawing
   the moment they are set next to it.

   It is not a third type role. Do not reach for it anywhere else — a script face
   used twice is a brand, used once is a quotation, and this is a quotation of a
   picture that already exists on the page. See .docs/type-scale.md before
   promoting it. */
const sacramento = Sacramento({
  display: "swap",
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
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
      className={cn(
        "h-full antialiased font-sans",
        geist.variable,
        avantGarde.variable,
        sacramento.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* SKIP LINK — WCAG 2.4.1 Bypass Blocks, Level A, and the site had none.
            Every route repeats the wordmark and the contents line before its
            content, so a keyboard or screen-reader user paid five stops on every
            page load, including deep inside a case study.

            It is set in the masthead's own tracked caps rather than as a browser
            default link, because it is chrome and this site has one voice for
            chrome. `sr-only` until focused, then it takes the ink plate — z-60,
            because it has to clear the fixed bar (z-50) and the mobile menu's
            scrim (z-40) rather than appear behind them.

            The target carries `tabIndex={-1}` so focus genuinely moves; a bare
            `id` scrolls the page and leaves focus on the link, which is the usual
            way this control quietly fails. `scroll-mt` is not needed: `main`
            begins at the top of the document. */}
        <a
          href="#main"
          className="sr-only rounded-xs bg-primary font-heading text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:px-4 focus:py-3 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
