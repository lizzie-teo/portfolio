import type { Metadata } from "next";
import { ExploreCursor } from "../components/ExploreCursor";
import { SiteHeader } from "../components/SiteHeader";
import { WorkGallery } from "../components/WorkGallery";
import { statementHeading } from "../components/typography";
import { workEntries } from "./projects";

/* ─────────────────────────────────────────────────────────────────────────
   THE WORK INDEX — the address that means "her projects"

   This is the link that gets pasted into a job application, so it is the first
   thing a recruiter sees, and until now it did not exist. `/` is the garden
   flight with the grid underneath it: right for a visitor arriving cold,
   useless as a thing to send someone, because there was no way to say "start
   at the work" and nothing in the page's own title or description that said
   the words "product design case studies" at all.

   THE HOME PAGE DOES NOT CHANGE. `/#work` still means what it always meant and
   the flight still answers "See the work" one screen down. This route is a
   second door onto the same room, not a replacement for the first — the cue at
   the foot of the flight's opening screen (FlightFork) is what tells a reader
   the door is there.

   ── WHY THE WHOLE PAGE IS GROUT ───────────────────────────────────────────
   On `/` the gallery is a dark band on the flight's warm paper: a section of a
   longer page, and the tonal step is what separates it from what came before.
   Standing alone there is nothing to separate it from, so the band becomes the
   page's ground and the cards become tiles resting on it — the same
   plane-and-tile relationship every case study runs on. The reader crosses from
   here into a case study without the surface changing under her, which is the
   point: this page and the pages it links to are one document, and the walk on
   `/` is the other thing.

   `SiteHeader tone="dark"` for the same reason. The explicit prop wins over the
   hero-tone context (SiteHeader.tsx), so no HeroToneProvider is needed here —
   the bar simply tints to grout and disappears into the page's own ground,
   which is what a masthead on a dark plane should do.

   ── THE GALLERY IS MOUNTED, NOT FORKED ────────────────────────────────────
   `WorkGallery` already renders on `/` and on the parked `/home-original`;
   this is a third mount of the same component, unchanged. Its filter rail, its
   one-result feature promotion and its writing index all behave exactly as they
   do on the home page, and everything in it still derives from the registry in
   `./projects.ts`.

   That does leave two rubrics near each other at the top of this page — the
   `h1` below, then the rail's own "Selected work" and its inventory line. They
   are doing different jobs (a page title, then a region label sitting at the
   head of the filters) and on desktop the rail's pair sits in the left sidebar
   column rather than under the heading, so they do not read as a repeat. If it
   ever does grate, the fix is in the gallery's rail, not here.

   ── THE OUTLINE ──────────────────────────────────────────────────────────
   `WorkGallery` opens at `h2` and its cards are `h3`, so this page supplies the
   `h1` they hang off. Without one the surface had no top level at all, which is
   the one structural thing a page a recruiter lands on cannot get wrong.
────────────────────────────────────────────────────────────────────────── */

/* The sectors in the description come out of the registry rather than being
   typed here. This sentence is what a search result shows and what a link
   preview quotes, and a hand-kept list of industries is exactly the kind of
   copy that goes quietly stale the first time a project is added. */
const sectors = Array.from(
  new Set(
    workEntries.flatMap((entry) =>
      entry.kind === "case-study" && entry.industry
        ? [entry.industry.toLowerCase()]
        : [],
    ),
  ),
);
const sectorList =
  sectors.length > 1
    ? `${sectors.slice(0, -1).join(", ")} and ${sectors[sectors.length - 1]}`
    : sectors[0];

export const metadata: Metadata = {
  /* Says the words a recruiter searches for, which nothing on this site said
     before: `/`'s title and description are both about the walk. Indexable on
     purpose — no `robots` block. */
  title: "Product design case studies | Lizzie Teo",
  description: `Product design case studies from ten years on complex products in ${sectorList}. The problem, the decisions I made, and what shipped.`,
};

export default function WorkIndexPage() {
  return (
    <div className="min-h-screen bg-grout text-grout-foreground">
      <SiteHeader tone="dark" />
      {/* The cards, the feature tile and the writing rows all publish a
          `data-cursor-label`, so the magnetic follower belongs on any page that
          shows them. It renders only on fine-pointer, hover-capable devices and
          not at all under reduced motion, and the cards carry their own hover
          and focus states regardless (style-rules §7). */}
      <ExploreCursor />

      <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
        {/* The same container the home page gives the gallery, so the grid,
            the rail lane and the gutters land identically on both routes. */}
        <div className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-10 sm:px-6 md:px-8 md:pt-16 lg:px-12 lg:pb-24 lg:pt-24 xl:px-16 xl:pb-32 2xl:px-24">
          <header>
            {/* `statementHeading` (32 → 60px), not the home hero's staircase.
                The hero is a poster sized to its own narrow column; this is a
                page opening on a full-width plane, and the statement role is
                already on the display ladder's shared anchors, so it cannot
                cross another heading at any width. The measure is at the call
                site because measure is layout, not type: 24ch puts the line in
                two at desktop and keeps it off the 40-character ceiling
                display type reads badly past. */}
            <h1 className={`${statementHeading} max-w-[24ch]`}>
              Case studies from ten years of product design
            </h1>
            {/* Full-strength ink, inherited: a lede is primary reading copy and
                the hierarchy between it and the heading is carried by size, not
                by greying it out (style-rules §4). One line, because the
                register here is the home hero's — plain and short — and because
                the rail below is about to state the inventory. */}
            <p className="mt-5 max-w-prose text-base leading-relaxed">
              Each one is the whole story: the problem, the decisions I made,
              and what shipped.
            </p>
          </header>

          <div className="mt-14 md:mt-20 lg:mt-28">
            <WorkGallery />
          </div>
        </div>
      </main>
    </div>
  );
}
