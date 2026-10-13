# Playtest feedback verification — 2026-10-13

Baseline `2f0261f` was verified at launch. The user then requested untimed combat, South American context, ant-focused resources, and clearer results. This is a scoped continuation using the existing atlas design and no new dependencies.

## Changed behavior

- War and Species Clash have no clock limit or 60%-twenty-second cutoff. A colony survives with any nest or positive worker fleet; combat ends only after elimination, with a draw if both disappear.
- War now has eight regional contexts and 48 simulated nests. The Paraná basin is labeled native range with an illustrative Corrientes anchor verified against Natural Earth. Ecologist keeps its 300-second,42-site habitat challenge; South America is educational context rather than an invasion scenario.
- Menu → Review current match pauses the simulation and shows three takeaways. Continue match resumes. No game facts are padded merely to raise the topic count.
- Results distinguish current nests held, cumulative Capture events including recaptures, Swarms sent or Interventions used, and Topics encountered. The last count describes event-associated topics rather than measured learning.
- Thirteen facts and eight resources include AntWeb specimen/taxonomy information. Observation links clearly explain iNaturalist photo/date/location sharing and community identification. New Zealand prevention guidance has its own explicit regional link.

Changed files include App, Menu, Map, Inspector, Learning, styles, game types/engine/scenarios, educational metadata, source/geographic notes, README, and acceptance tests. No global tokens or visual identity were replaced.

## Evidence

All five required commands pass: typecheck, lint,15 unit/content tests,7 browser tests, and production build. Final helper check passes on `verification/feedback-final-receipt.json`. The initial successor checks passed, but a supplemental axe review identified a serious invalid definition-list structure. One repair placed descriptions in semantic dd elements and added a protected review accessibility/scroll/state regression. The old receipt, first successor receipt, and failure evidence remain intact; the linked repair contract carries the original deadline and remaining six-repair allowance. No existing protected tests changed after contract initialization.

Engine tests prove both combat modes continue at 900 simulated seconds despite 70% rival territory, eliminate only after surviving fleets are exhausted, allow recovery with no nests via an in-flight swarm, count recaptures, and preserve earlier deterministic/conservation/pause/terrain/intervention checks. Browser tests exercise untimed play, review/continue, elimination results/restart, native-region zoom state, source navigation, and responsive accessibility.

Main game and match review were captured at 1440/768/390/320/375/414px. Axe found zero violations in the final review at all six widths; review scrolling reaches Continue match and preserves exact paused state. Keyboard focus, reduced motion, horizontal overflow and game runtime errors are covered by the existing browser checks. Root and an independent reviewer inspected desktop/tablet/mobile screenshots, found no blocking collisions, and confirmed the expanded links and stat definitions are readable. Physical devices, Safari/Firefox and human learning remain unverified.

- [Untimed world](screenshots/untimed-world-desktop.png)
- [Desktop review](screenshots/match-review-desktop.png)
- [Mobile review](screenshots/match-review-mobile.png)
- [320px review actions](screenshots/match-review-actions-320.png)

Local logs: `output/feedback/verification/`, `output/feedback/repair-verification/`, and `output/feedback/review-failure.json`. The launch report remains historical in `docs/VERIFICATION.md`. Live mapping remains a later dataset task; the game’s nest/ownership counts are simulations rather than current biological surveys.

A second supplementary mobile check found the Ecologist educational context card overlapping the inspector. The final linked repair uses normal-flow layout and adds a protected 320px return-button regression; an additional 390px confirmation passed. Final total: initial command attempt plus two scoped repairs; original deadline preserved and six repairs remain. Final commands: typecheck, lint, 15 tests, 7 browser tests, build; final helper check passes. Current receipt: verification/feedback-final-receipt.json. Previous receipts/evidence stay historical.
