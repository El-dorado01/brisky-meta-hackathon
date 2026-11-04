# Third-party software and model attribution

The MIT licence covers this project's newly contributed code, not the original
Brisky product, third-party code or model weights.

- Meta Muse Wonder / Muse Spark / Muse Voice Transcribe are hosted model services
  under Meta's applicable terms. A user's own Meta API key is required.
- `facebook/mms-tts-eng` is Meta MMS, pinned revision
  `c71de0fe7204c83f1c10820a7d696d0b450048ba`. Its weights are CC-BY-NC 4.0,
  not MIT. No weights are committed. Keep their model card/licence on download;
  review rights before commercial use. https://huggingface.co/facebook/mms-tts-eng
- PyTorch and Hugging Face Transformers retain their upstream licences. Their
  installation does not license the MMS weights for commercial use.
- NestJS, ws, React, Next.js, Tailwind, Three.js, xyflow, Framer Motion/Motion,
  Hugeicons, Lucide, Recharts and other dependencies retain their own terms.
  See npm manifests and installed package licence files.
- `apps/web/components/animate-ui` contains integrated Animate UI components.
  These are upstream component integrations, not claimed as original algorithms.
  The upstream licence retrieved November 4 is MIT + Commons Clause, not plain
  MIT. Its complete notice is retained in that directory's LICENSE.md. It permits
  use in an application but restricts redistribution of the components themselves.
  These files are excluded from the project's MIT grant; preserve the upstream
  terms. Source: https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md
- The optional workspace contains no pre-generated Gemini acknowledgement audio
  in this export. The default runner never serves such audio as Meta speech.

Standard build/configuration glue, icons, libraries and platform APIs are not
claimed as event inventions. The new contribution is their documented Brisky
workspace, evidence and voice integration.
