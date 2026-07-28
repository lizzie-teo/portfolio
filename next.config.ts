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
};

export default nextConfig;
