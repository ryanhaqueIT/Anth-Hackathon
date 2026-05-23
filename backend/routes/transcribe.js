// POST /api/transcribe
// Body: multipart/form-data with field `audio` (a recorded audio blob).
// Returns: { text, language, duration_sec, model }.
//
// Calls the ElevenLabs Speech-to-Text API (scribe_v1) via the official SDK.
// If ELEVENLABS_API_KEY is not configured, returns 503 so the frontend can
// gracefully fall back to its canned-transcript demo path.

const express = require('express');
const multer = require('multer');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

const router = express.Router();

// 25 MB cap: well above anything a browser MediaRecorder session will produce
// for a typical 30s check-in, and far below ElevenLabs' own 3 GB limit.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

let client = null;
function getClient() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new ElevenLabsClient({ apiKey });
  return client;
}

router.post('/', upload.single('audio'), async (req, res, next) => {
  try {
    const el = getClient();
    if (!el) {
      return res.status(503).json({
        error: 'ELEVENLABS_API_KEY is not configured on the server',
        code: 'no_api_key',
      });
    }
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ error: 'audio file is required (multipart field "audio")' });
    }

    const result = await el.speechToText.convert({
      modelId: 'scribe_v1',
      file: {
        data: req.file.buffer,
        filename: req.file.originalname || 'audio.webm',
        contentType: req.file.mimetype || 'audio/webm',
      },
      languageCode: req.body.language_code || 'eng',
      tagAudioEvents: false,
    });

    res.json({
      text: (result.text || '').trim(),
      language: result.languageCode,
      duration_sec: result.audioDurationSecs ?? null,
      model: 'scribe_v1',
    });
  } catch (e) {
    if (e && e.statusCode) {
      return res.status(502).json({
        error: 'ElevenLabs transcription failed',
        upstream_status: e.statusCode,
        detail: e.message,
      });
    }
    next(e);
  }
});

module.exports = router;
