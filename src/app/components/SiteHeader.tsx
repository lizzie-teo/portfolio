import Link from "next/link";

const navItems = [
  ["Work", "/#work"],
  ["Contact", "/#contact"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 mx-auto flex w-full max-w-[1800px] items-center justify-between bg-background/88 px-4 py-4 backdrop-blur-md sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <Link
        href="/"
        className="text-[0.72rem] font-bold uppercase tracking-[0.18em] outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        aria-label="Lizzie Teo homepage"
      >
        Lizzie Teo
      </Link>
      <nav aria-label="Primary navigation">
        <ul className="flex items-center gap-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] sm:gap-8">
          {navItems.map(([label, href]) => (
            <li key={href}>
              <Link
                className="border-b border-transparent pb-1 outline-none transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                href={href}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
