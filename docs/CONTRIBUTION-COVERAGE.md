# What is included, and where

The original export was selective, not every event-period file. This follow-up
adds omitted development/review sources and makes the engine adjustments visible.
Do not equate a baseline diff with independent proof of development dates.

| Work | Location / treatment |
| --- | --- |
| Workspace and exported Meta integrations | `apps/web`, `event-components/api`; exact source mapping in `source-manifest.json` |
| Baseten adapter and tests | `development-archive/apps/api/src/modules/pipeline/providers/baseten-ai.provider.*`; retained review code, not selected by the judge runtime |
| Other omitted event setup/evaluation/development tools | `development-archive`, retaining original source paths |
| Edits inside existing engine/configuration files | `engine-adjustments.patch`: zero-context delta against the declared pre-event baseline |
| Complete working engine with those edits applied | External public repository at the exact revision in `full-engine.json`; fetched by `npm run setup:full` |
| Every changed path, including exclusions/removals | `contribution-inventory.json`, with destination or explicit external/excluded treatment |
| New standalone packaging | This repository's own commits, runner, tests and setup documentation |

The review archive includes dormant Gemini/Whisper/face-development alternatives
because the owner requested preserving the event work. **They are not a second
judge setup or an enabled fallback.** Only the documented Meta-only runtime is
used for judging. Archive files may require original engine interfaces, credentials
or private evaluation media and are not individually runnable promises. No weights,
personal footage, `.env` secrets or development usage journal are distributed.

The patch includes removed pre-existing lines needed to understand changes and
redacts values matching local secrets or credential patterns. It is a review
artifact, not a guaranteed applicable installation patch. It
does not claim those lines as event work, relicense the old engine, or form a
standalone application. Do not apply it to `.engine`: that checkout already has
the changes. Old deleted files and moved baseline-identical content are listed,
not reproduced as new contributions. Third-party attribution remains applicable.

To regenerate the inventory against a local original-engine checkout:

```sh
node scripts/export-contribution-inventory.cjs /absolute/path/to/brisky
```

This is a maintainer command, not a judge installation step. It writes review
artifacts in this event repository and requires the baseline Git history.
Publication must still be reviewed for secrets, rights and provenance. The
inventory describes its recorded original-engine commit, not future changes.

Start installation with [FULL-SETUP.md](FULL-SETUP.md). See
[PROVENANCE.md](PROVENANCE.md) for the owner-attested cutoff and limitations.
