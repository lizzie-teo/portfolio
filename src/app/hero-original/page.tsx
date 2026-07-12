import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { MotionReveal } from "../components/MotionReveal";
import { ParticleDissolve } from "../components/ParticleDissolve";
import { SiteHeader } from "../components/SiteHeader";

/* Archived copy of the original home hero (wreath banner + particle-dissolve
   carousel), kept on its own route while the home page trials a concept
   video. Not linked from navigation and excluded from indexing. */

export const metadata: Metadata = {
  title: "Hero banner (original)",
  robots: { index: false, follow: false },
};

/* The four discipline vignettes cropped from the corners of the full hero
   banner; on mobile they consolidate into their own banner below the circle. */
const heroCorners = [
  { src: "/assets/site-illustration/hero-corner-ai.webp", alt: "AI" },
  {
    src: "/assets/site-illustration/hero-corner-design-systems.webp",
    alt: "Design systems",
  },
  {
    src: "/assets/site-illustration/hero-corner-design-engineering.webp",
    alt: "Design engineering",
  },
  {
    src: "/assets/site-illustration/hero-corner-research.webp",
    alt: "Human centered research",
  },
];

export default function HeroOriginal() {
  /* Art direction: below md the hero is the square wreath crop with the
     circle as the centrepiece; from md up it is the full corner banner. */
  const {
    props: { srcSet: heroBannerSrcSet },
  } = getImageProps({
    alt: "",
    width: 2048,
    height: 1152,
    priority: true,
    sizes: "(min-width: 1280px) 1200px, (min-width: 1024px) 1100px, 100vw",
    src: "/assets/site-illustration/hero-new.webp",
  });
  const {
    props: { ...heroCircleImgProps },
  } = getImageProps({
    alt: "",
    width: 1042,
    height: 1042,
    priority: true,
    sizes: "100vw",
    src: "/assets/site-illustration/hero-circle.webp",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="pb-16 lg:pb-24">
          <div className="mx-auto w-full max-w-[1800px] px-4 pb-2 pt-6 sm:px-6 md:px-8 md:pb-3 md:pt-8 lg:px-12 lg:pb-4 xl:px-16">
            <MotionReveal>
              <div className="text-center md:text-left lg:mx-auto lg:max-w-3xl lg:text-center">
                <AnimatedTitle
                  className="mx-auto max-w-[22ch] text-[clamp(2.25rem,6vw,3.75rem)] font-semibold uppercase leading-[1.08] tracking-[-0.03em] md:mx-0 lg:mx-auto"
                  text="Lizzie Teo"
                />
              </div>
            </MotionReveal>
          </div>

          <MotionReveal>
            <div className="px-4 sm:px-6 md:px-0">
              <div className="relative lg:mx-auto lg:max-w-[1100px] xl:max-w-[1200px]">
                <picture>
                  <source
                    media="(min-width: 768px)"
                    srcSet={heroBannerSrcSet}
                    sizes="(min-width: 1280px) 1200px, (min-width: 1024px) 1100px, 100vw"
                    width={2048}
                    height={1152}
                  />
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative alt="" comes through the getImageProps spread */}
                  <img {...heroCircleImgProps} className="h-auto w-full" />
                </picture>
                <div className="absolute left-[49.9%] top-1/2 w-[62.9%] -translate-x-1/2 -translate-y-1/2 md:left-[49.3%] md:top-[49.7%] md:w-[32%]">
                  <ParticleDissolve
                    slides={[
                      {
                        src: "/assets/site-illustration/pen.webp",
                        alt: "",
                        width: 1152,
                        height: 1152,
                        label: "User Experience",
                        effect: "scatter",
                      },
                      {
                        src: "/assets/site-illustration/stakeholders.webp",
                        alt: "",
                        width: 1024,
                        height: 1024,
                        label: "Stakeholder management",
                        effect: "swirl",
                      },
                      {
                        src: "/assets/site-illustration/complex-problems.webp",
                        alt: "",
                        width: 1024,
                        height: 1024,
                        label: "Solving complex problems",
                        effect: "ripple",
                      },
                      {
                        src: "/assets/site-illustration/design-to-code.webp",
                        alt: "",
                        width: 1024,
                        height: 1024,
                        label: "Design to code workflow",
                        effect: "sweep",
                      },
                    ]}
                    priority
                    sizes="(min-width: 1280px) 384px, (min-width: 1024px) 352px, (min-width: 768px) 32vw, 63vw"
                    className="overflow-hidden rounded-full"
                  />
                </div>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal className="md:hidden">
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 px-4 sm:px-6">
              {heroCorners.map((corner) => (
                <Image
                  key={corner.src}
                  src={corner.src}
                  alt={corner.alt}
                  width={492}
                  height={560}
                  sizes="50vw"
                  className="h-auto w-full"
                />
              ))}
            </div>
          </MotionReveal>
        </section>
      </main>
    </div>
  );
}
