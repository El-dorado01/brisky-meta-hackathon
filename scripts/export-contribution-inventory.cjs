// Review/archive only. Never imported by the submission runtime.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const source = path.resolve(process.argv[2] || '..');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/source-manifest.json')));
const git = (...args) => execFileSync('git', args, { cwd: source, maxBuffer: 64 * 1024 * 1024 });
const head = git('rev-parse', 'HEAD').toString().trim();
const baselineBlobs = new Set(git('ls-tree', '-r', manifest.baseline).toString().split('\n').map(l => l.split(/\s+/)[2]));
const exported = new Map(manifest.files.map(f => [f.sourcePath, f.path]));
const entries = git('diff', '--name-status', '--no-renames', manifest.baseline, head).toString().trim().split('\n').filter(Boolean);
const records = [];
for (const line of entries) {
  const [status, file] = line.split('\t');
  let destination = exported.get(file);
  let disposition = destination ? 'exported integration source' : 'external engine dependency / configuration / pre-existing asset';
  // Include missing newly created review sources, preserving dormant alternatives.
  // Moved pre-event files are detected by baseline blob identity and never rebranded.
  if (!destination && status === 'A' && /^(apps\/api\/src\/|apps\/workers\/|services\/|scripts\/|docs\/)/.test(file)
      && /\.(ts|tsx|js|cjs|mjs|py|json|md|sql|txt)$/.test(file)
      && !/hackathon-evidence\//.test(file)) {
    const blob = git('rev-parse', `${head}:${file}`).toString().trim();
    if (!baselineBlobs.has(blob)) {
      destination = `development-archive/${file}`;
      const bytes = git('show', `${head}:${file}`);
      fs.mkdirSync(path.dirname(path.join(root, destination)), { recursive: true });
      fs.writeFileSync(path.join(root, destination), bytes);
      disposition = 'new event-period review archive; not imported by judge runtime';
    } else disposition = 'pre-existing content moved; excluded';
  }
  records.push({ status, sourcePath: file, destination: destination || null, disposition,
    ...(destination ? { sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, destination))).digest('hex') } : {}) });
}
// Zero-context delta exposes extensions without copying the complete old engine.
let patch = git('diff', '--no-ext-diff', '--no-renames', '--unified=0', '--diff-filter=M', manifest.baseline, head).toString('utf8');
// Existing history may contain development defaults matching current local secrets.
// The artifact is review-only, so redact rather than publish any such values.
for (const name of ['.env', 'apps/web/.env.local']) {
  const local = path.join(source, name);
  if (!fs.existsSync(local)) continue;
  for (const line of fs.readFileSync(local, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (!match || !/(KEY|TOKEN|SECRET|PASSWORD)/.test(match[1])) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2').trim();
    if (value.length >= 16 && !value.startsWith('{')) patch = patch.split(value).join('[REDACTED_LOCAL_VALUE]');
  }
}
patch = patch.replace(/(?:AIza[\w-]{30,}|xsmtpsib-[\w-]{30,}|gh[pousr]_[A-Za-z0-9]{30,})/g, '[REDACTED_CREDENTIAL_PATTERN]');
fs.writeFileSync(path.join(root, 'docs/engine-adjustments.patch'), patch);
fs.writeFileSync(path.join(root, 'docs/contribution-inventory.json'), JSON.stringify({
  baseline: manifest.baseline, sourceCommit: head,
  limitation: 'Comparison plus owner attestation, not independent timing or eligibility proof. Patch includes old removed lines for review and is not a standalone engine. Runtime uses full-engine.json. Dormant non-Meta development sources must not be enabled for judging.',
  modifiedExistingFilesPatch: 'docs/engine-adjustments.patch', records,
}, null, 2) + '\n');
console.log(JSON.stringify({ changedPaths: records.length, archivedOrExported: records.filter(r => r.destination).length, sourceCommit: head }));
