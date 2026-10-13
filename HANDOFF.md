# SUPERColony current handoff

## Result and authority

The approved local browser game is implemented and verified in `/Users/nolos/Desktop/Ant Game`. User additionally authorized creating and working through a GitHub repository. Delivery home: private `https://github.com/Nolos510/supercolony`, branch `main`. Latest validation: 2026-10-13 group-order/fieldwork revision; final group-fieldwork receipt passes. Launch baseline 2f0261f and its receipt remain historical. Use `git log -1` for the delivery commit and `git status --short` when resuming.

## Current group/fieldwork revision

User requested multi-source orders and a more interactive Ecologist. Select multiple / Shift-click plus the paused checkbox picker now sends separate conserved fleets to one destination, retains selection across zoom and removes lost sources. Guided fieldwork defaults to actual-state survey → priority → response → timed follow-up; Free fieldwork keeps direct tools. Existing atlas design and ecological objective retained.

Final current receipt: verification/group-fieldwork-final-receipt.json. Typecheck, lint, 19 engine/content tests, 9 browser tests, production build and helper check pass. Independent UI/content review fixes were one linked repair under the original 90-minute/eight-repair budget. Details/screenshots: docs/GROUP_FIELDWORK_VERIFICATION.md. Local preview remains 5173; previous records below are historical. Next useful action: human playtesting of coordinated orders and the guided loop.

## User-visible behavior

Three single-player modes: 48-node worldwide Supercolony War with native Paraná-basin context, a twelve-node Australian Species Clash with two species choices, and habitat-preservation Ecologist. Shared reserves/fleets across world and region views, 25/50/100% orders through tap/drag/native keyboard controls, automatic growth and AI, terrain combat, timed interventions, tutorials, pause, restart, and complete results. Thirteen sourced field-guide entries and eight freely browsable research/participation/support resources connect discoveries and results directly to official destinations.

The visual direction is a geographic field atlas with mineral-blue water, moss terrain, warm-paper specimens and learning surfaces, charcoal controls, and cyan/amber tactical symbols. React owns controls/inspectors; a seeded fixed-step engine and Canvas animation operate outside its render cycle.

## Run and build

Local development preview: `http://127.0.0.1:5173`. The task’s Vite process was left running for review. To start after it stops, run `npm ci` then `npm run dev`. Requires Node 22.12+.

Production output is already built in `dist/`. Run `npm run build` to recreate it. To serve it, stop the development server for this project first, then run `npm run preview` on the same 5173 port. No backend, accounts, credentials, or API keys are required. Matches are in memory and refresh resets them.

## Latest playtest feedback

Combat is untimed and ends only when a colony has no nests or swarms left; majority control alone cannot end it. Ecologist retains its five-minute habitat survey and excludes native South America from its invasion graph. Review current match in the menu pauses, explains stats, preserves three takeaways, and allows continuing. AntWeb specimen/taxonomy links, explicit iNaturalist observation instructions, and New Zealand prevention links replace the unexplained Get involved destination.

Latest verification: typecheck/lint/build,15 unit/content tests,7 browser tests, and final helper check pass. The feedback run needed two scoped repairs; its linked contract carries the same total budget/deadline. Details: docs/FEEDBACK_VERIFICATION.md; current receipt verification/feedback-final-receipt.json. Original acceptance was revised before successor initialization because the user explicitly changed end conditions.

## Historical launch verification and evidence

All five protected commands pass: typecheck, lint, test (11 tests), test:e2e (4 browser tests), and build. Final completion-helper check passes with four attempts / three repairs. Same initial-plus-eight repair budget; no protected verifier changes. Receipt: `verification/receipt.json`; command logs and failed evidence: `output/verification/`.

See `docs/VERIFICATION.md` for detailed coverage and screenshot links. Browser checks include 1440/768/390/320/375/414 px, keyboard focus, reduced motion, zero axe violations, state-preserving zoom, capture, all mode results/restart, and resources. Supplementary checks cover real tutorial completion, drag and keyboard sending, full 300-second timer branches, all Ecologist actions/refill, regional scientific context, map failure/retry, new-tab pausing, dialog focus return, and production smoke without the development bridge.

Source/resource notes: `docs/SOURCES.md`, independent `docs/CONTENT_REVIEW.md`, and `docs/GEOGRAPHY.md`. The paper’s experimental outcomes are accurately separated from balanced combat. Generic native-community proxies outside Australia avoid claiming Australian meat ants occur worldwide.

## Boundaries and continuation

Comfy is excluded entirely; port 8000 stays reserved. No hosting, new hooks, telemetry, or external messages were introduced. Git commit identity is repository-local, based on the authenticated GitHub profile: Carlo Spampinato / `225438108+Nolos510@users.noreply.github.com`; global Git settings are unchanged.

Next useful action: human playtesting for enjoyment, balance, and learning. Chromium was verified; physical mobile devices, Safari/Firefox, and screen-reader sessions remain unverified. Public-release destination review, future species, multiplayer, campaigns, hosting, and App Store packaging remain later work.
