// POST /api/checkins
// Body: { suburb, age_band?, mood?, free_text, consent?, input_channel?, accessibility? }
// Side effects: classifies need, persists check-in + recommendations.
// Returns the persisted check-in with 1-3 scored recommendations.

const express = require('express');
const { randomUUID } = require('crypto');
const { db } = require('../db');
const { classify } = require('../classifier');
const { recommend } = require('../recommender');

const router = express.Router();

router.post('/', (req, res, next) => {
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

    const needTypes = db.prepare('SELECT id, keywords FROM need_types').all();
    const needTypeId = classify(free_text, needTypes);

    const checkinId = randomUUID();
    db.prepare(`
      INSERT INTO checkins
        (id, area_id, age_band, mood, free_text, need_type_id, input_channel, consent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      checkinId,
      area.id,
      age_band || null,
      mood || null,
      free_text,
      needTypeId,
      input_channel,
      consent ? 1 : 0,
    );

    // Candidate services: same-area first, top up from other areas if fewer than 3.
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

module.exports = router;
