# Dependencies, private-service declaration and runnable alternative

## Default: independent fixture runner

The root `npm start` path never calls the original Brisky engine. It needs no
SaaS database, Redis, Brevo, Google OAuth account, private footage or credentials
belonging to the owner. The source catalogue is authored synthetic test data.
It contains no actual videos and supplies no playable footage. Session state
is local in-memory state, not the production persisted Space database.

Text replies and Studio documents use **live Meta Model API**, with a judge's
own key. Without a key the fixture catalogue/UI still runs, but model requests
fail explicitly rather than returning a canned result. Optional microphone calls
use the Meta ASR WebSocket, Meta Wonder/Spark text, and local `facebook/mms-tts-eng`.
The original Meta API remains an external hosted dependency, not an owned
private Brisky service; setup and model provenance are public.

This runner does not invoke embedding models, face detectors, face matching,
Whisper, Gemini or Silero. It sends the complete small synthetic catalogue to
Meta, so it is not a benchmark of large-archive retrieval.

## Optional original-product integration source

`apps/web` and most backend extension files under `event-components/api` are
included to expose event work and its boundaries. The original production-like
integration relies on the separately provisioned **pre-existing Brisky engine**.
Its full development backup is at https://github.com/El-dorado01/brisky; current
source availability does not make its pre-event code a judged event contribution.
Hosted instances, user database, Drive access and real user media are separate
and are not supplied with this repository.

The original engine supplies:

- `/api/v1/saas-engine/reply` and Studio generation backed by media retrieval;
- connector OAuth/folder enumeration, indexing queue and Factory status;
- owned media rows, segments, thumbnails and playback;
- people/tagging/face pilot services;
- the authenticated voice relay and speech endpoints in the full integration.

The event SaaS workspace additionally needs PostgreSQL for its new auth/Spaces/
Studio schema, an auth secret, and Brevo SMTP for email-code login. Drive uses
Google OAuth/API as a non-model storage connector. There is no public shared
email account, database, engine API key or OAuth secret in this submission.
The runner above is the documented alternative when these services are absent.

**Do not connect the submission UI to the development engine and assume that
makes it Meta-only.** That development backup intentionally retains MiniLM,
Gemini and YuNet/SFace implementations. The full integration needs a separate
fail-closed Meta-only runtime audit and replacement/disablement of those paths.
This repository's independently tested runtime is the explicit root fixture runner.
Full integration sources are not built by `npm run build` or loaded by `npm start`.

## What is missing from the standalone demo

- Live connector sync/indexing, real footage playback and actual media thumbnails.
- Production retrieval/vector search, automatic face recognition and archive-wide tags.
- Production multi-user persistence, email-code login and the complete SaaS UI runtime.

These boundaries are deliberate and visible in the UI. Do not claim authored
fixture descriptions came from actual Meta video indexing or that model-generated
text independently verifies their truth.

## Model provenance and runtime controls

| Runtime task | Models permitted by the standalone runner |
| --- | --- |
| Text/grounding/Studio | `muse-wonder-1.0`, `muse-spark-1.3`, `muse-spark-1.2` |
| Voice reasoning | Same explicit allowlist in the event relay |
| Live speech recognition | `muse-voice-transcribe-1.0` |
| Local speech synthesis | pinned `facebook/mms-tts-eng` |

The hosted endpoint is fixed to Meta, with redirects disabled and no automatic
non-Meta fallback. Runtime configuration rejects incompatible model selections.
Setup downloads dependencies and the pinned Meta weights; it does not perform
model inference with a third-party model. FFmpeg/OpenCV library use is not, by
itself, model inference. A trained model loaded through a library still counts.

## Full-application integration update

The pinned original engine revision and strict Meta-only setup are now declared in
[FULL-SETUP.md](FULL-SETUP.md) and `full-engine.json`. This supersedes the earlier
backup-only integration warning for that exact configured revision, not arbitrary
engine defaults. The root fixture runner remains different from the actual UI.
LASER2 setup sources are included for event-code review; the original engine is
still an external dependency, never relabelled as new code.
