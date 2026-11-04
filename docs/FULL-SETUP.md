# Full Brisky setup — start here for the real application

This guide runs the same SaaS workspace UI used in the demonstration, with your
own accounts and media. Commands are for a local computer, not a hosted deployment.
The event repository contains new components and reviewable changes; its bootstrap
fetches the declared **pre-existing engine** at a fixed public commit. That engine
is required for real Drive indexing and playback and is not claimed as event work.

The default instructions below use local Meta MMS for speech. The recording can
instead use the explicitly declared [Gemini TTS-only exception](TTS-EXCEPTION.md),
which restores the six speech choices while retaining Meta recognition/reasoning.

If you only want to inspect synthetic observations without these dependencies,
follow the [standalone route](../README.md#run-without-the-original-engine).
That route has a different UI and no real video playback.

## 1. Install the tools

Allow several GB of free disk space and an internet connection. A GPU is not
required. Installation and first model load can take time; no speed guarantee is
implied. Use Node 22 LTS (22.6 or newer within that line) and Python 3.11 or 3.12
for the simplest match to the supported setup.

| Tool | Official download / instructions | Check in a new terminal |
| --- | --- | --- |
| Git | https://git-scm.com/downloads | `git --version` |
| Node.js + npm | https://nodejs.org/en/download | `node --version` and `npm --version` |
| pnpm 10.28.2 | https://pnpm.io/installation | `pnpm --version` |
| Python | https://www.python.org/downloads/ | Windows: `python --version`; macOS/Linux: `python3 --version` |
| Docker Desktop + Compose | https://docs.docker.com/desktop/ | `docker --version` and `docker compose version` |
| Optional FFmpeg/FFprobe installation | https://ffmpeg.org/download.html | `ffmpeg -version` and `ffprobe -version` |

On Windows, enable **Add Python to PATH** in the installer. Open Docker Desktop,
finish its operating-system setup (including WSL 2 if requested), and wait for
its engine to be running. Linux users may use Docker Engine with its Compose
plugin instead. Reopen the terminal after installing tools.

Install the exact package manager if it is not already available:

```sh
npm install --global pnpm@10.28.2
```

If global installation is denied, use the user-level installation method in the
pnpm documentation. FFmpeg binaries are also installed through the project's
Node dependencies as a fallback; a separate installation is useful if your OS
has no compatible bundled binary. Set `FFMPEG_PATH` / `FFPROBE_PATH` to full
executable paths in that case. Do not download Whisper, MiniLM or face models.

If PowerShell says `npm.ps1` or `pnpm.ps1` cannot run because scripts are
disabled, use `npm.cmd` or `pnpm.cmd` in place of `npm` / `pnpm` throughout
this guide, or run the commands in Windows Command Prompt. You do not need to
weaken the machine's execution policy.

## 2. Clone and fetch the pinned application

Open PowerShell on Windows, or Terminal on macOS/Linux. Choose a parent directory
where you want the project, then run:

```sh
git clone https://github.com/El-dorado01/brisky-meta-hackathon.git
cd brisky-meta-hackathon
npm ci
npm run setup:full
npm run setup:full -- --check
cd .engine
pnpm install --frozen-lockfile
pnpm --dir apps/web install --frozen-lockfile
```

`npm ci` installs the event runner's locked packages. `setup:full` downloads the
public engine into `.engine`, at the revision recorded in
[full-engine.json](full-engine.json). The two pnpm commands install the engine /
worker and the separate Next.js workspace packages. They do not start services.
A successful bootstrap check confirms the revision and required files. Do not
apply `engine-adjustments.patch` here: the pinned engine already includes it.

**All following application commands run inside `brisky-meta-hackathon/.engine`**
unless a step explicitly says otherwise. Every new terminal must enter that
folder; it does not inherit the first terminal's working directory.

## 3. Obtain your own service credentials

No developer keys, email account, private footage, or cloud credits are included.
Google Drive OAuth and Brevo are non-model services; inference remains Meta-only.

### Meta Model API — required for answers and media analysis

1. Visit https://dev.meta.ai/ and sign in or register for developer access.
2. Open the API/platform dashboard and create a project/API key using the controls
   available to your account. Access and billing may depend on your account/region.
3. Confirm your account can call `muse-spark-1.3`, `muse-spark-1.2`,
   `muse-wonder-1.0` and, for voice, `muse-voice-transcribe-1.0`.
4. Copy the key into `META_API_KEY` in the engine `.env` only. Keep it private.
5. Check the current model rates and available balance in that dashboard. The
   pricing example below records the rates used for this build, not a promise
   that future prices or account entitlements remain unchanged.

Speech API reference: https://dev.meta.ai/docs/speech-to-text . If model access
is denied, resolve it in your Meta account; a Baseten or Google key is not an
interchangeable credential. A Baseten key is **not needed for this judge setup**.
The event-developed Baseten adapter is retained as review source.

### Brevo — required to receive email login codes

1. Create/sign in to an account at https://app.brevo.com/ .
2. Open **SMTP & API**, then its **SMTP** section. Copy the SMTP login shown
   there. Generate an SMTP key and copy it immediately into your local env file.
3. Open **Senders, Domains & Dedicated IPs**, add a sender, and complete the
   verification instructions sent by Brevo. Domain authentication may also be
   required by your account. Use an email address you control.
4. Put the SMTP login in `BREVO_SMTP_LOGIN`, the **SMTP key** in
   `BREVO_SMTP_KEY`, and the verified address in `BREVO_SENDER_EMAIL` in the
   web env file. An HTTP API key is not the SMTP password.

Official SMTP overview: https://developers.brevo.com/docs/smtp-integration .
Use your own inbox to receive the code; the app does not include a public shared
login or an authentication bypass.

### Google Drive — required for your own media

Google's setup reference is
https://developers.google.com/workspace/drive/api/quickstart/js . Follow the
account/client configuration below; do not copy its separate sample application.

1. Go to https://console.cloud.google.com/ and create or select one project.
2. Open **APIs & Services → Library**, find **Google Drive API**, and enable it.
3. Open **Google Auth Platform → Branding**. Configure the application name,
   support email, and developer contact email. Save.
4. Under **Audience**, choose the audience appropriate to your account. For a
   personal test, use External / Testing and add the exact Google account you
   will connect under **Test users**. Do not publish merely for this local test.
5. Under **Data Access**, configure the read-only Drive scope requested by the
   connector, `https://www.googleapis.com/auth/drive.readonly`. This permits
   reading selected media through the connector. Production verification is a
   separate Google process; testing access is not production approval.
6. Under **Clients**, create an OAuth client of type **Web application**.
7. Add this exact **Authorized redirect URI** and save:
   `http://localhost:3000/api/connectors/google-drive/callback`.
8. Copy its Client ID and Client secret into `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` in the engine `.env`.

This server-side redirect flow does not require an Authorized JavaScript origin.
Do not replace the callback with `/api/v1/...`; the actual SaaS callback is the
one above. Use `localhost` consistently in the browser. If you change the host
or port, update the OAuth callback and app/voice origins together.

## 4. Create the two environment files

Inside `.engine`, Windows PowerShell:

```powershell
Copy-Item ../config/full-engine.env.example .env
Copy-Item ../config/web.env.example apps/web/.env.local
```

macOS/Linux equivalent:

```sh
cp ../config/full-engine.env.example .env
cp ../config/web.env.example apps/web/.env.local
```

These are the dedicated judge templates shipped by the event repository. Use
them rather than the engine's general development examples: they already select
Meta-only speech, embeddings and reasoning and include the operational limits.
They do not contain the developer's credentials or account IDs. Optional Python
and FFmpeg path overrides are commented out so platform detection can work.

Only copy these files on first setup; repeating the commands can overwrite your
filled credentials. Edit with your editor. Root `.env` belongs to the API and
worker. `apps/web/.env.local` belongs to the Next.js SaaS server. Neither file
should be committed or shared. No secret needs a `NEXT_PUBLIC_` prefix.

Generate three separate random values by running this command three times:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use one for `JWT_SECRET`, one for `CONNECTOR_ENCRYPTION_KEY`, and one for
`SAAS_AUTH_SECRET`. Replace the placeholders below; do not use them literally.

### Root `.engine/.env`

Edit the existing entries below; avoid duplicate definitions. The copied judge
template includes these entries plus grouped scene, concurrency, cache, timeout
and storage settings. Keep those template settings for the first run.

```dotenv
PORT=3001
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/brisky
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=REPLACE_WITH_FIRST_RANDOM_VALUE
CONNECTOR_ENCRYPTION_KEY=REPLACE_WITH_SECOND_RANDOM_VALUE

META_API_KEY=REPLACE_WITH_YOUR_META_KEY
META_ONLY_RUNTIME=true
AI_PROVIDER=meta
EMBEDDING_PROVIDER=meta-local
TRANSCRIPTION_PROVIDER=ai
META_MODEL=muse-spark-1.3
META_VIDEO_MODEL=muse-spark-1.2
META_AUDIO_MODEL=muse-spark-1.2
META_VOICE_MODEL=muse-wonder-1.0
META_FALLBACK_MODELS=
META_VIDEO_FALLBACK_MODELS=
META_AUDIO_FALLBACK_MODELS=
FACE_RECOGNITION_ENABLED=false
FACE_ARCHIVE_WORKER_ENABLED=false
SPACE_REPLIES_ENABLED=true

VOICE_ENABLED=true
VOICE_CONVERSATION_MODE=meta-mms
VOICE_LIVE_PUBLIC_URL=ws://localhost:3001/api/v1/saas-engine/voice/live
VOICE_LIVE_APP_ORIGIN=http://localhost:3000
MMS_MODEL_DIR=storage/mms-models/eng
META_EMBEDDING_MODEL_DIR=storage/meta-embeddings

GOOGLE_CLIENT_ID=REPLACE_WITH_YOUR_OAUTH_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_YOUR_OAUTH_CLIENT_SECRET
GOOGLE_SAAS_REDIRECT_URI=http://localhost:3000/api/connectors/google-drive/callback
GOOGLE_REDIRECT_URI=http://localhost:3000/api/connectors/google-drive/callback
ENABLE_CONNECTOR_POLLING=false
RUN_WORKER_IN_API=false
SAAS_DRIVE_SYNC_ENABLED=true
SAAS_DRIVE_SYNC_ACCOUNT_IDS=
INDEX_ALLOWED_CONNECTOR_ACCOUNT_IDS=
INDEX_BUDGET_PLAN_ENABLED=true
INDEX_PLAN_ATTEMPTS_PER_CALL=2
WORKER_FULL_DOWNLOAD_MAX_MB=16384
INDEX_RANGE_MAX_MB=16384

AI_BUDGET_USD=5
AI_USAGE_LEDGER_PATH=./storage/usage/ai-attempts.jsonl
AI_MODEL_PRICING_JSON='{"meta/muse-spark-1.3":{"reservationUsd":0.25,"inputUsdPerMillion":1.25,"outputUsdPerMillion":4.25},"meta/muse-spark-1.2":{"reservationUsd":0.25,"inputUsdPerMillion":1.25,"outputUsdPerMillion":4.25},"meta/muse-wonder-1.0":{"reservationUsd":0.25,"inputUsdPerMillion":4,"outputUsdPerMillion":20},"meta-asr/muse-voice-transcribe-1.0":{"reservationUsd":0.05,"inputUsdPerMillion":0,"outputUsdPerMillion":0}}'
```

This is a new user's **$5 local admission allowance**, not free credits or a
provider-side spending limit. Choose an amount you authorize. The JSON must stay
on one line. ASR's zero token fields are unused placeholders: transcription is
audio-billed (recorded rate $0.18/hour), not free. Reservations can block a large
indexing plan before it starts even when actual usage is smaller. Do not delete
the append-only ledger to bypass limits. Configure provider-side billing controls
as well. Legacy Google/Baseten keys and non-Meta model downloads are unnecessary.

`postgrespassword` is the literal local-only password configured by this project's
Docker Compose file; you do not obtain it from a cloud provider. Both local URLs
must match it. Changing an env URL does not change an existing Docker volume's
PostgreSQL password. Never expose this development database to the internet.

### Web `.engine/apps/web/.env.local`

```dotenv
SAAS_DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/brisky
SAAS_AUTH_SECRET=REPLACE_WITH_THIRD_RANDOM_VALUE
SAAS_APP_ORIGIN=http://localhost:3000
BRISKY_ENGINE_URL=http://127.0.0.1:3001
BREVO_SMTP_LOGIN=REPLACE_WITH_BREVO_SMTP_LOGIN
BREVO_SMTP_KEY=REPLACE_WITH_BREVO_SMTP_KEY
BREVO_SENDER_EMAIL=REPLACE_WITH_VERIFIED_SENDER
BREVO_SENDER_NAME=Brisky
```

The SaaS and engine can share this local database while remaining separate
server processes and env files. Restart the affected processes after env edits.

### Check configuration before starting services

From `.engine`, run the event repository's read-only checker:

```sh
node ../scripts/check-full-env.cjs
```

Alternatively, from the event repository root run `npm run check:full-env`.
It checks required values, secret format, Meta-only selections, pricing entries,
local origins and matching Drive allowlists **without printing secret values**.
Blank Drive account IDs are notes at this stage: fill them after connecting in
step 7, then rerun the checker. Other errors must be fixed before continuing.
This does not test whether Meta/Google/Brevo accept your credentials, whether
models are downloaded, or whether Docker/services are running. Use the model
checks and application checks in the next steps as well.

The web's Brevo SMTP host and port are configured internally; extra
`BREVO_SMTP_SERVER` / `BREVO_SMTP_PORT` env entries are not read by this build.

## 5. Download and verify local Meta models

Run inside `.engine`:

```sh
pnpm setup:mms
pnpm setup:meta-embeddings
pnpm setup:mms --check
pnpm setup:meta-embeddings --check
```

The first command creates `.venv-mms`, installs pinned CPU PyTorch / Transformers,
and downloads pinned `facebook/mms-tts-eng` weights (~145 MB). The second adds
LASER2 dependencies and official Meta weights (~180 MB). Python packages need
additional disk/download space. Setup scripts manage dependencies and checksums;
no manual copying of weights is required. Startup does not download models.

If Windows' `python` points to the Store instead of your install, run
`pnpm setup:mms --python "C:/path/to/python.exe"` with the actual installed path.
On Linux, install your distribution's Python venv package if venv creation fails.
Retry setup after an interrupted transfer; do not skip integrity checks.

Model provenance: https://huggingface.co/facebook/mms-tts-eng and
https://github.com/facebookresearch/LASER . MMS has one English speaker and
CC-BY-NC 4.0 model terms; it is not equivalent to the former Gemini voice.
The event MIT licence does not relicense weights, upstream libraries, or the
separate original engine. Manual tagging is enabled; automatic face matching is
intentionally disabled in this profile.

## 6. Start database and cache

With Docker Desktop running, from `.engine`:

```sh
docker compose up -d postgres redis
docker compose ps
```

Wait for **both** services to be healthy. PostgreSQL runs on 5432 and Redis on
6379; Compose downloads their images on first use. No separate PostgreSQL,
pgvector or Redis installer is needed. The pgvector image supplies the extension.
If the ports are occupied, stop the conflicting local service or deliberately
change the published ports and matching env values.

## 7. Start the three applications in order

Use three terminals, all in `.engine`. Keep them open while testing.

**Terminal 1 — engine API:**

```sh
pnpm build:api
pnpm dev:api
```

Wait for successful startup. Visit
http://localhost:3001/api/v1/health and confirm a healthy response. Startup
initializes the engine/workspace tables. A database error is a blocker: fix it
before continuing.

**Terminal 2 — initialize login schema, then start web:**

```sh
pnpm --dir apps/web auth:migrate
pnpm dev:web
```

The explicit migration initializes the separate email-code tables; API startup
alone does not do that. Wait until Next.js reports ready, then open
http://localhost:3000 . Enter your email, receive a code through your configured
Brevo sender, sign in, and finish onboarding.

**Before starting Terminal 3**, connect Google Drive in Factory's Connectors
manager. Consent using the Google test account configured earlier. Select a
small folder you control, preferably one short video for the first run. Save it.
Sync may report paused until its account allowlist is configured; this is expected.

Find the connected account's ID: open the browser's Developer Tools → Network,
reload Factory, select the request to `/api/connectors`, and inspect its JSON
response. Copy your Drive account object's `id` (a UUID), not its email, folder
ID, Google project ID or OAuth client ID. If needed open
http://localhost:3000/api/connectors in the same signed-in browser and inspect
its response. Do not share the response if it contains private account details.

Set that UUID in **both** `SAAS_DRIVE_SYNC_ACCOUNT_IDS` and
`INDEX_ALLOWED_CONNECTOR_ACCOUNT_IDS` in `.engine/.env`. Stop Terminal 1 with
Ctrl+C and restart `pnpm dev:api` so it reads the change. Return to the connector
manager and use **Save & sync**. Files should now queue.

**Terminal 3 — indexing worker (uses your Meta credits):**

```sh
pnpm dev:worker
```

The worker builds the API code it shares, then consumes queued work. Watch its
logs and Factory progress. Let the video reach indexed status before searching.
A running API/web alone does not process queued files. The former 32 MiB
source-file test cap is removed. Source transfer/download allowances default to
16384 MiB (16 GiB) and remain configurable for local resources. Model request
bodies have separate, smaller limits; this does not mean a 16 GiB video can be
sent in one inference request. Large/long-file end-to-end processing is not
established by short-video checks. Budget and account-scope controls still apply.

The inline Meta adapter now allows **50,000,000 raw bytes per file**, matching
the [documented inline file limit](https://dev.meta.ai/docs/file-handling).
`META_MAX_REQUEST_BYTES=70000000` is a local serialized-body allowance for
base64 expansion plus JSON, not a claim that Meta publishes a 70 MB file limit.
Both settings are present in the judge template. Whole-video understanding now
automatically prepares long or oversized sources as bounded H.264/AAC windows,
normally 90 seconds each (`AI_VIDEO_CHUNK_SECONDS`). Returned times are mapped
back to the original source, and the indexing budget reserves all planned window
calls. Only one prepared window is retained at a time. Encoding is lossy and
cross-window action accuracy is not established. See
[bounded video understanding](BOUNDED-VIDEO.md) for validation and limitations.
Meta's separate Files API route remains unimplemented; the windowing path does
not need it. Raising local env values cannot override provider limits.
Baseten's retained adapter now defaults to its documented 100 MiB media
request-body ceiling, but it is not selected by this judge configuration.

## 8. Try the workflow

1. Search for a distinctive visible event or spoken phrase in your video.
2. Open a cited moment, play it, and confirm the original timestamp range.
3. Ask a follow-up about the same recording. Check that the answer distinguishes
   available evidence from guesses or proposed ideas.
4. Shortlist useful moments, then create a Studio brief or storyline and inspect
   its citations. The generated document is not a rendered edited video.
5. Optionally start Voice Mode, allow microphone access, and use headphones.
   The Meta ASR → Meta dialogue → local MMS path has no on-screen transcript.
6. Optionally tag a person manually from a moment. This does not demonstrate
   automatic face identification; that feature is disabled for judging.

Your library starts empty. Development media and accounts are not distributed.
Nothing here loads the standalone runner's synthetic fixtures into the real app.
For automatic Drive checking later, set `ENABLE_CONNECTOR_POLLING=true` and
restart the API; the worker must remain running to index queued changes. Keep
polling off for a controlled first run.

## 9. Stop and restart safely

Ctrl+C in worker, web and API terminals stops those processes. From `.engine`:

```sh
docker compose stop postgres redis
```

This retains database/cache volumes. Do not use `down -v` unless you intend to
delete local data. Next time start Docker and repeat the service startup steps;
you do not need to overwrite env files, reinstall packages or download models
again. Stopping only the worker pauses consumption; queued work is retained.

## Troubleshooting

| Symptom | Check / action |
| --- | --- |
| `pnpm`, `git`, `python` not found | Install the tool, reopen the terminal, run its version check. |
| Docker cannot connect | Start Docker Desktop and wait for its engine; check `docker compose ps`. |
| Database password/connection error | Check both env URLs, Compose port and existing volume credentials. |
| Login endpoint fails / missing table | Confirm API health, then run `pnpm --dir apps/web auth:migrate`. |
| No email code | Check Brevo SMTP login/key, verified sender, SMTP access/limits and spam folder; inspect web logs without sharing secrets. |
| Google `redirect_uri_mismatch` | Match the exact localhost SaaS callback above in both Google and env; restart API. |
| Google access denied | Confirm Drive API enabled, correct OAuth project and signed-in account listed as test user. |
| Sync paused | Set your actual connected account UUID in both allowlists and restart API; confirm sync enabled. |
| Queued forever | Start Terminal 3; check worker database/Redis and Meta configuration errors. |
| Model not ready | Rerun local setup and `--check`; verify Python executable and model paths. |
| Model access / budget error | Check Meta permissions/balance, exact model IDs, pricing entries and cumulative journal. Increase only your authorized budget; never erase the journal. |
| No microphone / socket failure | Use localhost, allow microphone, verify API port and exact voice origin/socket URL; use HTTPS/WSS for remote hosting. |
| No matching media | Confirm indexing finished and search relates to your own library; inspect failures in Factory. |

## Validation and limits

See [REHEARSAL.md](REHEARSAL.md) for the actual tested setup scope and
[REASONING-AUDIT.md](REASONING-AUDIT.md) for reasoning checks. Empty-database and
installed-dependency checks passed; a fully independent new-account/new-machine
installation and human microphone acceptance are not established by those tests.
No broad accuracy or production-scale performance claim is made.
