# SUPERColony project instructions

## Authority and boundaries

- Follow the user's current approved product direction and this project's
  [visual direction](docs/VISUAL_DIRECTION.md). Hallmark is the sole design
  authority; supporting UI skills implement and audit that direction.
- Preserve existing global tokens, scientific distinctions, source credits,
  gameplay rules, and accessibility requirements unless the user authorizes a
  change. Fictional boards and colonies must remain distinct from research data.
- Comfy is protected: do not inspect, invoke, alter, or manage it, its files,
  endpoints, or processes. Port 8000 remains reserved. Preview uses port 5173.
- No new runtime dependencies, hooks, CI enforcement, external design uploads,
  or background monitoring without the user's authorization.

## Visual direction checkpoint

For work that changes the game's appearance, open the approved reference and
read the frozen acceptance criteria before coding. If either is unavailable,
stop the visual implementation and record the missing evidence.

1. Implement one actual playable visual slice first. Render that slice on
   desktop and phone, then compare it directly with the approved reference.
   Do this before broad rollout, unrelated features, or expensive full checks.
2. Record what matches and what falls short, with the exact artifact and
   screenshot hashes. A design description, mockup, source diff, green test,
   or another agent's confidence does not replace an actual game render.
3. Stop and correct direction when the slice drifts. Do not keep extending a
   rejected treatment. Do not weaken the rubric or change protected acceptance
   to obtain a passing result.
4. Save a compact checkpoint in `HANDOFF.md` at each meaningful milestone or
   after 20 active minutes: visible result, reference comparison, unresolved
   finding, next action, elapsed time, and remaining shared repair allowance.
5. Preserve each failed review and its screenshots under a distinct historical
   path before replacing the current review. Never overwrite earlier evidence.

## Completion and claims

- Initialize a version 2 completion contract before substantial work, with
  observable user outcomes separate from engineering checks.
- For visual work, the contract **must** include the command
  `node scripts/direction-guard.mjs`, alongside appropriate protected tests,
  browser checks, and build checks. Run them through the completion helper.
- The guard validates complete, current review evidence. It does not evaluate
  artistic quality or authenticate a reviewer's judgment. Actual rendered
  comparison and user feedback remain necessary.
- A new user rejection invalidates the visual acceptance it concerns. An old
  green receipt cannot overrule that rejection or certify the revised artifact.
- Pure engine or documentation work without a visual claim does not require
  this art gate. Keep verification proportional to the actual scope.
- Carry the original task deadline and shared repair allowance through all
  stages and workers. Stop on missing required evidence, unchanged artifact and
  findings across two attempts, exhausted limits, or required scope expansion.
- Claim completion only after the final receipt check passes. Name remaining
  human acceptance steps and unverified behavior explicitly.
