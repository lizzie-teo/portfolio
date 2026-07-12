# Display face — Avant Garde Gothic

The heading/display face for the site is the ITC Avant Garde Gothic design,
served as **TeX Gyre Adventor** — the GUST Font License (free, redistributable)
digitisation of URW Gothic, URW's release of the same Herb Lubalin / Tom
Carnase design. Source: CTAN, `fonts/tex-gyre` (converted OTF → WOFF2, no
glyph changes).

Wired in `src/app/layout.tsx` via `next/font/local` as `--font-display`;
`globals.css` maps it to the `font-heading` utility and applies it to all
heading elements. Body copy stays Geist (`--font-sans`).

## Swapping in licensed ITC Avant Garde Gothic

If a licensed ITC Avant Garde Gothic Pro webfont is purchased later
(Book/Demi are the weights this site uses), drop the `.woff2` files in this
folder and update the two `src` paths in `layout.tsx`. Nothing else needs to
change — every component reads the face through `--font-display` /
`font-heading`.
