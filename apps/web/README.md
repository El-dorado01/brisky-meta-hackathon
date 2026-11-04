# Event SaaS workspace source

This is the workspace UI and SaaS integration developed during the event. The
old marketing landing page is excluded. Entry/configuration styles in this
repository are new packaging glue; the event screens/components are preserved.

For the tested standalone path without external Brisky services, follow the
root README (`npm ci`, `npm test`, `npm start`, port 3100). It is a separately
labelled fixture runner, not this complete production workspace.

This Next.js source can be reviewed and type-checked independently after
installing its package dependencies. A full integration requires PostgreSQL,
auth/SMTP configuration and separately provisioned owned-media/engine services.
It is not claimed to work against an empty database with no engine. Read
`../../docs/DEPENDENCIES.md` and the root provenance statement before running
or presenting a development-engine integration as the Meta-only submission.

No original production `.env.local`, credentials, database state or private
media are included. Automatic face inference and non-Meta embeddings are not
part of the tested default runner.
