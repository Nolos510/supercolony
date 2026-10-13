# SUPERColony

Small ants. A bigger world. A local browser strategy game combining short swarm matches with scientific field notes and conservation resources.

## Run locally

Requires Node.js 22.12+ and npm. Dependencies are pinned by `package-lock.json`.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The game is single-player, browser-local, and needs no accounts or API keys. All map and learning data ship with the build. Scientific and conservation links open external websites only when selected. Port 8000 is reserved and unused.

## Play

- **Supercolony War:** move between seven real regions. Capture 60% of 42 simulated nests for twenty seconds, or lead in territory at five minutes.
- **Species Clash:** choose Argentine ants or Australian meat ants on a twelve-site Australian battlefield. Use recruitment, worker strength, and complex terrain.
- **Ecologist:** preserve at least 60% of initial native habitat after five minutes. Restore habitat, reduce food subsidies, or restrict transport at gateway nests. Three charges; one returns every fifteen seconds.

Choose your cyan source nest and a destination, then send 25%, 50%, or 100% of its workers. Tap a rival/unclaimed nest after selecting your source, drag between nests, or use the labeled source and destination selectors with a keyboard. The world map shows gateway nests; regional zoom exposes their local neighbors. Both views operate on the same workers and fleets. Pause whenever you want; opening the field guide pauses the match. Hidden browser tabs automatically pause. Use the leaf wordmark to return to mode selection.

## Science and resources

Real geography and published biology inform the game. Nest positions, territorial ownership, worker counts, dispersal routes, intervention timelines, and combat coefficients are simulated. These are strategy scenarios, not live surveys or pest-control recommendations. Both featured species have one worker form.

The freely accessible field guide contains twelve short entries and seven reviewed resources, with topic/region filtering. See [source notes](docs/SOURCES.md) and the [independent content review](docs/CONTENT_REVIEW.md).

Ecologist uses generic native-community proxies outside Australia, rather than suggesting Australian meat ants occur worldwide. Its habitat pressure and intervention effects are game-balanced abstractions. Conservation resources lead to independent organizations; participation and optional financial support take place on their own websites.

## Architecture

- React/TypeScript/Vite shell with a shared external store.
- Immutable, seeded engine stepping at 0.1 simulated seconds; AI and three objectives share the same graph.
- Canvas geography, trails, and decorative swarm particles; semantic HTML nest buttons and native controls provide keyboard access.
- Natural Earth land geometry bundled in `public/world.json`; native vector specimen illustration and CSS token palette.
- Scenario registry and typed species/fact/resource entries provide the extension points for later species.
- Matches are in memory. Refreshing starts over. No backend, analytics, multiplayer, or persistent campaign.

## Validate

```sh
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

Browser tests use Playwright Chromium (`npx playwright install chromium` once if needed), exercise all three modes and six widths, and save screenshots/report in `output/playwright/`. Five-minute browser result checks accelerate simulated time using a development-only bridge; production builds omit that bridge. `npm run preview` serves the production build locally.

The project uses a protected completion contract in `verification/contract.json`. Final evidence and implementation status are recorded in `HANDOFF.md`; human playtesting is still needed to judge enjoyment and learning.

## Repository

Private repository: https://github.com/Nolos510/supercolony. No hosting is configured.
