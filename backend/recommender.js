// Scored recommender (ERD §FR5).
// Weights:
//   category match      40%
//   distance / proximity 25%
//   cost (free first)    20%
//   accessibility match  15%
//
// Produces a score in [0, 1] per service, plus a plain-language reason string.

const WEIGHTS = { category: 0.40, distance: 0.25, cost: 0.20, access: 0.15 };

const NEED_TO_CATEGORY = {
  social_connection: 'social',
  food_support:      'food',
  transport_support: 'transport',
  health_navigation: 'health',
  wellbeing_chat:    'wellbeing',
  financial_help:    'financial',
  safety_support:    'safety',
  general_support:   null,
};

const COST_SCORE = {
  'Free':     1.0,
  'Low cost': 0.7,
  'Donation': 0.5,
  'Paid':     0.2,
};

function score(service, params) {
  const { needTypeId, accessibility = [] } = params;
  const wantedCat = NEED_TO_CATEGORY[needTypeId];

  // Category — direct match dominates; soft credit for wellbeing/general as a fallback.
  let catScore = 0;
  if (wantedCat && service.category_id === wantedCat) catScore = 1.0;
  else if (!wantedCat) catScore = 0.5;
  else if (service.category_id === 'wellbeing' || service.category_id === 'general') catScore = 0.3;

  // Distance — linear decay from 1.0 (at-door) to 0 (5+ km).
  const d = Number(service.distance_km) || 0;
  const distScore = Math.max(0, 1 - d / 5);

  // Cost — table lookup.
  const costScore = COST_SCORE[service.cost] ?? 0.4;

  // Accessibility — overlap of resident-required vs service-offered tags.
  let accessScore = 0.5;
  const offered = (service.accessibility || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const required = accessibility.map(s => String(s).trim().toLowerCase()).filter(Boolean);
  if (required.length > 0) {
    const overlap = required.filter(r => offered.includes(r));
    accessScore = Math.min(1, overlap.length / required.length);
  } else if (offered.length > 0) {
    accessScore = 0.6;
  }

  const total =
    catScore  * WEIGHTS.category +
    distScore * WEIGHTS.distance +
    costScore * WEIGHTS.cost +
    accessScore * WEIGHTS.access;

  return { total, parts: { catScore, distScore, costScore, accessScore } };
}

function reasonFor(service, params, parts) {
  const bits = [];
  const wantedCat = NEED_TO_CATEGORY[params.needTypeId];

  if (wantedCat && service.category_id === wantedCat) {
    bits.push('matches what you said you need');
  } else if (parts.catScore >= 0.3) {
    bits.push('a friendly fit for how you are feeling');
  }

  const d = Number(service.distance_km) || 0;
  if (d === 0) bits.push('available by phone');
  else if (d < 1) bits.push(`${Math.round(d * 1000)} m away`);
  else bits.push(`${d.toFixed(1)} km away`);

  if (service.cost === 'Free') bits.push('free');
  else if (service.cost === 'Low cost') bits.push('low cost');

  if (parts.accessScore >= 0.8) bits.push('matches your accessibility needs');

  return bits.length > 0
    ? `This is ${bits.join(', ')}.`
    : 'A reasonable nearby option.';
}

function recommend({ services, needTypeId, accessibility = [], limit = 3 }) {
  const scored = services.map(s => {
    const { total, parts } = score(s, { needTypeId, accessibility });
    return {
      service: s,
      score: total,
      reason: reasonFor(s, { needTypeId, accessibility }, parts),
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

module.exports = { recommend, score, reasonFor, NEED_TO_CATEGORY };
