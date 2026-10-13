# Group commands and guided fieldwork — 2026-10-13

Continuation from verified 01c12e2, requested by the user. Existing geographic atlas direction and tokens were retained. No runtime dependencies were added.

## Behavior

Select multiple or Shift-click owned nests, choose the shared destination and fraction, then Send swarms. A paused native checkbox dialog supports keyboard and touch selection. Selected IDs survive zoom; lost nests leave selection. Each valid source launches its own fleet and pays its own worker share. Unreachable/foreign/empty sources remain untouched and are reported. The destination is ignored if it is also selected as a source. Orders count fleets rather than batch clicks; the preview is an upper bound before route rejection.

Ecologist now defaults to guided fieldwork: choose a three-second survey, inspect actual simulated neighboring nests/reserve changes/incoming fleets, choose a priority, apply a response, and record a follow-up after ten simulation seconds. Both intervals freeze during pause. Site/match changes reset local fieldwork. The observation snapshots and follow-up numbers are actual game values, not fictional field measurements or an isolated causal experiment. Empty transport routes are honestly reported. Free fieldwork retains the direct tools for experienced play.

The first pass is an observation-led interaction, not a social-character system. Ecologist’s existing habitat objective and charge/expiry mechanics remain active.

## Verification

Protected commands all pass: typecheck, lint, 19 engine/content tests, 9 browser tests, and production build. Final helper check passes on verification/group-fieldwork-final-receipt.json. Its linked repair preserves the original 90-minute deadline and seven remaining repairs after independent UI/content findings. Original receipts and evidence remain historical; existing protected tests were not changed after initialization. The pre-contract ecology browser fixture now deliberately chooses Free fieldwork to test direct tools; a separate new protected case verifies the default guided observation→response→follow-up and pause behavior.

Batch tests cover worker conservation, duplicate IDs, partial invalid-source rejection, paused/invalid commands, orders per fleet, immutable inputs and friendly arrivals above capacity. Browser tests select three nests, send three fleets, preserve selection across zoom, and complete a paused-time-safe guided habitat survey and follow-up.

Manual preflight/confirmation inspected 1440/768/390/320/375/414px. Source picker axe audits found zero violations at all six widths. Destination control widths remain 144–358px, with no horizontal overflow. Desktop Shift-click dispatched two sources. Fieldwork transport observation/response/follow-up had zero axe violations at 1440/768/390/320px. Runtime error collection was empty. Independent reviewers inspected the source picker, group controls and fieldwork reports, then requested tablet charge-label spacing and copy that does not promise recovery or imply blocked fleets are moving; those fixes were applied and all protected checks passed again.

Preflight repaired the initial narrow-screen source-control overflow, uppercase body text and contrast finding as one batch before final command verification. Evidence: output/group-fieldwork/preflight.json and confirm.json. The whole-source picker scrolls natively; browser automation exercised checkbox selection and its commit button. Human playtesting, physical touch devices, Safari/Firefox and screen-reader sessions remain unverified.

Changed files: App, Map, Inspector, store, engine/types, styles, README; new SourcePicker and Fieldwork components; protected batch/browser tests and successor verification records. No accounts, backend, hosting or new hooks. Comfy excluded; port 8000 reserved.

## Captures

- [Group controls/mobile](screenshots/group-mobile.png)
- [Source picker/320px](screenshots/group-picker-320.png)
- [Fieldwork follow-up/mobile](screenshots/fieldwork-followup-mobile.png)

Run npm run dev on 127.0.0.1:5173; fresh matches use the new interactions. The production build is available in dist/.
