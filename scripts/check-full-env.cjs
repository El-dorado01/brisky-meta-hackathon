// Read-only local preflight. Does not print values, contact services or spend credits.
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
function inspect(engine, web) {
  const errors = [], warnings = [];
  const required = (env, keys) => keys.forEach(key => {
    if (!env[key]?.trim() || /REPLACE_WITH|YOUR_.*KEY/.test(env[key])) errors.push(`${key}: fill in your own value`);
  });
  required(engine, ['META_API_KEY', 'JWT_SECRET', 'CONNECTOR_ENCRYPTION_KEY', 'DATABASE_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']);
  required(web, ['SAAS_DATABASE_URL', 'SAAS_AUTH_SECRET', 'BREVO_SMTP_LOGIN', 'BREVO_SMTP_KEY', 'BREVO_SENDER_EMAIL']);
  const exact = {
    META_ONLY_RUNTIME: 'true', AI_PROVIDER: 'meta', EMBEDDING_PROVIDER: 'meta-local', TRANSCRIPTION_PROVIDER: 'ai',
    VOICE_CONVERSATION_MODE: 'meta-mms', VOICE_ENABLED: 'true', SPACE_REPLIES_ENABLED: 'true',
    FACE_RECOGNITION_ENABLED: 'false', FACE_ARCHIVE_WORKER_ENABLED: 'false', RUN_WORKER_IN_API: 'false',
    PORT: '3001', INDEX_BUDGET_PLAN_ENABLED: 'true', SAAS_DRIVE_SYNC_ENABLED: 'true',
    GOOGLE_SAAS_REDIRECT_URI: 'http://localhost:3000/api/connectors/google-drive/callback',
    VOICE_LIVE_APP_ORIGIN: 'http://localhost:3000', VOICE_LIVE_PUBLIC_URL: 'ws://localhost:3001/api/v1/saas-engine/voice/live',
  };
  for (const [key, value] of Object.entries(exact)) if (engine[key] !== value) errors.push(`${key}: does not match the documented local judge profile`);
  for (const [key, value] of Object.entries({ SAAS_APP_ORIGIN: 'http://localhost:3000', BRISKY_ENGINE_URL: 'http://127.0.0.1:3001' }))
    if (web[key] !== value) errors.push(`${key}: does not match the documented local judge profile`);
  for (const [key, env] of [['JWT_SECRET', engine], ['SAAS_AUTH_SECRET', web]]) if ((env[key] || '').length < 32) errors.push(`${key}: use at least 32 random characters`);
  if (!/^[a-fA-F0-9]{64}$/.test(engine.CONNECTOR_ENCRYPTION_KEY || '')) errors.push('CONNECTOR_ENCRYPTION_KEY: use 64 hexadecimal characters');
  const secrets = [engine.JWT_SECRET, engine.CONNECTOR_ENCRYPTION_KEY, web.SAAS_AUTH_SECRET];
  if (secrets.filter(Boolean).length === 3 && new Set(secrets).size !== 3) errors.push('Generate three different application secrets');
  for (const [key, env] of [['DATABASE_URL', engine], ['SAAS_DATABASE_URL', web]]) {
    try { if (!['postgres:', 'postgresql:'].includes(new URL(env[key]).protocol)) throw Error(); }
    catch { errors.push(`${key}: invalid PostgreSQL URL`); }
  }
  if (engine.DATABASE_URL !== web.SAAS_DATABASE_URL) warnings.push('Database URLs differ; this guide assumes the same local database for both servers');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(web.BREVO_SENDER_EMAIL || '')) errors.push('BREVO_SENDER_EMAIL: enter your verified email address');
  const allowed = new Set(['muse-spark-1.1', 'muse-spark-1.2', 'muse-spark-1.3', 'muse-wonder-1.0']);
  const models = ['META_MODEL', 'META_VIDEO_MODEL', 'META_AUDIO_MODEL', 'META_VOICE_MODEL'].map(key => {
    if (!allowed.has(engine[key])) errors.push(`${key}: unsupported or missing Meta model`);
    return engine[key];
  });
  for (const key of ['META_FALLBACK_MODELS', 'META_VIDEO_FALLBACK_MODELS', 'META_AUDIO_FALLBACK_MODELS'])
    for (const model of (engine[key] || '').split(',').map(s => s.trim()).filter(Boolean)) {
      if (!allowed.has(model)) errors.push(`${key}: unsupported fallback`);
      models.push(model);
    }
  if (!(Number(engine.AI_BUDGET_USD) > 0)) errors.push('AI_BUDGET_USD: authorize a positive local allowance');
  if (!engine.AI_USAGE_LEDGER_PATH) errors.push('AI_USAGE_LEDGER_PATH: set a durable shared journal path');
  try {
    const pricing = JSON.parse(engine.AI_MODEL_PRICING_JSON);
    for (const name of [...new Set(models.map(m => `meta/${m}`)), 'meta-asr/muse-voice-transcribe-1.0']) {
      const row = pricing[name];
      if (!row || !(row.reservationUsd > 0) || !Number.isFinite(row.inputUsdPerMillion) || row.inputUsdPerMillion < 0 || !Number.isFinite(row.outputUsdPerMillion) || row.outputUsdPerMillion < 0)
        errors.push('AI_MODEL_PRICING_JSON: missing or invalid entry for a configured model');
    }
  } catch { errors.push('AI_MODEL_PRICING_JSON: invalid JSON'); }
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const scopes = ['SAAS_DRIVE_SYNC_ACCOUNT_IDS', 'INDEX_ALLOWED_CONNECTOR_ACCOUNT_IDS'].map(key => {
    const ids = (engine[key] || '').split(/[,\s]+/).filter(Boolean);
    if (!ids.length) warnings.push(`${key}: set your connected account UUID after linking Drive; indexing stays scoped off until then`);
    if (ids.some(id => !uuid.test(id))) errors.push(`${key}: use connected account UUIDs`);
    return ids.sort().join(',');
  });
  if (scopes[0] !== scopes[1]) errors.push('The two Drive account allowlists must match for this guide');
  if (engine.ENABLE_CONNECTOR_POLLING !== 'false') warnings.push('Automatic polling is enabled; use false for your first bounded run');
  return { errors: [...new Set(errors)], warnings };
}
if (require.main === module) {
  const root = path.resolve(__dirname, '../.engine');
  const read = file => {
    if (!fs.existsSync(file)) throw Error('Missing env file; copy the judge templates as described in FULL-SETUP.md');
    return parseEnv(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  };
  try {
    const result = inspect(read(path.join(root, '.env')), read(path.join(root, 'apps/web/.env.local')));
    result.errors.forEach(s => console.error('ERROR: ' + s));
    result.warnings.forEach(s => console.warn('NOTE: ' + s));
    if (result.errors.length) process.exitCode = 1;
    else console.log('Local judge env checks passed. No secrets displayed, services contacted or credits spent. This does not verify credential validity, account access, model files or running services.');
  } catch { console.error('Cannot read/parse judge env files. Follow docs/FULL-SETUP.md; no values were displayed.'); process.exitCode = 1; }
}
module.exports = { inspect };
