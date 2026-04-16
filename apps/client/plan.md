# QTime Homepage Plan

## Goal

Replace the default create-next-app homepage with a production-quality homepage for QTime that introduces the game, explains the turn loop clearly, and frames the app as the client for a matchmaking-driven competitive word game.

## Proposed Approach

Implement the homepage as a mostly static App Router page using server-rendered JSX and Tailwind v4 utilities, while also establishing a reusable Tailwind-ready theme layer for the rest of the client app. The theme should be derived from the references in `designs/`, especially the color, typography, and tile-driven visual language, but adapted cleanly to the current Next.js and Tailwind v4 setup. Keep the first version focused on brand, product comprehension, and a clear route into the future game client.

The visual direction should feel competitive arcade, tactical, and tile-based:

- bold headline treatment;
- strong tile motifs that echo letter racks without imitating a Scrabble board;
- a compact explanation of the scoring loop and race to 500;
- a section that explains why matchmaking quality matters for fair, replayable games;
- a prominent primary CTA and a lower-emphasis secondary CTA.

The page should not read like a systems-design showcase. The matchmaking context should support the game fantasy, not dominate it.

## Planned Information Architecture

1. Hero
   - QTime wordmark / brand treatment
   - concise headline describing the game
   - short supporting copy that explains the no-board, highest-scoring-word loop
   - primary CTA labeled `Play Now`
   - secondary CTA for learning the rules or how matchmaking works
   - a visual centerpiece built from tiles / score cards / match indicators

2. Match Flow Section
   - three or four steps:
     - draw or hold tiles
     - build the best scoring word
     - score the turn
     - race to 500
   - structured as stable tiles or panels rather than floating cards-inside-cards

3. Matchmaking Section
   - brief explanation that QTime is backed by distributed matchmaking
   - focus on player-facing outcomes:
     - quick pairing
     - fairer skill matches
     - competitive replayability
   - avoid deep backend detail on the homepage

4. Competitive Snapshot Section
   - a stylized score race or live-match style panel
   - communicates tension, tempo, and score swings
   - can be static sample data in the first iteration

5. Final CTA Band
   - direct path to play
   - supporting action for rules / queue / future sign-in flow

## Files Likely To Change

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `public/*` if local image assets are needed

Possible additions if page complexity warrants it:

- `app/_components/home/*` or a similarly small co-located homepage component folder

## Detailed Implementation Plan

### 1. Update Root Metadata

Revise `app/layout.tsx` metadata from the create-next-app defaults to QTime-specific values.

Planned fields:

- title
- description
- possible metadata base later if a deployment URL is known

This stays static for now because the homepage content is static.

### 2. Establish The Homepage Theme Layer

Expand `app/globals.css` to define a homepage-ready token set and better base styles that can be reused across future routes and components:

- background and foreground tokens
- accent colors for score / tile / status emphasis
- surface and border tokens
- reusable text color tiers
- button and panel color pairings
- global body background treatment
- typography defaults that work with the chosen fonts
- selection styling

This theme layer should take direct inspiration from `designs/DESIGN.md` and `designs/code.html`, especially:

- the midnight base palette;
- bright accent colors for score pressure and interaction;
- hard-edged tile geometry;
- high-contrast display typography.

It should still stay restrained in implementation. The page should get most of its layout and component styling from Tailwind classes instead of large custom CSS blocks.

### 3. Build The Homepage Structure In `app/page.tsx`

Create the full page using semantic sections and server-rendered JSX.

Implementation shape:

```tsx
export default function HomePage() {
  return (
    <main>
      <section>{/* hero */}</section>
      <section>{/* match flow */}</section>
      <section>{/* matchmaking */}</section>
      <section>{/* competitive snapshot */}</section>
      <section>{/* final CTA */}</section>
    </main>
  );
}
```

The hero visual should follow the energy and composition of the `designs/` references closely where practical, but translated into the current repo's conventions and UI constraints. The centerpiece should be code-native, built from layered tile and scoreboard elements unless local assets are added intentionally.

### 4. Introduce Small Data Arrays For Repeated UI

Keep repeated content declarative inside `app/page.tsx` or in a tiny co-located helper if readability needs it:

- match flow steps
- matchmaking benefit points
- sample tile letters / score numbers

This keeps the JSX readable without creating a large component tree too early.

### 5. Decide On Component Extraction Conservatively

Start from one page file. Extract only if the page becomes hard to scan.

Likely extraction candidates if needed:

- `HeroVisual`
- `FlowStepGrid`
- `ScoreRacePanel`

If extraction happens, keep it within the app feature boundary and avoid creating a generic component system for a single page.

### 6. Use Local Visual Assets Only If They Add Real Value

The current project has only the default public assets. If the design benefits from imagery, add local assets under `public/` and render them with `next/image`.

Do not depend on remote image hosts for this first pass because:

- the repo has no `images.remotePatterns` config;
- remote assets would add config scope that is not necessary for the homepage;
- the page can already achieve a strong identity through typography and tile-based visuals.

### 7. Validate

After implementation, run at minimum:

- `npm run lint`
- `npm run build`

If the build surfaces generated type issues or route typing issues, fix them before considering the feature complete.

## Data Flow And Behavior Changes

- No API or backend integration in this phase.
- No new client state is required for the initial homepage.
- The page remains statically renderable.
- User interaction is limited to navigation-style CTAs.

## Trade-Offs

### Chosen

- Mostly static server-rendered homepage
  - simpler, faster, and aligned with the current repo state
- Code-native visual system
  - avoids dependency on missing finalized art assets
- Focus on product framing over feature sprawl
  - appropriate for the first screen of a fresh app

### Rejected For Now

- Adding queue status, authentication, or live gameplay widgets
  - premature without surrounding app flows
- Pulling in remote art or icon libraries
  - unnecessary config and dependency surface for the first iteration
- Building a large reusable component library before one page exists
  - too much structure for the current scope

## Risks And Compatibility Notes

- The worktree contains evidence of a prior homepage implementation under `src/` that has since been removed. New work should avoid trying to resurrect or reconcile that old structure unless explicitly requested.
- The `designs/` folder should be treated as the intended vibe and theme reference for this feature. The implementation can follow it fairly closely in tone, palette, and composition, but it still needs to be rebuilt for the current App Router project rather than copied as static HTML.
- Because this is Next 16, older assumptions about routing and page props should be avoided. For this static homepage, that mainly means staying within the current App Router conventions and Metadata API.

## Open Questions For Review

Resolved from review:

- Primary CTA copy: `Play Now`
- Tone: competitive arcade energy, with the systems aspect kept in the background as supporting product context

## Todo Breakdown

### Phase 1. Theme Foundation

- [x] Update `app/globals.css` with reusable theme tokens derived from `designs/`
- [x] Define project-wide color variables for background, surface, border, and accent roles
- [x] Define reusable typography variables / defaults that fit the approved arcade direction
- [x] Add global body and selection styling that matches the QTime theme
- [x] Keep the theme layer small enough to reuse across future routes without homepage-specific leakage

### Phase 2. Site Metadata

- [x] Replace the create-next-app metadata in `app/layout.tsx`
- [x] Set a QTime-specific title
- [x] Set a QTime-specific description focused on the game, not backend implementation details
- [x] Preserve the current root layout structure and font-loading pattern unless a font adjustment is approved within scope

### Phase 3. Homepage Composition

- [x] Replace the starter content in `app/page.tsx` with the new homepage structure
- [x] Build the hero section with QTime branding, headline, supporting copy, and `Play Now` CTA
- [x] Add the secondary CTA for rules / matchmaking explanation
- [x] Create a code-native hero visual inspired by the `designs/` references
- [x] Build the match flow section that explains the core loop from tiles to scoring to the 500-point finish
- [x] Build the matchmaking section with player-facing benefits only
- [x] Build the competitive snapshot section using static sample data
- [x] Build the final CTA band and keep it visually consistent with the rest of the page

Manual review gate:

- [ ] Stop after completing Phase 3 and wait for manual review before continuing to Phases 4-7

### Phase 4. Reusable Page Data And Structure

- [ ] Introduce small typed data arrays for repeated homepage content
- [ ] Keep repeated UI declarative and easy to edit
- [ ] Extract small homepage-only components only if `app/page.tsx` becomes hard to scan
- [ ] Keep any extracted components co-located and tightly scoped to the homepage

### Phase 5. Visual Refinement

- [ ] Translate the `designs/` mood into Tailwind v4 classes and current repo conventions
- [ ] Preserve hard-edged tile geometry and high-contrast arcade energy
- [ ] Ensure sections are full-width bands or unframed layouts rather than nested-card stacks
- [ ] Keep component sizing stable so text and score tiles do not shift layout on responsive breakpoints
- [ ] Check that the palette does not collapse into a one-note or overly muted treatment

### Phase 6. Assets

- [ ] Decide whether the homepage needs any local static assets beyond code-native shapes and typography
- [ ] If needed, add local assets under `public/`
- [ ] Render any added assets with `next/image`
- [ ] Avoid remote image dependencies and extra `next.config.ts` scope unless a real need appears

### Phase 7. Validation

- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Fix any lint, type, or build issues that surface
- [ ] Confirm the homepage still follows App Router and Metadata API conventions for Next 16

Execution constraint:

- Do not continue past Phase 3 until manual review is complete and continuation is explicitly approved.
