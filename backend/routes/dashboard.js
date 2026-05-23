// GET /api/dashboard/areas
// Aggregated suburb-level insights for the council view. Computed live from
// checkins joined against areas + support_services.

const express = require('express');
const { db } = require('../db');

const router = express.Router();

function bandLabel(gap) {
  if (gap >= 70) return 'High';
  if (gap >= 50) return 'Elevated';
  if (gap >= 30) return 'Watch';
  return 'Low';
}

function recommendedAction(gap, topNeed) {
  if (gap >= 70) {
    if (topNeed === 'social_connection') return 'Promote low-cost social events and volunteer outreach';
    if (topNeed === 'food_support')      return 'Expand free meal programs and volunteer drivers';
    if (topNeed === 'transport_support') return 'Add door-to-door transport for older residents';
    if (topNeed === 'wellbeing_chat')    return 'Bring in additional wellbeing visitor capacity';
    return 'Increase outreach capacity in this area';
  }
  if (gap >= 50) return 'Monitor weekly; promote existing services';
  if (gap >= 30) return 'Maintain current programs; track for trend changes';
  return 'Sufficient coverage; share learnings with higher-gap areas';
}

router.get('/areas', (req, res, next) => {
  try {
    const areas = db.prepare('SELECT * FROM areas').all();
    const needTypes = db.prepare('SELECT id, label FROM need_types').all();
    const needLabelById = Object.fromEntries(needTypes.map(n => [n.id, n.label]));

    const rows = areas.map(area => {
      const totalCheckins = db
        .prepare('SELECT COUNT(*) AS c FROM checkins WHERE area_id = ?')
        .get(area.id).c;

      const serviceCount = db
        .prepare('SELECT COUNT(*) AS c FROM support_services WHERE area_id = ?')
        .get(area.id).c;

      // Full needs breakdown — drives the side-panel "Top needs raised" list.
      const needRows = db.prepare(`
        SELECT need_type_id, COUNT(*) AS n
          FROM checkins
         WHERE area_id = ?
         GROUP BY need_type_id
         ORDER BY n DESC
      `).all(area.id);

      const needsTotal = needRows.reduce((s, r) => s + r.n, 0) || 1;
      const needs = needRows.map(r => ({
        need_type_id: r.need_type_id,
        label: needLabelById[r.need_type_id] || r.need_type_id || 'General support',
        n: r.n,
        pct: Math.round((100 * r.n) / needsTotal),
      }));

      const isolationRow = db.prepare(`
        SELECT COUNT(*) AS n FROM checkins
         WHERE area_id = ?
           AND (mood IN ('concerned','distressed','reflective') OR need_type_id = 'social_connection')
      `).get(area.id);

      const moodCounts = db.prepare(`
        SELECT mood, COUNT(*) AS n
          FROM checkins
         WHERE area_id = ?
         GROUP BY mood
      `).all(area.id);

      const isolationPct = totalCheckins > 0
        ? Math.round((100 * isolationRow.n) / totalCheckins)
        : 0;

      // Gap score = baseline social isolation (pre-existing indicator)
      //           + recent check-in pressure (caps at 40 pts)
      //           - supply bonus (caps at 20 pts)
      const checkinPressure = Math.min(40, totalCheckins * 2);
      const supplyBonus = Math.min(20, serviceCount * 2);
      const gap = Math.max(0, Math.min(100, (area.social_index || 0) + checkinPressure - supplyBonus));

      return {
        id: area.id,
        name: area.name,
        postcode: area.postcode,
        pop_65_pct: area.pop_65_pct,
        total_checkins: totalCheckins,
        service_count: serviceCount,
        top_need: needs[0] ? needs[0].need_type_id : null,
        needs,
        isolation_signal_pct: isolationPct,
        mood_distribution: moodCounts.reduce((acc, r) => {
          if (r.mood) acc[r.mood] = r.n;
          return acc;
        }, {}),
        gap_score: Math.round(gap),
        gap_band: bandLabel(gap),
        recommended_action: recommendedAction(gap, needs[0] ? needs[0].need_type_id : null),
      };
    });

    rows.sort((a, b) => b.gap_score - a.gap_score);

    // ─── City-wide mood pulse ──────────────────────────────────────────────
    // Aggregated count + percentage per mood bucket. Frontend keeps the
    // colour/label/desc by key; we only ship the numbers.
    const moodRows = db.prepare(`
      SELECT mood, COUNT(*) AS n FROM checkins WHERE mood IS NOT NULL GROUP BY mood
    `).all();
    const moodTotal = moodRows.reduce((s, r) => s + r.n, 0) || 1;
    const moodPulse = ['steady', 'reflective', 'concerned', 'distressed'].map((key) => {
      const row = moodRows.find(r => r.mood === key);
      const n = row ? row.n : 0;
      return { key, n, pct: Math.round((100 * n) / moodTotal) };
    });

    // ─── Specialists ───────────────────────────────────────────────────────
    const specialists = db
      .prepare('SELECT id, name, phone, description, handoffs, prev_handoffs FROM specialists ORDER BY handoffs DESC')
      .all()
      .map(s => {
        const diff = (s.handoffs || 0) - (s.prev_handoffs || 0);
        const delta = diff > 0 ? `+${diff} vs prior` : diff < 0 ? `${diff} vs prior` : '0';
        return { ...s, delta };
      });

    // ─── Recurring phrases (k-anonymous) ───────────────────────────────────
    const phrases = db
      .prepare('SELECT id, area_id, text, mood_key, n FROM recurring_phrases ORDER BY n DESC')
      .all();

    res.json({
      areas: rows,
      mood_pulse: moodPulse,
      specialists,
      phrases,
      meta: {
        total_checkins: rows.reduce((s, r) => s + r.total_checkins, 0),
        total_services: rows.reduce((s, r) => s + r.service_count, 0),
        total_handoffs: specialists.reduce((s, r) => s + (r.handoffs || 0), 0),
        generated_at: new Date().toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
