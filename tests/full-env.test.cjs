const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { inspect } = require('../scripts/check-full-env.cjs');
function fixture() {
  const read = name => parseEnv(fs.readFileSync(path.resolve(__dirname, '../config', name), 'utf8'));
  const engine = read('full-engine.env.example'), web = read('web.env.example');
  Object.assign(engine, { META_API_KEY: 'generated-test-key', JWT_SECRET: 'a'.repeat(64), CONNECTOR_ENCRYPTION_KEY: 'b'.repeat(64), GOOGLE_CLIENT_ID: 'generated-client', GOOGLE_CLIENT_SECRET: 'generated-secret' });
  Object.assign(web, { SAAS_AUTH_SECRET: 'c'.repeat(64), BREVO_SMTP_LOGIN: 'generated-login', BREVO_SMTP_KEY: 'generated-smtp', BREVO_SENDER_EMAIL: 'sender@example.test' });
  return { engine, web };
}
test('judge templates accept generated credentials and leave Drive scope explicitly pending', () => {
  const { engine, web } = fixture(), result = inspect(engine, web);
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 2);
});
test('preflight rejects missing credentials, non-Meta paths, missing prices and mismatched Drive scope without exposing values', () => {
  for (const mutate of [
    e => { e.META_API_KEY = ''; },
    e => { e.AI_PROVIDER = 'google'; },
    e => { e.FACE_RECOGNITION_ENABLED = 'true'; },
    e => { e.AI_VIDEO_CHUNK_SECONDS = '301'; },
    e => { e.AI_MODEL_PRICING_JSON = '{}'; },
    e => { e.SAAS_DRIVE_SYNC_ACCOUNT_IDS = '11111111-1111-4111-8111-111111111111'; },
  ]) {
    const { engine, web } = fixture(); mutate(engine);
    const result = inspect(engine, web);
    assert.ok(result.errors.length > 0);
    assert.ok(!JSON.stringify(result).includes('generated-test-key'));
    assert.ok(!JSON.stringify(result).includes('generated-smtp'));
  }
});
test('TTS exception requires its own key, consent flag and speech pricing',()=>{
  const {engine,web}=fixture();engine.VOICE_TTS_PROVIDER='gemini';
  assert.ok(inspect(engine,web).errors.length);
  Object.assign(engine,{ALLOW_NON_META_TTS:'true',GEMINI_VOICE_API_KEY:'generated-google-tts',VOICE_TTS_MODEL:'gemini-3.8-flash-tts'});
  assert.ok(inspect(engine,web).errors.length);
  const pricing=JSON.parse(engine.AI_MODEL_PRICING_JSON);pricing['google-speech/gemini-3.8-flash-tts']={reservationUsd:.25,inputUsdPerMillion:.5,outputUsdPerMillion:9};
  engine.AI_MODEL_PRICING_JSON=JSON.stringify(pricing);
  assert.deepEqual(inspect(engine,web).errors,[]);
  engine.AI_PROVIDER='google';assert.ok(inspect(engine,web).errors.length);
});
