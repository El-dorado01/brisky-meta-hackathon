# Brisky — Meta hackathon event component

## Hackathon team: solo entry

**Sole hackathon participant: [El-dorado01](https://github.com/El-dorado01), the
project owner.** The owner confirms that this hackathon entry had no additional
human participant or collaborator. The contributor credited in the original
Brisky engine repository worked on that pre-existing project and **did not
participate in or assist with this hackathon**.

The original repository's GitHub contributors are historical project contributors,
not this entry's team roster. Their existing attribution is preserved. Only the
identified event-developed contributions are presented for judging; the original
engine is an explicitly declared dependency. See [provenance](docs/PROVENANCE.md).
This is an owner-confirmed team statement, not a claim that all engine or
third-party code was authored by the entrant.

**TTS exception / recorded demo:** The owner supplied a November 4 organizer
clarification allowing any text-to-speech service when disclosed here. The actual
Brisky recording profile uses **Gemini Flash TTS (Kore)** only to speak response
text; its quota fallback is Gemini Flash-Lite TTS. Meta still performs microphone
transcription (Muse Voice Transcribe), dialogue (Wonder), search/media reasoning
(Spark) and local embeddings (LASER2). This is **not Gemini Live**. The all-Meta
MMS option and standalone runner remain available. To reproduce the recording
profile, follow [the TTS-only setup](docs/TTS-EXCEPTION.md); a Google speech key
and speech pricing entries are needed. These models do not receive microphone
audio or perform search in that profile.

Brisky helps people find moments in their media and turn cited observations into
useful conversations, shortlists, briefs and storylines. This fresh repository
contains the **event-developed workspace and integration components**, plus a
standalone runner that works without the pre-existing Brisky engine.

**Start here:** [beginner-friendly full setup](docs/FULL-SETUP.md), including
tool installation, obtaining keys, model downloads and each startup terminal.
For the source audit, read [contribution coverage](docs/CONTRIBUTION-COVERAGE.md):
it maps exported components, retained development alternatives and patches to
pre-existing engine files without claiming the old engine as new work.
The guide uses dedicated [engine](config/full-engine.env.example) and
[web](config/web.env.example) env templates. `npm run check:full-env` checks
your filled `.engine` configuration without displaying secrets or calling APIs.

Recording the actual application? Use the [demo speaking script](docs/DEMO-SCRIPT.md):
login → indexing → voice → text → manual tagging → Studio, with optional settings.

**The original Brisky engine predates the event and is not submitted as new work.**
This repository does not contain its indexing engine, old dashboard or landing
page. Read [provenance](docs/PROVENANCE.md) and
[external dependencies and limitations](docs/DEPENDENCIES.md) before judging.

## Run the actual Brisky UI and media workflow

### Which Meta model does what?

These are the configured roles in the pinned full application's judge profile:

| Meta model | Role in Brisky |
| --- | --- |
| Muse Spark 1.3 (`muse-spark-1.3`) | Text reasoning: interpreting searches, grounded written answers, evidence-sensitive conversation and Studio briefs/storylines. |
| Muse Spark 1.2 (`muse-spark-1.2`) | Video/audio understanding: indexed media descriptions, audio transcription during indexing, and inspection of candidate moments against a search request. |
| Muse Wonder (`muse-wonder-1.0`) | Voice conversation coordination and natural response text, including requesting searches and reporting their results. It does not synthesize the audio. |
| Muse Voice Transcribe (`muse-voice-transcribe-1.0`) | Streaming speech recognition for microphone input during a voice call. |
| Meta MMS (`facebook/mms-tts-eng`, local CPU) | Turns response text into spoken English audio. One English speaker; not a Gemini Live equivalent. |
| Meta LASER2 (local CPU) | Creates text embeddings for indexed descriptions/transcripts and search queries, supporting semantic retrieval. |

The standalone sample uses Wonder for its text/Studio responses, and optionally
Muse Voice Transcribe + Wonder + MMS for voice. It supplies synthetic observations
directly and does not run video indexing or LASER retrieval. The full application
requires the original engine as explained below. Model assignments are configuration,
not evidence of comparative accuracy; see the rehearsal and reasoning reports.

FFmpeg and OpenCV are media-processing libraries, not inference models. Automatic
face recognition is disabled in the judge profile; manual people tagging remains.
Dormant Gemini, Whisper, MiniLM and YuNet/SFace development paths are not enabled
fallbacks. See [full setup](docs/FULL-SETUP.md) for exact configuration and downloads.

Use [full application setup](docs/FULL-SETUP.md). `npm run setup:full` downloads
the separately declared original engine at a pinned Meta-only-compatible revision.
This is required for real Drive indexing, media search and playback. The sample
runner below has a different, simplified UI and cannot reproduce that full flow.

## Run without the original engine

Requires Node 22.6+ and npm. No Docker, PostgreSQL, Brevo account, Google Drive,
private service or model download is needed to start the fixture runner.

```sh
npm ci
npm test
npm run audit
```

Copy `.env.example` to `.env` (`Copy-Item .env.example .env` in PowerShell,
`cp .env.example .env` on macOS/Linux). Add your own `META_API_KEY` to `.env` for
live model responses. The key stays server-side. Set a positive budget and retain
the explicit pricing entries. Start:

```sh
npm start
```

Open **http://localhost:3100**. With no key, source observations are browsable and
model requests return a clear configuration error; no responses are faked.

The three fixture observations are authored synthetic test data, **not videos,
actual indexing results, the owner's Drive or footage playback**. All chat and
Studio outputs require live Meta inference. The runner deliberately omits vector
embeddings and automatic face recognition; no non-Meta substitute is used.
It supplies the small complete fixture catalogue to Meta, rather than claiming
to reproduce production-scale retrieval.

### A repeatable demo

1. Ask “Find the kitchen dancing moment.” Inspect its cited synthetic range.
2. Ask whether the observations prove a private identity or family relationship.
   Check that Brisky abstains instead of inventing one.
3. Say thanks; it should not save another media exchange merely for conversation.
4. Select one or more source observations and create a brief or storyline.
5. Inspect the output's evidence references and distinction between observations
   and suggestions. Check an unsupported claim rather than assuming success.

Session state is held in memory and clears on server restart. This is a local
evaluation runner, not a hosted multi-user service or a production auth system.

## Optional voice, still without the original engine

Requires Python 3.11–3.14, disk space for CPU PyTorch and MMS, and a Meta key.

```sh
npm run setup:mms
npm run setup:mms -- --check
```

Set `DEMO_VOICE_ENABLED=true` in `.env`, restart, and use **Start voice call**.
This uses Muse Voice Transcribe → Muse Wonder → resident `facebook/mms-tts-eng`.
The event-developed browser audio client and relay support continuous capture
and interrupted playback; dispatched media requests can complete independently.
No transcript is displayed in the call. Results use the same synthetic catalogue.
MMS has one English speaker and is not equivalent to Gemini Live in quality or
latency. Setup explicitly downloads pinned Meta weights; startup never downloads.
MMS weights are **CC-BY-NC 4.0**, separate from this repository's MIT code licence.

Voice has a five-minute session bound. Model calls use an append-only local
admission ledger under `storage/usage`; holds are not provider invoices. Stop
and reconcile the provider dashboard rather than deleting the ledger to reset it.

## Repository layout

- `apps/demo`: new standalone integration scaffold and synthetic fixtures.
- `apps/web`: event-developed Next.js SaaS workspace source for review/integration.
- `event-components/api`: event-period backend adapters, orchestration, contracts
  and tests. Most integrate with the original engine's interfaces; only the
  explicit subset in `scripts/build-demo.cjs` is built by the standalone runner.
- `services/mms-tts`: pinned offline local Meta speech setup/runtime.
- `brisky-alien-mascot`: event-developed mascot source and assets.
- `docs/source-manifest.json`: exported paths, hashes, comparison baseline and
  source backup commit. See its limitations; hashes do not independently date work.

The full workspace's authentication, Drive/Factory, saved Spaces, people and
playback integration needs separately provisioned services described in
[DEPENDENCIES.md](docs/DEPENDENCIES.md). The root standalone runner is the
documented way to run without them. It is not a claim that every optional
integration source is independently executable or Meta-only when connected to
an arbitrary third-party engine.

The development repository retains Gemini and other post-event alternatives.
They are not used by this runner. The active local submission voice model is
Wonder; video-model/embedding/face migrations in the full development product
must be audited separately before presenting that product as Meta-only.

## Licence and attribution

New project code is MIT licensed. Third-party libraries and Meta weights retain
their licences; see [THIRD_PARTY.md](THIRD_PARTY.md). The public backup of the
pre-existing product is not relicensed by this repository's licence.
