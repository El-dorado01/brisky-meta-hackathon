# Recording profile: Meta conversation with Gemini TTS

The owner supplied this organizer clarification on November 4: “The one exception
is text-to-speech, which can be any TTS service if the README says which part is
TTS.” This is owner-supplied correspondence, not an independently authenticated
rule publication. The implementation scopes the exception to speech output.

Start with [FULL-SETUP.md](FULL-SETUP.md). Its default MMS profile requires no
Google model credential. For the actual application's recording voice:

1. Obtain your own Google AI Studio API key at https://aistudio.google.com/api-keys
   and enable the paid model access/billing required by your account. Google Cloud
   promotional credits alone do not establish Gemini prepaid availability.
2. Merge [the TTS override](../config/tts-gemini.env.example) into `.engine/.env`.
   Keep the Meta configuration and `VOICE_CONVERSATION_MODE=meta-mms` unchanged.
3. Fill `GEMINI_VOICE_API_KEY` on the engine server only. Merge both documented
   `google-speech/...` prices into the existing pricing JSON; retain every Meta
   entry, the same cumulative allowance and the same durable journal. Verify
   current account pricing. Never paste the template over the complete env.
4. Restart the API (and any worker sharing its configuration). Settings, saved
   reply speech and Meta voice calls now choose Gemini TTS. Kore is the default;
   a supported preference supplied by the web app can select another voice.
5. To return to local MMS, set `ALLOW_NON_META_TTS=false` and
   `VOICE_TTS_PROVIDER=mms`, then restart the API. No code deletion is required.

The public full engine contains this composition at the pinned revision. It
does not switch the standalone sample runner's speech provider. Model availability,
voice quality, quota and perceived latency must be checked on the actual account;
the TTS exception does not restore Gemini Live's speech-to-speech architecture.
Only generated response text goes to Gemini for speech synthesis. Core model
guards continue rejecting Gemini reasoning, transcription and non-Meta embeddings.

Validation distinguishes offline routing/guard checks from live speech listening.
No claim of organizer eligibility or guaranteed latency follows from unit tests.

The full call relay now forwards Gemini's streamed PCM audio as it arrives, rather
than waiting for a whole sentence WAV. Meta still produces the response text,
which is queued for speech sentence by sentence. Interruption aborts synthesis
and discards stale chunks; partial output is not cached as a complete reply.
This applies to replies, search announcements, status messages and farewells.
The default local MMS route remains available and is unchanged.

One generated-only live Kore sentence yielded first audio in 1,558 ms and
completed in 10,043 ms, with 82 chunks. This is a single TTS-path measurement,
not a microphone-to-answer benchmark. There is no promised near-instant latency.

November 4 acceptance: the authenticated full application reported Meta conversation
mode plus Gemini TTS, and a generated-only Kore settings sample returned a valid
334,436-byte WAV. No microphone recording or personal-media text was used in that
sample. This is not a listening test of all six voices or an end-to-end live call.
