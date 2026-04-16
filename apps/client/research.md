# QTime Homepage Research

## Scope

Create the first homepage for the QTime client web app in this fresh Next.js client project. The homepage should introduce the game and position this app as the web client for a distributed-systems-backed matchmaking game.

## Relevant Files And Folders Examined

- `AGENTS.md`
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `README.md`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `public/*`
- `designs/DESIGN.md`
- `designs/code.html`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

## Current System Behavior

- This is an App Router project using `next@16.2.3`, `react@19.2.4`, and `react-dom@19.2.4`.
- The live route surface is currently minimal:
  - `app/layout.tsx` defines the root layout, imports `app/globals.css`, and applies `Geist` / `Geist_Mono` font variables.
  - `app/page.tsx` is still the default create-next-app homepage.
  - `app/globals.css` imports Tailwind v4 and defines only a small background / foreground theme.
- The project is configured for TypeScript with strict mode enabled and the `@/*` path alias mapped to the repo root.
- ESLint uses the Next core-web-vitals and TypeScript configs through the standalone ESLint CLI, matching current Next 16 guidance.
- The app already uses the `app/` directory at the repo root, not `src/app/`.

## Relevant Next.js 16 / Repo Constraints

- `app/layout.tsx` must remain the root layout and must continue to own the `<html>` and `<body>` tags.
- Page components are Server Components by default. For a mostly static homepage, that is the simplest default and avoids unnecessary client boundaries.
- Metadata should be defined via the Metadata API, not manual `<head>` tags.
- Tailwind is configured through `@import "tailwindcss";` in `app/globals.css` with `@tailwindcss/postcss`, which matches the current Next 16 docs.
- `next/font` is already the established font-loading pattern in this app and should remain the mechanism for any global typography change.
- If local images are added for the homepage, they should live under `public/` and be rendered with `next/image`.
- The current `next.config.ts` has no image configuration. Remote images would require explicit `images.remotePatterns`, so planning should prefer local assets unless there is a strong reason not to.
- Next 16 uses Turbopack by default for `next dev` and `next build`; nothing in the repo currently opts out.

## Existing Conventions And Patterns To Preserve

- Keep the route structure simple and App Router-native.
- Favor server-rendered, mostly static JSX for the homepage unless an interaction truly needs client-side state.
- Keep global styling in `app/globals.css`; use route-local or component-local structure for homepage-specific UI.
- Preserve strict typing and avoid `any`.
- Reuse the root layout as the place for site-wide metadata and typography.
- Use existing path aliases only if they make imports clearer; current app size is small enough that relative imports may still be acceptable.

## Worktree / Repository State That Affects Planning

- The git worktree is already dirty.
- There are unrelated modifications in the sibling `../api` project.
- Within this client app, there are deletions of an older `src/app` and `src/components/home/*` structure plus new untracked root-level `app/` files. This indicates a migration or reset already happened before this task.
- Because of that state, implementation should avoid broad moves or cleanup work that is not required for the homepage.

## Design Inputs And Risks

- `designs/DESIGN.md` and `designs/code.html` appear to be reference material, not live app code.
- They describe a loud, arcade-like visual direction with scrabble-tile motifs, neon contrast, and strong typography. That is directionally relevant to QTime.
- Those design references should not be copied literally:
  - the HTML is static and not integrated with the current App Router project;
  - it relies on remote Google Fonts and remote images that this project does not currently configure;
  - some details conflict with current higher-level UI constraints in this environment, especially large-radius treatments and decorative patterns that should be avoided.
- The useful signal from those files is thematic, not structural.

## Product Understanding Captured From The Request

- QTime is a distributed systems project centered on matchmaking algorithms.
- This client app is for a word game similar to Scrabble, but without a board.
- Players take turns making the highest-scoring word from their current tiles.
- The first player to reach 500 points wins.
- The homepage therefore needs to explain both the game loop and the matchmaking/distributed-systems angle without reading like backend documentation.

## Likely Implementation Touchpoints

- `app/page.tsx`
  - Replace the default starter page with the QTime homepage.
- `app/layout.tsx`
  - Update metadata and potentially tune the global font stack if needed for the chosen visual direction.
- `app/globals.css`
  - Expand the design tokens and global base styles needed by the homepage.
- `public/*`
  - Add any local static imagery or texture assets required by the design.
- Potential new files:
  - small presentational components under a homepage-focused folder if the page becomes too large for a single file;
  - optional local CSS module(s) only if global Tailwind utilities become insufficiently readable.

## Ambiguities That Should Influence Planning

- The user asked to "begin" by creating the homepage, but invoked the start-feature workflow. That means implementation should wait for plan approval.
- The final homepage purpose is not yet fully specified:
  - It could be a pure marketing / landing page for the game.
  - It could also be an entry screen that quickly routes players into the actual client experience.
- No brand assets or screenshots of the game client were provided yet, so the first version should rely on product framing, typography, tile motifs, and locally-controlled visuals rather than pretending finalized game art already exists.

## Recommended Direction For Planning

- Build a single polished homepage for `/` that feels like the front door to a competitive word game, not a generic SaaS page.
- Keep the implementation within `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, and optional small homepage components if needed.
- Use a strong tile-driven visual system and concise product messaging:
  - what the game is,
  - how a match works,
  - why matchmaking quality matters,
  - a clear primary call to action.
- Avoid introducing client state, routing complexity, or API integration in this first step.
