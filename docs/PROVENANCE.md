# Event contribution and provenance boundary

The owner confirmed on November 4 that the new SaaS workspace, mascot and event
features began **after October 26, 2026, 12:24 PM Eastern** (16:24 UTC / 17:24
Africa/Lagos). This is an owner attestation, not independent authorship proof.

The source comparison baseline is
`05caf9af22173b5235cef4795ab19b2660761b8f` (September 23). The preserved full
development snapshot is
[`fd34773d507e1d3b43b7ba9dfb37ea295523be09`](https://github.com/El-dorado01/brisky/commit/fd34773d507e1d3b43b7ba9dfb37ea295523be09),
tagged `backup/pre-meta-only-2026-11-04` in the separate development repository.
No history was rewritten or backdated. The submission repository starts fresh.

## Included event work

- New SaaS workspace: email-code authentication integration, onboarding, Spaces,
  message/reply lifecycle, shortlists, people/tagging UI, Studio, settings and
  immersive voice UI. Integration source is under `apps/web`.
- New Meta adapters, grounded answer/citation contracts, Studio contracts,
  contextual-evidence checks, owner-scoped people/Face pilot interfaces,
  stage telemetry, scheduler/evaluation improvements and tests, where added as
  event files. Source under `event-components/api` is an integration component,
  not a complete replacement for the original engine.
- Streaming Meta ASR/dialogue plus resident Meta MMS, interruption handling and
  call/search coordination; setup scripts and browser microphone client.
- Event mascot source/assets.
- New November 4 submission packaging: standalone fixture runner, local session
  boundary, explicit Meta-only model configuration, build/audit scripts, tests
  and judge instructions. The runner reuses the actual event evidence/Studio
  contracts and voice orchestration rather than relabelling the old engine.

`source-manifest.json` records 370 exported files with source hashes. The export
selected files absent at the baseline and excluded identical baseline blobs.
After export, new root scaffolding, workspace entry/configuration/style files,
runner, tests and documentation were written for this independent component.
The manifest describes exported source, not subsequent packaging modifications
or every file in the final tree. New submission commits establish the current
content, not historical development timestamps.

## Explicitly pre-existing and excluded

The original engine's indexing pipeline, cloud connector foundations, original
FFmpeg scenes/keyframes, original Whisper/Gemini processing, semantic/vector
search, pgvector schema, BullMQ infrastructure, source playback/extraction and
old dashboard existed before this event. They are not copied here as new work.
The pre-existing landing page was moved into `apps/web` during development;
the move does not make it new. Its pages, marketing sections and associated
helpers are excluded. New workspace scaffolding replaces those entry points.

New integration files may refer to original engine interfaces that are absent
here. Such files are reviewable extension source; they are not represented as
independently runnable services. Read DEPENDENCIES.md. Judging the standalone
runner does not require the original engine.

## Verification status

- Standalone build and six isolated runtime tests passed: configuration rejects
  non-Meta selections, casual replies remain ephemeral, source IDs are validated,
  Studio needs a shortlist, and the HTTP runner works without engine/database/key
  and rejects cross-origin mutations.
- Static explicit-runtime model audit passes. This is not exhaustive dependency
  verification or an organizer eligibility ruling.
- A live Meta Wonder check against synthetic text passed source citation, an
  ephemeral thank-you and a two-section Studio brief using these shared contracts.
  It used the approved development ledger, not a new reset allowance. No real
  media or private-engine call was involved. Desktop 1280px and mobile 390px
  layout checks passed with no horizontal overflow or script errors; fixture
  selection and prompt controls worked. Optional voice in this new runner has
  not yet received an end-to-end microphone check on a fresh MMS installation.
- The exported event workspace passed TypeScript checking against the installed
  matching development dependencies; a clean production Next build and full
  database/engine-backed workspace runtime are not established by that check.
- Full workspace integration, personal-media recognition accuracy, production
  scaling, and arbitrary external-engine compliance are not established by the
  standalone runner.
- Historical Spark/Wonder and local MMS measurements in exported development
  docs concern the original development environment and their stated scope;
  they are not automatically measurements of this standalone packaging.
