import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (better detail-per-byte than WebP at the same quality), WebP as
    // the fallback for browsers without AVIF. Order matters — first Accept match
    // wins. next/image re-encodes every optimized source into these, so this
    // lifts fidelity site-wide, not just for the screenshot chips.
    formats: ["image/avif", "image/webp"],
    // Next 16 requires quality values to be whitelisted before a component may
    // request them. 75 is the built-in default; 90 is the sharper tier used for
    // product screenshots, whose fine UI text and 1px borders show webp/avif
    // softness the most (see .docs/asset-weight.md — source weight is irrelevant
    // here, the optimizer resizes per request; the lever is encode quality).
    qualities: [75, 90],
  },
  /* `/world` WAS THE WALK'S OWN ROUTE FOR ABOUT A DAY.
     The garden flight is the top of `/` again (src/app/page.tsx), so the folder
     `src/app/world/` holds the engine, the stylesheet and the glass card but no
     `page.tsx` and is not a route. Old links, anything already shared, and the
     comment trail through world.css all still say `/world`, so the address
     answers rather than 404s.

     TEMPORARY, deliberately: `permanent: false` (a 307) rather than a 308. A
     permanent redirect is cached by the browser more or less forever, and this
     address has already changed direction once in a day. If the walk ever gets
     its own route back, a cached 308 would be the bug nobody can reproduce. */
  async redirects() {
    return [{ source: "/world", destination: "/", permanent: false }];
  },
  /* Next gives `/_next/static/` a 1-year immutable cache because those filenames
     carry a content hash. Nothing in `public/` gets that treatment — it ships at
     `max-age=0`, so every repeat visit and cross-page nav pays a revalidation
     round-trip per asset before a video can start. For the walk, where a leg is
     ~12MB and the scrub engine fetches clips itself, that is the difference
     between a warm cache hit and a re-download.

     A WEEK, NOT `immutable`. `scripts/shrink-asset.mjs --write` re-encodes assets
     IN PLACE at the same path (see .docs/asset-weight.md), so an immutable
     1-year header would strand stale bytes on returning readers with no way to
     bust it short of renaming every file. `stale-while-revalidate` keeps the
     instant hit and lets a re-encode land on the visit after next. */
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
