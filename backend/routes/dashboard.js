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

    const rows = areas.map(area => {
      const totalCheckins = db
        .prepare('SELECT COUNT(*) AS c FROM checkins WHERE area_id = ?')
        .get(area.id).c;

      const serviceCount = db
        .prepare('SELECT COUNT(*) AS c FROM support_services WHERE area_id = ?')
        .get(area.id).c;

      const topNeedRow = db.prepare(`
        SELECT need_type_id, COUNT(*) AS n
          FROM checkins
         WHERE area_id = ?
         GROUP BY need_type_id
         ORDER BY n DESC
         LIMIT 1
      `).get(area.id);

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
        top_need: topNeedRow ? topNeedRow.need_type_id : null,
        isolation_signal_pct: isolationPct,
        mood_distribution: moodCounts.reduce((acc, r) => {
          if (r.mood) acc[r.mood] = r.n;
          return acc;
        }, {}),
        gap_score: Math.round(gap),
        gap_band: bandLabel(gap),
        recommended_action: recommendedAction(gap, topNeedRow ? topNeedRow.need_type_id : null),
      };
    });

    rows.sort((a, b) => b.gap_score - a.gap_score);

    res.json({
      areas: rows,
      meta: {
        total_checkins: rows.reduce((s, r) => s + r.total_checkins, 0),
        total_services: rows.reduce((s, r) => s + r.service_count, 0),
        generated_at: new Date().toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
