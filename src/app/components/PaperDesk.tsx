"use client";

/*
 * PAPER DESK — the ground the desktop cards lie on, as paper rather than as a
 * picture.
 *
 * A candidate ground for `DesktopProjectCard`, built to be read against the
 * pastel-ribbon wallpaper on /explore/folder-cards. It ships nowhere yet.
 *
 * ── WHAT THE FOOTAGE SAID ────────────────────────────────────────────────
 * The reason this exists is a look at the world's own legs rather than an idea
 * about texture. Three things came out of the frames, and all three are load
 * bearing below:
 *
 *   1. THE WORLD IS DRAWN, NOT PAINTED. Every plate is pen line with a
 *      watercolour wash inside it, on cream paper — the fence, the arch, every
 *      flower, the Mac. A heavy charcoal outline is that same technique at a
 *      heavier weight, which is why the window card sits under this hero at all.
 *      The thing that did NOT fit was the flat vector ribbon wallpaper: it
 *      asserts a surface, and a drawing on paper asserts a mark.
 *   2. THE GARDEN IS LAVENDER AND SAGE. Sampled from leg 5: lavender-grey
 *      #b7acb9, sage #b9b6a9, dusty rose. There is no teal anywhere in the
 *      world and no blush as hot as the ribbon's. Those two hues were the
 *      foreign object, not the wallpaper idea.
 *   3. THE PAPER IS WARMER THAN THE BAND IT HANDS OVER TO. Sampled from the
 *      corner of five legs: #e9ddd1, #e3d4c3, #eadacc, and #eadacc again on the
 *      final frame. The section under the flight runs `--secondary` #F2F0EB,
 *      which is cooler and greyer. So the handover currently steps from warm
 *      drawn paper onto a cool flat band, and the ground below is the one place
 *      that can close it.
 *
 * ── SO THE GROUND IS THE SAME SHEET, CONTINUED ───────────────────────────
 * Not a wallpaper, not a colour field, and specifically not the Mac's screen
 * green flooded across a band. That last one was the obvious move and it is
 * wrong for a reason worth writing down: in the final frame the green is a
 * SMALL LIT RECTANGLE inside a large field of paper. Flooding a band with it
 * takes something that occupies a few percent of the picture and makes it the
 * whole ground, which is not "using the world's palette" but inverting it.
 *
 * ── NO AGE, AND THIS IS NOT A STYLE PREFERENCE ───────────────────────────
 * `PaperTexture` offers `crumples`, `folds`, `foldCount` and `drops`, and every
 * one of them is pinned to zero here. The plates were RE-GENERATED in August
 * 2026 specifically to remove foxing, water-staining and an aged border, at
 * real cost, after a post-processing filter was tried and could not do it.
 * Switching those uniforms on would re-introduce, in the ground, exactly the
 * thing that was paid to be taken out of the picture above it. `fiber` and
 * `roughness` are the tooth of clean stock and are the only two doing work.
 *
 * ── COST ─────────────────────────────────────────────────────────────────
 * `speed={0}` fully halts the library's rAF loop — verified in `shader-mount`
 * and relied on by `HeroInkVeil` already. So this is one shader compile and one
 * draw, then nothing, which matters more here than anywhere else on the site:
 * the home page is already running the world's WebCodecs canvas renderer, and a
 * second surface holding a live rAF underneath it would be competing for frames
 * with the one thing on the page that must not drop any.
 *
 * If it still proves too much on the home page, the fix is to bake this to a
 * WebP once and serve the image — the output is static, so nothing is lost but
 * the ability to retune it in the browser.
 *
 * The colours are ARTWORK scene constants (style-rules §3), the same category as
 * `desktopInk` and `HeroInkVeil`'s palettes: canvas artwork, never shell tokens.
 */

import { PaperTexture } from "@paper-design/shaders-react";
import { desktopInk } from "./desktopInk";

/* THE SHEET. Both tones are sampled from the world's own plates rather than
   picked: `BACK` is the paper at the corner of the final frame, and `FRONT` is
   a half-step lighter so the fibre has something to catch. Held within 1.03:1
   of each other — the texture is meant to be felt as tooth, not seen as a
   two-tone field. */
const PAPER_BACK = "#eadacc";
const PAPER_FRONT = "#f0e4d9";

/**
 * The desk. Absolutely positioned to fill its section; the caller supplies the
 * `relative` and paints `PAPER_BACK` as the fallback beneath it, so a browser
 * with no WebGL gets the sheet without the tooth rather than a hole.
 *
 * Decorative throughout — it carries no information and is aria-hidden. There is
 * no reduced-motion branch because there is no motion: the surface is drawn once
 * and then holds still, which is also the answer to the drift that read as
 * static on the home hero. Grain that moves was the thing that did not land;
 * grain that simply IS the paper is a different proposition.
 */
export function PaperDesk() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ backgroundColor: PAPER_BACK }}
    >
      <PaperTexture
        className="h-full w-full"
        colorBack={PAPER_BACK}
        colorFront={PAPER_FRONT}
        contrast={0.32}
        roughness={0.42}
        fiber={0.55}
        fiberSize={0.6}
        /* Age, all of it, off. See the note above — this is a constraint the
           plates were re-generated to satisfy, not a taste call. */
        crumples={0}
        crumpleSize={0}
        foldCount={0}
        folds={0}
        drops={0}
        fade={0}
        seed={7}
        speed={0}
      />
    </div>
  );
}

/*
 * THE SCREEN PLATE — where the world's green is allowed to appear, at the size
 * it actually has in the film.
 *
 * The flight's last frame is a drawn Macintosh with `hello world` on a mint
 * screen, so the green belongs to a small lit rectangle on a big paper field.
 * This keeps that proportion: one screen-shaped plate behind the band's own
 * heading, so the section title becomes what the machine is DISPLAYING rather
 * than a label sitting on paper next to it. The grid under it is then what is
 * open on that machine, which is what a window already means.
 *
 * The tone is sampled from the screen interior of the final frame. Ink #2a2724
 * on it measures 7.74:1, so the heading clears AAA for large text with room and
 * would still clear the §4 small-text bar if anything small ever landed here.
 */
export const SCREEN_GREEN = "#a9c1b1";

/** The heading's plate: a small lit screen on the sheet, drawn at the card's
 *  own outline weight so the band and the windows share one hand. */
export function ScreenPlate({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-md px-3 py-1"
      style={{
        backgroundColor: SCREEN_GREEN,
        border: `3px solid ${desktopInk.ink}`,
        color: desktopInk.ink,
      }}
    >
      {children}
    </span>
  );
}
