/* THE SHELF RECIPE — where the third column arrives, and why there is no fourth.
   ============================================================================
   Its own module rather than an export of `WorkGrid`, because `WorkGrid` is a
   client component and `ExplorationsBand` is not: a value imported across that
   boundary comes back as a client reference rather than the string itself. A
   plain module can be read from either side, which is the whole point — the
   three bands on `/` and the shelf on `/work` must not drift into four grids.

   BOTH STRINGS ARE WRITTEN OUT COMPLETE rather than composed from fragments,
   because Tailwind only sees class names it can read literally in the source —
   an interpolated `lg:grid-cols-${n}` generates nothing at all. Same reason the
   gitignored exploration pages use inline styles.

   `xl` IS THE RAILED SHELF. On `/work` the filter rail has claimed 15rem plus a
   4rem gap by `xl`, so a third card there lands near 250px — under the width
   the disk's title and foot block stay readable at. Two across holds them at a
   comfortable size until there is genuinely room for a third.

   `lg` IS THE BARE SHELF. With no rail the same third card measures ~283px at
   `lg` and ~352px at `xl`, both comfortably clear of that floor, so holding it
   back to `xl` bought nothing and cost six projects a third row. The home
   page's three bands — work, explorations, writing — all pass this one.

   THREE IS THE CEILING IN BOTH, and the ceiling matters as much as the number.
   An earlier version kept adding columns up to four, so every extra bit of
   screen width made the cards SMALLER, which is the opposite of what more room
   should buy. Held at three, width past `2xl` goes into the cards instead. */
export const workGridColumns = {
  lg: "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:gap-12",
  xl: "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-3 xl:gap-12",
} as const;

export type WorkGridThreeFrom = keyof typeof workGridColumns;
