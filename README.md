# SUPERColony

Small ants. A bigger world. A local browser strategy game combining untimed swarm matches and a timed habitat survey with scientific field notes and conservation resources.

## Run locally

Requires Node.js 22.12+ and npm. Dependencies are pinned by `package-lock.json`.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The game is single-player, browser-local, and needs no accounts or API keys. All map and learning data ship with the build. Scientific and conservation links open external websites only when selected. Port 8000 is reserved and unused.

## Play

- **Supercolony War:** expand across 42 fictional nests in seven introduced-region boards. Start at the Berkeley US1 reference, with cooperating references in California, Mediterranean Europe, Japan, Australia, New Zealand and Hawaiʻi. Lake Hodges US2, KMC H2 and Stellenbosch SA are independent rivals. Friendly networks provide passage, accept reinforcements and target documented enemies; unreported rival comparisons remain unknown. Paraná is available as native-range learning context. Command only your own nests. There is no time limit: victory requires eliminating rival nests and surviving rival swarms while your colony survives; cooperating nests never need conquering.
- **Species Clash:** choose Argentine ants or Australian meat ants on a twelve-site Australian battlefield. Use recruitment, worker strength, and complex terrain. Combat is untimed and uses the same elimination rule.
- **Ecologist:** preserve at least 60% of initial native habitat after five minutes. Restore habitat, reduce food subsidies, or restrict transport at gateway nests. Three charges; one returns every fifteen seconds. Guided fieldwork adds a three-second observation, a chosen priority, an intervention test, and a ten-second follow-up using actual simulated site values. Pause freezes observations and follow-ups. Free fieldwork keeps the direct tools available.

Drag from an owned nest, sweep across other owned nests to collect sources, and release on the destination to send 25%, 50%, or 100% from each eligible source. The preview identifies attack, capture, or reinforcement. Dropping outside a nest, another finger, pointer cancellation, opening a menu, or changing views cancels the gesture. Ownership and reserves are rechecked on release. Tap/Shift-click selection, **Choose sources** checkboxes, and **Keyboard orders → Send** provide alternatives. Unreachable sources are skipped and reported.

The world map shows gateway nests; the region selector reveals their local neighbors. Both views share the same workers and fleets. Phone **Nest details** opens a dedicated reading screen; desktop expands a side inspector without pausing. Nest details and expanded Orders start collapsed. The compact dock keeps Sources, the active percentage, and Send visible. **Game menu** exposes Resume, Review current match, Restart, and Exit to home. Restart preserves mode/species; restart and exit require confirmation with Cancel focused first. Matches stay in memory and refreshing starts over.

**Learn** pauses play and opens a searchable Topics / Species / Regions / Resources index with one article and one reading scroller. Back returns to your prior screen; press Resume to continue a paused match. **Research** also pauses, hides game orders, and shows dated evidence separately from match ownership. Hidden browser tabs pause automatically.

**Orders → Select region** selects all your regional nests, including the gateway, for direct sending through friendly routes. **Rally to gateway** sends the selected percentage from your other reachable nests; complete regional control is unnecessary. **Auto rally** checks once per game second: each reachable player nest with at least twenty workers sends exactly ten, preserving at least ten. It ignores the manual percentage, excludes cooperating nests, and switches off if the gateway is lost. Blocked sources retain their workers. Regional markers show each actual nest’s ownership separately from Ecologist’s habitat retention and community proxies.

**Improve foraging network** commits thirty game units at your regional gateway (Port verge in Species Clash), prepares for twenty game seconds, and raises growth at your regional nests by twenty percent until the gateway is lost. Phone Details offers an explicit **Resume & improve network** action that returns to the map and starts preparation. Pause freezes preparation; losing the gateway cancels or removes development without refund. Retaking it permits a fresh purchase. Base Argentine-ant growth is 0.95 units/sec and meat-ant growth is 0.32; these replenish commandable reserves and are game balance values, not measured birth rates. Capacity stops replenishment; unclaimed nests do not grow. Match review distinguishes manual orders, automated rally swarms, and development units.

## Science and resources

Real geography and published biology inform the game. Nest positions, territorial ownership, worker counts, dispersal routes, intervention timelines, and combat coefficients are simulated. These are strategy scenarios, not live surveys or pest-control recommendations. Each featured species uses a single worker unit in the game.

The freely accessible field guide contains sixteen short entries, eight regional profiles, and eighteen reviewed resources, with search and collapsible topic/region filters. AntWeb provides Argentine-ant specimen images and taxonomy; iNaturalist explains sharing an ant photo, date, and location for community identification. Neither is an official invasive-species reporting channel. See [source notes](docs/SOURCES.md) and the [independent content review](docs/CONTENT_REVIEW.md).

The native South American region is educational context in Ecologist, because native-range ants are not treated as invaders. Ecologist uses generic native-community proxies outside Australia, rather than suggesting Australian meat ants occur worldwide. Its habitat pressure and intervention effects are game-balanced abstractions. Conservation resources lead to independent organizations; participation and optional financial support take place on their own websites.

Real Argentine- and meat-ant worker photographs carry visible photographer, source, specimen identity, and license credits. Species comparison labels antennae, mandibles, head, mesosoma, waist, and gaster on an original explanatory diagram; photographs are not to a common scale. The local specimen explorer supports pan/zoom, Fit/Reset, anatomy guides and comparison. Micro-CT slices remain an explicitly advanced external resource; they are not the main ant viewer. No exact meat-ant scan or embedded 3D model is claimed. See [asset credits](docs/ASSETS.md).

Research layers separate the 2010 study’s nine samples and reported pairwise assays, the published June 2022 distribution snapshot, and the 2025 California resurvey’s GPS records separated by survey period. California points share a projection with reviewed NOAA land/coastline geometry. They disclose observation dates, methods, coordinate precision, review date, and limitations. Occurrence records do not establish colony identity or current frontlines. [Source pack](docs/SOURCE_PACK_RECOGNITION.md) records the data and transformations. Simulated cooperating networks are separate from documented relationships; the replayable three-step walkthrough explains that distinction.

Sixty explicit setting assignments use 55 individually reviewed primary photographs across eight regional profiles and Species Clash, with five compatible Australian cross-mode reuses. Sixteen retained photographs provide regional Open/Complex alternatives. Details and regional articles show locality, photographer/institution, source, license, review date, and resize provenance. They are representative settings; each game nest remains fictional, and photographs do not establish ant occurrence or colony identity. [Atlas source pack](docs/ATLAS_RESEARCH_SOURCE_PACK.md), [western credits](docs/ATLAS_HABITAT_WEST.md), and [eastern credits](docs/ATLAS_HABITAT_EAST.md) preserve individual verification records. Food-access explanations link to Argentine-ant diet, meat-ant trail, and meat-ant nutrition research, with abstract-only access identified where applicable.

Two local [visual studies](docs/DESIGN_STUDIES.html) compare the retained paper-atlas direction with a darker exploration; the exploration was not adopted. With the development server running, open `/docs/DESIGN_STUDIES.html`.

Sixteen sourced **At a glance** diagrams summarize the field notes. Three optional untimed activities—Anatomy detective, Trail bottlenecks and Recognition detective—offer photo hotspots, a passage-width experiment and historical pairwise evidence. They do not change the match or measure learning. **General Mandible** supplies four introductory panels and three replayable fictional vignettes, with captions, factual field notes, manual controls and bounded optional playback. All content works with reduced motion. [Art and motion credits](docs/ATLAS_ART_AND_MOTION.md) record the original artwork and pinned transition reference.

Desktop Details can be resized with its handle or keyboard and reset. Phones retain the dedicated Details screen. Transform-based panel/page/confirmation motion preserves readable text, focus and immediate reduced-motion states; frequent reserve updates and resizing stay immediate. Global tokens remain unchanged.

## Richer playable atlas

Eight original painted regional environments, illustrated habitat medallions, winding trails, a textured geographic world view, and specimen-led paper Details implement the approved richer-atlas direction in the actual game. The terrain field note includes a two-panel illustrated comparison. These illustrations are fictional; the real habitat and specimen photographs retain their individual credits. See [original art credits](docs/design/RICH_TERRAIN_ART.md).

Visual changes follow [the pinned direction](docs/VISUAL_DIRECTION.md). Run `npm run verify:direction` after capturing and actually reviewing fresh game renders. It rejects missing, failed, or stale evidence; it does not automatically judge artistic quality or authenticate a reviewer. Future visual completion contracts must include this check.

## Architecture

- React/TypeScript/Vite shell with a shared external store.
- Immutable, seeded engine stepping at 0.1 simulated seconds; AI and three objectives share the same graph.
- Canvas geography, trails, and decorative swarm particles; semantic HTML nest buttons and native controls provide keyboard access.
- Natural Earth land geometry bundled in `public/world.json`; licensed worker photographs, original anatomy diagrams, and the existing CSS token palette.
- Scenario registry and typed species/fact/resource/specimen/regional-context/research-map entries provide the extension points for later species.
- Matches are in memory. Refreshing starts over. No backend, analytics, multiplayer, or persistent campaign.

## Validate

```sh
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

Browser tests use Playwright Chromium and WebKit (`npx playwright install chromium webkit` once if needed), exercise all three modes, six widths, and short landscape, and save screenshots/report in `output/playwright/`. Five-minute browser result checks accelerate simulated time using a development-only bridge; production builds omit that bridge. `npm run preview` serves the production build locally.

Results distinguish capture events (including recaptures), successful swarm orders or interventions, and science topics linked to events. Topics encountered is not a learning assessment. Nests currently held are reported separately.

The current protected completion contract is `verification/visual-reflow-contract.json`; its receipt is `verification/visual-reflow-receipt.json`. All declared commands pass through the completion helper: typecheck, lint, 49 unit/content tests, 56 browser cases, build, eight direction-guard regressions, and the current rendered-direction evidence check. Earlier contracts remain historical; the earlier atlas delivery was rejected for its appearance. [Rich-atlas delivery evidence](docs/RICH_ATLAS_VERIFICATION.md) and [HANDOFF.md](HANDOFF.md) record the correction and remaining human acceptance. Physical iPhone Brave playtesting and enjoyment are not established by browser tests.

## iPhone Brave preview

Build with `npm run build`, then serve with `npm run preview -- --host <Mac-LAN-IP>`. The Mac and iPhone must share the same Wi-Fi/LAN. Open `http://<Mac-LAN-IP>:5173/` in Brave; use the Mac’s LAN address rather than localhost. A development server bound only to `127.0.0.1` can coexist on the same port when the preview binds specifically to the LAN address. If another server binds all interfaces, use one project server at a time.

The phone layout uses dynamic viewport height, safe-area padding, touch-sized controls, and a dedicated short-landscape arrangement. Automated WebKit tests do not replace the physical iPhone Brave acceptance step: try portrait and landscape, toolbar expansion/collapse, a multi-source drag, cancellation, restart/exit, and reading navigation. Temporary LAN addresses remain in ignored `output/phone-test/session.json`.

## Repository

Private repository: https://github.com/Nolos510/supercolony. No hosting is configured.
