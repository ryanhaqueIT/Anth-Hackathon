// Neighbourhood Pulse — agentic intelligence layer.
//
// Wraps a single Claude API call per check-in that does four things in one
// structured-JSON response:
//   1. Classify the resident's primary need (8 categories — see SCHEMA below).
//   2. Detect distress (low/medium/high urgency + suggested specialist line).
//   3. Extract 1-3 short key phrases that aggregate into the council
//      dashboard's "recurring phrases" panel.
//   4. Compose a warm 1-2 sentence reply that the frontend reads aloud via
//      speechSynthesis.
//
// Architectural choice: a single structured call (not a tool-use loop) is the
// right shape here — the recommender and SQL aggregates downstream are
// deterministic and don't need the agent to orchestrate them. The agent's job
// is the parts that genuinely need nuance: classification of indirect language
// like "I haven't seen my daughter in three weeks", distress detection, and
// natural prose.
//
// Fallback: if ANTHROPIC_API_KEY is not set, classifyAndRespond() throws
// AgentUnavailable. The caller catches and falls back to classifier.js (regex).

const AnthropicModule = require('@anthropic-ai/sdk');
const Anthropic = AnthropicModule.default ?? AnthropicModule;

// Per the claude-api skill defaults: always use claude-opus-4-7 unless the
// user explicitly names another model.
const MODEL = 'claude-opus-4-7';

const SYSTEM_PROMPT = `You are the wellbeing-companion intelligence layer for Neighbourhood Pulse, a community platform for older residents (65+) in inner Melbourne. The primary resident is Margaret, age 78, in Carlton.

From a short message a resident has typed or spoken, do four things and return them as JSON:

1. CLASSIFY the primary NEED into exactly ONE of:
   - social_connection — loneliness, isolation, wanting company, missing people, walking together, sharing a meal
   - food_support — meals, groceries, hunger, food insecurity, cooking for one
   - transport_support — mobility, "can't get there", "the bus is too far", no driving, walking aids
   - health_navigation — doctor, medicine, appointment, pharmacy, GP, hospital
   - wellbeing_chat — low mood, grief, anxiety, feeling heavy, missing someone, needing to be heard
   - financial_help — bills, affordability, pension, "can't afford"
   - safety_support — feeling unsafe, fear, urgency, falls, danger
   - general_support — none of the above clearly apply

   Use the WHOLE message, not surface keywords. For example: "I haven't seen my daughter in three weeks" is wellbeing_chat (grief/missing), not general_support. "The house has been so quiet since Bill passed" is wellbeing_chat. "I'd love to walk with someone again" is social_connection.

2. DETECT DISTRESS — signs of acute hopelessness, suicidal ideation, or immediate safety risk.
   - urgency "low" — mild sadness, lonely but coping, ordinary low day
   - urgency "medium" — persistent low mood, withdrawn, "heavy for a while"
   - urgency "high" — hopelessness, "no point in getting up", danger, suicidal language
   If urgency is "high", set is_distressed: true. Otherwise false.
   Set suggested_specialist to one of "lifeline" (general distress), "beyondblue" (mental health), "griefline" (grief/loss), "respect" (family/safety), or "none" (no specialist needed).

3. EXTRACT 1 to 3 short KEY_PHRASES (3-7 words each) that paraphrase what the resident said. These get aggregated across all residents for the council dashboard's "recurring phrases" panel — paraphrased, k-anonymous (count >= 5 before display).
   Example input: "The house has been so quiet since Bill passed."
   Example phrases: ["house feels quiet since loss", "missing partner"]

4. Compose a WARM_REPLY (1-2 sentences, ~25-40 words total).
   Voice: a kind community visitor, mid-50s, knows the neighbourhood. Direct but warm. Not sycophantic. Not clinical.
   AVOID: "I'm sorry to hear that", "Thank you for sharing", "That must be hard", "I hear you" alone.
   DO: acknowledge what they actually said, mention you'll find a few things nearby, take their time.
   If distress urgency is "high": gently flag you can also connect them with someone trained to listen. No rush, no pressure.

Return ONLY valid JSON matching this schema exactly. No preamble, no markdown fences.

{
  "need_type": "<one of the 8 above>",
  "distress": {
    "is_distressed": <true|false>,
    "urgency": "<low|medium|high>",
    "suggested_specialist": "<lifeline|beyondblue|griefline|respect|none>"
  },
  "key_phrases": ["<phrase 1>", "<phrase 2 optional>", "<phrase 3 optional>"],
  "warm_reply": "<1-2 sentences>"
}`;

class AgentUnavailable extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'AgentUnavailable';
  }
}

function isEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let _client = null;
function getClient() {
  if (!isEnabled()) {
    throw new AgentUnavailable('ANTHROPIC_API_KEY not set');
  }
  if (!_client) {
    _client = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically
  }
  return _client;
}

function extractJson(text) {
  // The model is instructed to return raw JSON, but in case it wraps in
  // markdown fences (```json ... ```), strip them defensively.
  let s = String(text).trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }
  return JSON.parse(s);
}

/**
 * Call Claude to classify the check-in, detect distress, extract key phrases,
 * and compose a warm reply. Returns the structured result.
 *
 * @param {{free_text: string, mood?: string, suburb?: string, age_band?: string}} input
 * @returns {Promise<{
 *   need_type: string,
 *   distress: {is_distressed: boolean, urgency: 'low'|'medium'|'high', suggested_specialist: string},
 *   key_phrases: string[],
 *   warm_reply: string,
 *   _meta: {model: string, input_tokens: number, output_tokens: number, latency_ms: number}
 * }>}
 * @throws {AgentUnavailable} if ANTHROPIC_API_KEY is missing — caller falls back.
 */
async function classifyAndRespond({ free_text, mood, suburb, age_band }) {
  const client = getClient();

  const userMessage =
    `Resident location: ${suburb || 'Carlton'}\n` +
    `Age band: ${age_band || '65+'}\n` +
    `Selected mood (if any): ${mood || 'none'}\n` +
    `Free text the resident said or typed:\n\n"${String(free_text).trim()}"`;

  const t0 = Date.now();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    // effort=low keeps latency under ~3s for classification, which the ERD
    // §NFR3 says should be <2s for check-ins. We trade some reasoning depth
    // for responsiveness; the structured-output discipline keeps quality high.
    output_config: { effort: 'low' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });
  const latency_ms = Date.now() - t0;

  // The model returns a single text block whose content is the JSON object.
  const textBlock = (response.content || []).find((b) => b.type === 'text');
  if (!textBlock) {
    throw new Error('Agent returned no text block');
  }

  let parsed;
  try {
    parsed = extractJson(textBlock.text);
  } catch (e) {
    const sample = String(textBlock.text).slice(0, 240);
    throw new Error(`Agent returned non-JSON text: ${e.message}; sample=${sample}`);
  }

  // Defensive normalisation — guarantee the downstream shape even if the
  // model deviates slightly. The recommender uses need_type as a category
  // lookup key, so an invalid value would silently degrade scoring.
  const VALID_NEEDS = new Set([
    'social_connection', 'food_support', 'transport_support', 'health_navigation',
    'wellbeing_chat', 'financial_help', 'safety_support', 'general_support',
  ]);
  if (!VALID_NEEDS.has(parsed.need_type)) {
    parsed.need_type = 'general_support';
  }
  parsed.distress = parsed.distress || {};
  parsed.distress.is_distressed = Boolean(parsed.distress.is_distressed);
  if (!['low', 'medium', 'high'].includes(parsed.distress.urgency)) {
    parsed.distress.urgency = 'low';
  }
  parsed.distress.suggested_specialist = parsed.distress.suggested_specialist || 'none';
  if (!Array.isArray(parsed.key_phrases)) parsed.key_phrases = [];
  parsed.key_phrases = parsed.key_phrases.slice(0, 3).map((p) => String(p).trim()).filter(Boolean);
  parsed.warm_reply = String(parsed.warm_reply || '').trim();

  parsed._meta = {
    model: MODEL,
    input_tokens: response.usage?.input_tokens ?? 0,
    output_tokens: response.usage?.output_tokens ?? 0,
    latency_ms,
  };

  return parsed;
}

module.exports = { classifyAndRespond, isEnabled, AgentUnavailable };
