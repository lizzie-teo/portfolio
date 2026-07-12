import Image from "next/image";

type ScreenshotProps = {
  src: string;
  alt: string;
  /** CSS aspect-ratio (width / height); must match the asset. */
  ratio: number;
  sizes: string;
};

function Screenshot({ src, alt, ratio, sizes }: ScreenshotProps) {
  return (
    <div
      style={{ aspectRatio: ratio }}
      className="relative w-full overflow-hidden"
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}

/**
 * Case-study hero: the redesigned checker on a muted slate-teal stage
 * tile — desktop and mobile screenshots sit flat and top-aligned, bleeding
 * off the tile's bottom edge. Proportions follow the showcase Figma with
 * the tile height tuned in review. Like every tile in the card system, the
 * stage is a rounded panel in the shell's content lane; its aspect ratio
 * preserves the composition the full-bleed band had at viewport width, now
 * relative to the tile. Small viewports simplify to the mobile screenshot
 * alone; the desktop capture is unreadable at that scale.
 */
export function SymptomsHero() {
  return (
    <div className="aspect-[3/3.85] overflow-hidden rounded-3xl bg-sc-hero-stage md:aspect-[100/58.22]">
      <div className="flex w-full items-start justify-center px-4 pt-[7%] sm:px-6 md:justify-start md:gap-[3.6%] md:px-8 md:pt-[min(4%,4.5rem)] lg:px-12">
        <div className="hidden w-[73.3%] shadow-sc-hero md:block">
          <Screenshot
            src="/assets/healthdirect/hero/symptoms-prompt-desktop.webp"
            alt="The redesigned Symptoms step on desktop: Vomiting and Sore throat added under My symptoms, one at a time."
            ratio={1800 / 2578}
            sizes="(min-width: 768px) 66vw, 90vw"
          />
        </div>
        <div className="w-[62%] max-w-72 shadow-sc-hero md:w-[23.1%] md:max-w-none">
          <Screenshot
            src="/assets/healthdirect/hero/assessment-mobile.webp"
            alt="The Assessment step on mobile, asking for body temperature with one-tap answer options."
            ratio={675 / 2160}
            sizes="(min-width: 768px) 21vw, 62vw"
          />
        </div>
      </div>
    </div>
  );
}
