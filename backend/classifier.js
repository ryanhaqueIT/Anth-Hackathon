// Rule-based need classifier (ERD §FR3).
// MVP-quality: keyword match across need_types.keywords (pipe-separated).
// Picks the need with the most keyword hits; ties go to whichever appears
// first in the list. Empty / no-match -> 'general_support'.

function classify(freeText, needTypes) {
  if (!freeText || !needTypes || needTypes.length === 0) return 'general_support';

  const text = String(freeText).toLowerCase();
  let bestId = 'general_support';
  let bestScore = 0;

  for (const nt of needTypes) {
    if (!nt.keywords) continue;
    const words = nt.keywords.split('|').map(w => w.trim().toLowerCase()).filter(Boolean);
    let score = 0;
    for (const w of words) {
      if (text.includes(w)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = nt.id;
    }
  }

  return bestId;
}

module.exports = { classify };
