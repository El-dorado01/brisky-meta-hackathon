# Run the actual Brisky application

The root sample runner has a simplified UI and synthetic observations. To run the
actual SaaS UI, Drive indexing, media search and playback, use the separately
declared original engine repository with its event-developed Meta-only profile.
The original engine is not claimed as newly built for the hackathon.

## Fetch the compatible version

Requires Git, Node 22.6+, pnpm/Corepack, Docker, FFmpeg/FFprobe on PATH, Python
3.11–3.14 and several GB of disk space for dependencies and CPU Torch.

```sh
npm run setup:full
npm run setup:full -- --check
cd .engine
corepack enable
pnpm install --frozen-lockfile
pnpm --dir apps/web install --frozen-lockfile
```

The setup script clones the public external engine at the exact revision in
`full-engine.json` into ignored `.engine`. It never overwrites another checkout,
starts processing or spends inference credits. Keep that directory out of event
source submissions. No private engine service or developer credentials are used.

## Credentials and Meta-only profile

Copy `.engine/.env.example` to `.engine/.env`, and
`.engine/apps/web/.env.example` to `.engine/apps/web/.env.local`.
Use the engine's `docs/environment-configuration.md` for the complete settings.
Generate your own session/encryption secrets; never use the owner's keys.

- Root engine: own Meta API key, explicit positive budget/pricing, local database
  and Redis URLs, storage settings, Google OAuth web-client ID/secret and connector
  encryption key. Enable Drive API and register the web callback
  `http://localhost:3000/api/connectors/google-drive/callback`.
- Web: local SaaS database URL, session secret, Brevo SMTP login/key and verified
  sender for email-code login; `BRISKY_ENGINE_URL=http://127.0.0.1:3001`.

Set these engine `.env` values **before starting any application**:

```dotenv
META_ONLY_RUNTIME=true
AI_PROVIDER=meta
EMBEDDING_PROVIDER=meta-local
TRANSCRIPTION_PROVIDER=ai
VOICE_CONVERSATION_MODE=meta-mms
FACE_RECOGNITION_ENABLED=false
FACE_ARCHIVE_WORKER_ENABLED=false
META_MODEL=muse-spark-1.3
META_VIDEO_MODEL=muse-spark-1.2
META_AUDIO_MODEL=muse-spark-1.2
META_VOICE_MODEL=muse-wonder-1.0
ENABLE_CONNECTOR_POLLING=false
```

Retain the example's budget controls and set any Meta fallback lists to supported
Meta model IDs. Incompatible provider/face settings fail startup. Do not enable
legacy Whisper/MiniLM/YuNet/SFace/Gemini paths for judging. Automatic facial
matching is disabled; manual people tagging remains available.

From `.engine`, install the explicitly downloaded local Meta runtimes:

```sh
pnpm setup:mms
pnpm setup:meta-embeddings
pnpm setup:mms --check
pnpm setup:meta-embeddings --check
docker compose up -d postgres redis
pnpm build:api
```

MMS is one English speaker, not a Kore-equivalent voice. Its weights retain
CC-BY-NC 4.0 terms. LASER2 has a retained upstream BSD notice. The original engine
has its own licensing status; this event repository's MIT licence does not
relicense external code or model weights.

## Start the three applications

Start the API first, in `.engine`, so it creates the engine/workspace tables:

```sh
pnpm dev:api
```

Wait until the API logs that it is running. In a second terminal, also in
`.engine`, explicitly initialize the email-code tables before opening the web app:

```sh
pnpm --dir apps/web auth:migrate
pnpm dev:web
```

Engine startup creates the media/workspace schema but does not apply the separate
email-code schema. Omitting `auth:migrate` prevents first-time login.
For local checks that use fake email delivery and temporary database schemas:

```sh
pnpm --dir apps/web auth:check
pnpm --dir apps/web spaces:check
```

Start the worker in a third terminal only when you are ready to process queued
media (this can spend your configured credits):

```sh
pnpm dev:worker
```

Open http://localhost:3000, sign in using your configured email delivery, connect
your own Drive account and select a small folder of media you have permission to
process. Save & sync, observe Factory processing, then search for something in
that media. Worker processing sends supported media to Meta and consumes your
own credits; use the configured size/budget bounds. The standalone sample catalogue
is not loaded into the real app. Private development footage is not distributed.

To enable periodic connector checks after your first bounded test, explicitly set
`ENABLE_CONNECTOR_POLLING=true` in the engine environment and restart the relevant
processes. Stop workers when you do not want queued media processed.

## What has and has not been verified

The pinned engine built successfully; 21 embedding/profile tests and model
checksum checks passed. Its existing 32 development segments were backfilled into
the isolated Meta space. Real exam-quote retrieval passed; kitchen dancing had
moving-video confirmation while overall coverage remained incomplete. This is
not a broad accuracy benchmark.

The complete fresh-machine installation with new Google/Brevo credentials has
not been independently replayed. The bootstrap verifies checkout and required
files, not external account configuration. If you cannot supply those services,
use the root standalone runner, whose limitations are documented in the README.

## Rehearsal results

See [the November 4 rehearsal report](REHEARSAL.md) for checks performed with
a fresh dependency installation and empty database, checks using existing
credentials/media, corrected setup steps and remaining acceptance limits.

The pinned engine includes the [reasoning audit fixes](REASONING-AUDIT.md),
including collection scope, original-constraint verification, current evidence
metadata and broader source-context reasoning. This is not a guarantee of
correct answers for all requests. Generated live checks can be run from `.engine`
with `node --env-file=.env scripts/check-reasoning-live.cjs --live`; those checks
use the configured paid Meta budget and preserve its journal.
