# Historical mobile-atlas checkpoint

Superseded by the current root HANDOFF.md. This records the completed ef1ca24 scope, not current regional verification.

# SUPERColony current handoff

## Current delivery — 2026-10-13

The approved mobile atlas, living specimens, research maps, and recognition-network revision is implemented in `/Users/nolos/Desktop/Ant Game`. Private delivery home: `https://github.com/Nolos510/supercolony`, branch `main`. Use `git log -1` for the delivery revision and `git status --short` when resuming. The previous source checkpoint was 48cb58a.

Design direction: the existing geographic field atlas, with mineral-blue water, moss terrain, warm-paper learning surfaces, charcoal controls, and cyan/amber ownership symbols. The primary task is comfortable phone play followed by a short, credible path into learning. Global tokens, React/Canvas architecture, and all three modes remain. Two local visual studies compare retained paper-atlas and exploratory night treatments; no alternate identity was adopted.

## User-visible changes

- Compact Game menu / current mode / Learn header, larger battlefield, region selector, percentage/source dock, desktop inspector, and dedicated phone Details. Short landscape is supported. Dynamic viewport height and safe-area padding replace the old 780px minimum. Enlarged text wraps controls and allows the game shell to scroll while preserving a playable map.
- Pointer Events dragging starts on an owned nest, collects additional owned sources, previews the destination, and sends on release. Invalid drops, cancellation, additional fingers, menus, and view changes cancel; release rechecks reserves and ownership. Tap/Shift-click, checkbox sources, and keyboard sending remain available.
- Active-match Resume / Review / Restart / Exit menu. Restart preserves mode/species; restart and exit confirm with Cancel initially focused. Exit discards the in-memory round.
- Searchable Topics / Species / Regions / Resources reading index with one article and one content scroller, retained reading position, collapsible resource filters, and contextual Back navigation. Reading and Research pause play; returning exposes Resume.
- Real licensed worker photographs with visible credits, six-part anatomy comparison, verified Argentine-ant Antscan link, and eight sourced regional profiles. Hawaii uses native habitat/invertebrate community labels. No exact meat-ant 3D scan or embedded model is claimed.
- Dated Research layers: 2010 global sampling/recognition and 2025 California GPS resurvey. Game state and documented evidence remain separate; dates, methods, precision, unknown comparisons, and review notes are visible. No live frontline claim.
- War-only cooperating AI at california-1 and newzealand-1 starts with 32 workers. Friendly passage deposits nothing; final reinforcements join destination reserves without ownership changes. Cooperating AI supports depleted player nests and targets rivals. War remains untimed, with player/rival elimination including surviving fleets; cooperating nests need no conquest. Recognition walkthrough is skippable and replayable.
- Review explains captures, swarm orders, friendly reinforcements, and topics encountered; discoveries count linked ideas, not demonstrated learning. Guided Ecologist fieldwork remains actual-state observation → priority → intervention → timed follow-up.

## Verification and evidence

Final record: `verification/mobile-atlas-delivery-receipt.json`, contract: `verification/mobile-atlas-delivery-contract.json`. The completion helper's final `check` reports complete. All five protected commands pass: typecheck, lint, 27 unit/content tests, 26 browser cases (13 Chromium + 13 WebKit), and production build. `git diff --check` passes. No protected test was weakened during repair.

Independent browser inspection covers 1440×1000,768×1024,320×568,375×667,390×844,414×896, and 844×390. Normal primary targets measure at least 44px; controls/focus, Cancel-first confirmation, keyboard navigation, reduced motion, empty/filter states, reading scroll, and overflow were inspected. Scanned home/play/reading/research/review surfaces report axe 0 and no page errors. 125% text proxy passed; 200% at 320px preserves a 384px battlefield, reachable dock, one reading scroller, and no horizontal overflow after the final banner/tab repairs. These are computed-font browser proxies, not physical-device proof.

Supplemental acceptance: 20 touch/keyboard checks across both engines passed with a frozen-clock fixture, covering collection, all cancellation paths, ownership/reserve changes on release, and conserved sending. 11 direct engine checks passed for changing ownership during travel, friendly passage, simultaneous conservation, surviving fleets, and simultaneous extinction. Natural War reached 300s/running; natural Species ended by extinction at 214.9s; controlled AI-off War/Species reached 300s/running; Ecologist ended at 300s. Production LAN smoke passed in Chromium and WebKit: HTTP 200, decoded real photograph, exact specimen link, research navigation, exit, no runtime errors, and no development bridge.

Selected screenshots and source/asset notes: [MOBILE_ATLAS_VERIFICATION.md](../MOBILE_ATLAS_VERIFICATION.md), [ASSETS.md](../ASSETS.md), [SOURCE_PACK_RECOGNITION.md](../SOURCE_PACK_RECOGNITION.md). Detailed ignored evidence lives in `output/mobile-atlas/` and `output/verification/mobile-atlas/`; final widths are in `qa-banner-confirm.json`, research/reading in `qa-finalseal.json`, gestures in `gesture-extra.json`, engine in `engine-extra.json`, and production in `production-smoke.json`. Initial failed evidence is retained. Earlier launch, feedback, group-fieldwork, and mobile-atlas records remain historical.

One initial implementation plus five shared repair cycles were used within the original three-hour deadline. Linked successors preserve terminal/failed receipts, unchanged criteria, and the remaining budget. The capture fixture correction was independently justified (CA0 through friendly CA1 instead of an infeasible CA3 half-swarm); the assertion was preserved. The deadline and repair budget were not reset. Source is sealed; further source changes require a new declared scope/checkpoint.

## Run and phone preview

Node 22.12+; `npm ci`, then `npm run dev` for loopback 5173. Production output is in `dist/`; `npm run preview -- --host <Mac-LAN-IP>` serves it for a phone on the same LAN. Loopback-only development and a specifically bound LAN preview can coexist on 5173. Use one server when bindings overlap. Current temporary address/session details are in ignored `output/phone-test/session.json`; keep the IP out of committed product documentation. Refresh Brave after an update.

The local production archive is `output/releases/supercolony-browser-build.zip`. It includes `dist/` and source/asset notes; serve `dist/` with an HTTP static server. No backend, account, API key, analytics, persistent campaign, or hosting is required. Refresh resets in-memory matches.

## Remaining human acceptance and boundaries

Physical iPhone Brave playtesting remains required: portrait/landscape, expanding/collapsing toolbars, actual notches/safe areas/text-size settings, source collection/drop/cancel, restart/exit, and reading return. Screen-reader sessions remain unverified. Human playtesting remains the measure of enjoyment, balance, and learning. No other implementation blocker remains after automated and independent checks.

Comfy is excluded entirely; port 8000 remains reserved. No runtime dependency, hooks, CI enforcement, external design upload, backend, or hosting was added. Git identity remains repository-local: Carlo Spampinato / 225438108+Nolos510@users.noreply.github.com. Resource/organization listings imply no partnership. Reviewed evidence and simulated affiliations remain distinct. Before public release, review official destinations again. Multiplayer, new playable species, persistent campaigns, live feeds, embedded 3D, hosting, and App Store packaging remain later work.
