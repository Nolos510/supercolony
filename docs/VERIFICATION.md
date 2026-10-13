# SUPERColony launch verification

Historical launch record at2f0261f. Current playtest-feedback evidence is in [FEEDBACK_VERIFICATION.md](FEEDBACK_VERIFICATION.md).

Reviewed locally on 2026-10-13. The approved implementation is complete; enjoyment, learning, and final balance need human playtesting.

## Protected checks

The version 2 completion contract was initialized before feature implementation. Its protected engine/content/browser tests, acceptance fixture, and Playwright configuration were unchanged throughout the repair loop.

| Check | Final result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass — 2 files, 11 tests |
| `npm run test:e2e` | Pass — 4 browser tests |
| `npm run build` | Pass — production bundle in `dist/` |
| Completion helper `check` | Complete — attempt 4, 3 of 8 repairs used |

The engine checks cover deterministic replay, worker conservation and invalid orders, simultaneous friendly arrivals, terrain effects, intervention refill/expiry, pause, territory victory/defeat/ties, and ecology outcomes. Content checks cover the twelve facts, seven resources, supporting IDs, expected article identities, and single worker forms.

The browser checks cover mode/species selection, tutorial entry, real sending and capture, exact shared-state preservation during paused zoom, field-guide pausing, mode results, restart, topic/region filters, outbound link semantics, keyboard focus, reduced motion, runtime errors, overflow, and axe audits.

Local receipt: `verification/receipt.json`. Final command logs: `output/verification/attempt-4/`. Failed logs and browser evidence remain under attempts 1–3. These ignored output files and the receipt’s absolute paths describe this workstation; they are not portable attestation on another checkout. Run the five ordinary npm commands after cloning.

## Additional browser evidence

Supplementary checks in `output/playwright/supplementary.json` established:

- Completing the interactive tutorial after a real order; returning from the menu preserves an already paused match.
- Native drag dispatch at the selected 25% strength and keyboard dispatch across the California–Mediterranean link.
- World and regional views preserve identical fleets and reserves while paused.
- Each mode completes the full 300-second timer branch with AI disabled for that branch test. Separate default-AI runs reach valid results, sometimes earlier under the territory rule. Simulated time was accelerated; this was not a fifteen-minute human playtest.
- Species Clash’s other regions show educational context and return to the Australian battlefield.
- All three Ecologist actions, tutorial completion, empty-charge disabling, and a refill at fifteen seconds; intervention controls remain reachable by scrolling on mobile.
- Seven-resource hub at 1440, 768, 390, and 320 px without horizontal overflow; closing it retains pause.
- A failed geography fetch displays a retry action and recovers after retry.

Additional axe audits found zero violations in the mobile Ecologist interface, full field guide, and resource hub. Dialog closure returned focus to its launching navigation button. The terrain resource opened the expected PMC destination in a new tab while the game stayed paused. One initial supplemental audit harness attempt required an explicit browser context; the corrected harness passed without product changes.

The production bundle was also served by a temporary local HTTP server and smoke-tested in Chromium: an order was accepted, all twelve field-guide entries rendered, no browser errors occurred, and `window.__supercolony` was absent. The temporary server was closed. The development preview remains at `http://127.0.0.1:5173`.

## Visual and interaction review

The direction is a geographic field atlas: pale mineral-blue water, muted moss land, warm-paper specimen and learning panels, charcoal command controls, and cyan/amber ownership symbols. The primary task is to make a quick swarm or habitat decision, follow its outcome, and reach a relevant research or participation link.

Supercolony War world layouts were captured at **1440×1000, 768×1000, 390×844, 320×844, 375×844, and 414×844**. Final full-page dimensions match those viewports, with no horizontal overflow. Desktop has a scrollable inspector; mobile has independent middle-content scrolling, explicit region controls, and a persistent command bar. An independent reviewer inspected final 1440, 768, 390, and 320 px screenshots and CSS and found no remaining release-blocking layout findings.

Root also inspected the Australian regional battlefield, match results, mobile Ecologist tools, and desktop/mobile/320 px resource dialogs. Default, selected, paused, disabled, action-success, map-error/retry, visible keyboard focus, and reduced-motion behavior were exercised. The catalog’s worldwide entries make the resource empty state unreachable with the current filters; its copy and implementation were reviewed rather than represented as a live-tested state.

Earlier findings were repaired together: a Canvas component/global constructor name collision, background modal controls appearing in accessibility queries, ambiguous region labels, pause/resume preservation, compact mobile world navigation, tablet gateway positioning, and viewport height/command-bar containment. The protected tests were not weakened to repair these findings.

## Screenshots

| Surface | Capture |
|---|---|
| World / desktop | [world-desktop.png](screenshots/world-desktop.png) |
| Australian matchup / desktop | [species-desktop.png](screenshots/species-desktop.png) |
| World / mobile | [world-mobile.png](screenshots/world-mobile.png) |
| Resource hub / mobile | [resources-mobile.png](screenshots/resources-mobile.png) |

Further local captures, including all six widths, regions, results, resources, and Ecologist controls, are in `output/playwright/`.

## Remaining limits

Automated browser verification used Chromium on macOS. Safari, Firefox, physical touch devices, screen-reader sessions, and human enjoyment/learning were not verified. Scientific values and geography inform the presentation; worker counts, nest positions, routes, combat coefficients, and timed interventions are game abstractions. See [sources](SOURCES.md), [content review](CONTENT_REVIEW.md), and [geographic notes](GEOGRAPHY.md).

No backend, account, API key, multiplayer, campaign persistence, live data, public hosting, or App Store package is included. No new repository hooks or enforcement were enabled. Comfy was excluded and port 8000 remained reserved.
