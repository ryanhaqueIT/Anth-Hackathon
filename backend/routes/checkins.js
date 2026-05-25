// POST /api/checkins
// Body: { suburb, age_band?, mood?, free_text, consent?, input_channel?, accessibility? }
//
// Pipeline:
//   1. Validate input and resolve the area.
//   2. AGENTIC layer (Claude) — classify need, detect distress, extract key
//      phrases, compose a warm conversational reply.
//      Falls back to the regex classifier in classifier.js if the agent is
//      unavailable (ANTHROPIC_API_KEY missing) or errors. The fallback path
//      uses a templated warm_reply so the frontend's TTS still has something
//      sensible to speak even without Claude.
//   3. DETERMINISTIC layer — persist the check-in (including the new agent
//      fields), run the scored recommender against the right area, persist
//      the recommendations.
//   4. Respond with the full payload the frontend needs to render recs, speak
//      warm_reply via speechSynthesis, and optionally route to the distress
//      flow when the agent flagged high urgency.

const express = require('express');
const { randomUUID } = require('crypto');
const { db } = require('../db');
const { classify } = require('../classifier');
const { recommend } = require('../recommender');
const agent = require('../agent');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const {
      suburb,
      age_band,
      mood,
      free_text,
      consent = true,
      input_channel = 'text',
      accessibility = [],
    } = req.body || {};

    if (!suburb) {
      return res.status(400).json({ error: 'suburb is required' });
    }
    if (!free_text || String(free_text).trim().length === 0) {
      return res.status(400).json({ error: 'free_text is required' });
    }

    const area = db
      .prepare('SELECT * FROM areas WHERE id = ? OR LOWER(name) = LOWER(?)')
      .get(suburb, suburb);
    if (!area) {
      return res.status(404).json({ error: `unknown suburb: ${suburb}` });
    }

    // ── Agentic classification (Claude) with regex fallback ──────────────
    let agentResult = null;
    let needTypeId = null;
    let warmReply = null;
    let keyPhrases = [];
    let distress = { is_distressed: false, urgency: 'low', suggested_specialist: 'none' };
    let agentSource = 'regex';

    if (agent.isEnabled()) {
      try {
        agentResult = await agent.classifyAndRespond({
          free_text,
          mood,
          suburb: area.name,
          age_band,
        });
        needTypeId = agentResult.need_type;
        warmReply = agentResult.warm_reply;
        keyPhrases = agentResult.key_phrases;
        distress = agentResult.distress;
        agentSource = 'claude';
      } catch (err) {
        console.warn('[agent] failed, falling back to regex classifier:', err.message);
      }
    }

    if (!needTypeId) {
      const needTypes = db.prepare('SELECT id, keywords FROM need_types').all();
      needTypeId = classify(free_text, needTypes);
      warmReply = templateWarmReply(needTypeId);
    }

    // ── Persist check-in (with new agentic fields) ───────────────────────
    const checkinId = randomUUID();
    db.prepare(`
      INSERT INTO checkins
        (id, area_id, age_band, mood, free_text, need_type_id, input_channel, consent,
         agent_reply, key_phrases, distress_detected, distress_urgency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      checkinId,
      area.id,
      age_band || null,
      mood || null,
      free_text,
      needTypeId,
      input_channel,
      consent ? 1 : 0,
      warmReply,
      JSON.stringify(keyPhrases),
      distress.is_distressed ? 1 : 0,
      distress.urgency,
    );

    // ── Recommend services (deterministic; ERD §FR5 weights 40/25/20/15) ─
    let services = db
      .prepare('SELECT * FROM support_services WHERE area_id = ?')
      .all(area.id);
    if (services.length < 3) {
      const more = db
        .prepare('SELECT * FROM support_services WHERE area_id != ?')
        .all(area.id);
      services = services.concat(more);
    }

    const recs = recommend({
      services,
      needTypeId,
      accessibility: Array.isArray(accessibility) ? accessibility : [],
      limit: 3,
    });

    const insertRec = db.prepare(`
      INSERT INTO recommendations (id, checkin_id, service_id, score, reason, position)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    db.transaction(() => {
      recs.forEach((r, i) => {
        insertRec.run(randomUUID(), checkinId, r.service.id, r.score, r.reason, i + 1);
      });
    })();

    res.json({
      checkin_id: checkinId,
      area: { id: area.id, name: area.name, postcode: area.postcode },
      need_type: needTypeId,
      mood: mood || null,
      consent: consent ? 1 : 0,
      warm_reply: warmReply,
      distress,
      key_phrases: keyPhrases,
      agent: {
        source: agentSource,
        meta: agentResult ? agentResult._meta : null,
      },
      recommendations: recs.map((r, i) => ({
        position: i + 1,
        service: {
          id: r.service.id,
          name: r.service.name,
          category: r.service.category_id,
          address: r.service.address,
          distance_km: r.service.distance_km,
          cost: r.service.cost,
          accessibility: r.service.accessibility,
          opening_hours: r.service.opening_hours,
          next_session: r.service.next_session,
          contact: r.service.contact,
          description: r.service.description,
        },
        score: Number(r.score.toFixed(3)),
        reason: r.reason,
      })),
    });
  } catch (e) {
    next(e);
  }
});

// Templated warm reply for the regex-fallback path (when the Claude agent
// isn't available). One line per need type — short and unambiguous so the
// frontend's speechSynthesis still has something to read aloud.
function templateWarmReply(needTypeId) {
  const REPLIES = {
    social_connection: "I'll find a few nearby things where you can be around friendly people — take your time looking.",
    food_support: 'Let me find a few nearby places where you can grab a warm meal or some groceries.',
    transport_support: "I'll look for options that come to you or are easy to reach without the bus.",
    health_navigation: "Let me find some local health services that might help — no rush.",
    wellbeing_chat: "Let me find a few gentle things, including a friendly phone visitor if today feels heavy.",
    financial_help: "I'll see what free or low-cost help is around — there's usually more than people expect.",
    safety_support: "I'll find some safe places nearby. If you're in danger right now, please dial 000.",
    general_support: "Let me see what's happening nearby today — a few small things might catch your eye.",
  };
  return REPLIES[needTypeId] || REPLIES.general_support;
}

module.exports = router;
