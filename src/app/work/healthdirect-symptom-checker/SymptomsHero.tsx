import Image from "next/image";
import { cornerClasses, type TileCorners } from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";

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
export function SymptomsHero({
  corners = "all",
}: {
  /** Corner rounding for the stage surface — "top" when the hero caps the
      introduction slab. */
  corners?: TileCorners;
}) {
  /* The stage shares the leaf arrival (CollapsingLeaf): it opens at the full
     leaf height — showing more of the screenshots than the tuned crop — and
     collapses onto its aspect-ratio height, the bottom edge cropping the
     screenshots progressively until the reviewed composition rests. The
     aspect classes stay on the collapsing surface as its natural floor.

     w-full pins the width definite so the collapse only ever moves the bottom
     edge. This is the one leaf whose floor is an aspect ratio, not content
     height; while the leaf's min-height overshoots that ratio (110svh on
     arrival), an auto width would let the aspect ratio transfer the tall
     height back into a wide width and balloon the stage past its lane. A
     100% width leaves the ratio only the height to compute, so the width
     stays exactly as tuned. */
  return (
    <CollapsingLeaf
      pinTopPx={0}
      className={`aspect-[3/3.85] w-full overflow-hidden ${cornerClasses[corners]} bg-sc-hero-stage md:aspect-[100/58.22]`}
    >
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
    </CollapsingLeaf>
  );
}
