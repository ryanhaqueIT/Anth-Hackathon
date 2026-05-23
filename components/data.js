// Neighbourhood Pulse — shared sample data

const SUBURBS = [
  // gap = need - supply  -> drives heatmap color (rose=high, sage=low)
  { id: 'carlton',    name: 'Carlton',          gap: 78, checkins: 142, services: 8,  pop65: '14.2%', poly: '40,160 145,140 175,250 90,290 30,250', x: 92,  y: 220 },
  { id: 'nthmelb',    name: 'North Melbourne',  gap: 71, checkins: 118, services: 6,  pop65: '11.8%', poly: '40,160 30,90 130,55 145,140',          x: 86,  y: 110 },
  { id: 'fitzroy',    name: 'Fitzroy',          gap: 64, checkins:  96, services: 9,  pop65: '8.4%',  poly: '145,140 245,110 270,210 175,250',     x: 207, y: 175 },
  { id: 'collingwood',name: 'Collingwood',      gap: 52, checkins:  72, services: 7,  pop65: '7.9%',  poly: '245,110 340,90 360,200 270,210',       x: 304, y: 150 },
  { id: 'brunswick',  name: 'Brunswick',        gap: 46, checkins:  84, services: 12, pop65: '10.1%', poly: '130,55 245,55 245,110 145,140',        x: 192, y:  90 },
  { id: 'richmond',   name: 'Richmond',         gap: 58, checkins:  88, services: 10, pop65: '9.5%',  poly: '270,210 360,200 380,290 290,310',     x: 322, y: 252 },
  { id: 'eastmelb',   name: 'East Melbourne',   gap: 22, checkins:  41, services: 11, pop65: '13.4%', poly: '175,250 270,210 290,310 200,330',     x: 230, y: 280 },
  { id: 'parkville',  name: 'Parkville',        gap: 18, checkins:  28, services:  9, pop65: '6.2%',  poly: '30,90 130,55 145,140 40,160',          x: 86,  y: 110, hidden: true },
  { id: 'sthyarra',   name: 'South Yarra',      gap: 34, checkins:  52, services: 14, pop65: '5.1%',  poly: '290,310 380,290 370,370 270,370',     x: 322, y: 335 },
  { id: 'docklands',  name: 'Docklands',        gap: 28, checkins:  36, services:  7, pop65: '4.8%',  poly: '30,250 90,290 100,360 20,340',         x: 60,  y: 310 },
];

// Color band utility used by both dashboard + detail
function gapColor(gap) {
  if (gap >= 70) return 'var(--rose)';
  if (gap >= 50) return 'var(--clay)';
  if (gap >= 30) return 'var(--gold)';
  return 'var(--sage)';
}
function gapBand(gap) {
  if (gap >= 70) return { label: 'High',    cls: 'high' };
  if (gap >= 50) return { label: 'Elevated',cls: 'med'  };
  if (gap >= 30) return { label: 'Watch',   cls: 'med'  };
  return { label: 'Low', cls: 'low' };
}

const NEEDS_BY_SUBURB = {
  carlton: [
    { need: 'Social connection',  pct: 38, n: 54 },
    { need: 'Food support',       pct: 24, n: 34 },
    { need: 'Transport',          pct: 16, n: 23 },
    { need: 'Wellbeing chat',     pct: 14, n: 20 },
    { need: 'Health navigation',  pct:  8, n: 11 },
  ],
  fitzroy: [
    { need: 'Social connection',  pct: 31, n: 30 },
    { need: 'Wellbeing chat',     pct: 22, n: 21 },
    { need: 'Transport',          pct: 18, n: 17 },
    { need: 'Food support',       pct: 16, n: 16 },
    { need: 'Health navigation',  pct: 13, n: 12 },
  ],
};

const SERVICES = [
  {
    id: 's1',
    title: 'Wednesday Community Lunch',
    tag: 'Social · Food',
    where: 'Carlton Library, 667 Rathdowne St',
    distance: '900m',
    cost: 'Free',
    next: 'Today, 12:30pm',
    accessible: 'Wheelchair access · phone bookings',
    why: "Nearby, free, and matches what you said about wanting something this afternoon.",
    tagClass: 'clay',
  },
  {
    id: 's2',
    title: 'Walking Group at Princes Park',
    tag: 'Social · Movement',
    where: 'Royal Parade entrance',
    distance: '1.2km',
    cost: 'Free',
    next: 'Wed & Fri, 10am',
    accessible: 'Slow pace · benches every 200m',
    why: "Friendly group, gentle pace. Two regulars are also from your street.",
    tagClass: 'sage',
  },
  {
    id: 's3',
    title: 'Friendly Phone Visitor Programme',
    tag: 'Wellbeing',
    where: 'Phone call to you',
    distance: 'At home',
    cost: 'Free',
    next: 'Same-week match',
    accessible: 'Volunteer matched to your interests',
    why: "If today feels heavy, a 20-min chat by phone might be the easiest place to start.",
    tagClass: 'gold',
  },
];

// ─── Sentiment / mood pulse (aggregated, fortnight) ───────────────────
// Distress / concerned signals are automatically routed to a specialist in
// the conversation. Aggregated only — never per resident.
const MOOD_PULSE = [
  { key: 'steady',     label: 'Steady',     pct: 42, n: 276, color: 'var(--sage)',  desc: 'Calm or content language; checking in for connection or activity.' },
  { key: 'reflective', label: 'Reflective', pct: 28, n: 184, color: 'var(--gold)',  desc: 'Thoughtful or quiet language; some loneliness, no acute concern.' },
  { key: 'concerned',  label: 'Concerned',  pct: 22, n: 145, color: 'var(--clay)',  desc: 'Worry, tiredness, isolation expressed — companion follows up gently.' },
  { key: 'distressed', label: 'Distressed', pct:  8, n:  52, color: 'var(--rose)',  desc: 'Alarming or hopeless language — specialist handoff offered in-conversation.' },
];

// Specialist services the companion can route a distressed resident to. These
// are real Australian helplines — referenced by name + phone, not branded UI.
const SPECIALISTS = [
  { id: 'lifeline',   name: 'Lifeline',     phone: '13 11 14',     desc: 'Free, anytime, confidential. They’ll listen — no pressure.',           handoffs: 31, delta: '+8 vs prior' },
  { id: 'beyondblue', name: 'Beyond Blue',  phone: '1300 22 4636', desc: 'Mental-health support, 24/7. Phone or web chat.',                       handoffs: 18, delta: '+3 vs prior' },
  { id: 'griefline',  name: 'Griefline',    phone: '1300 845 745', desc: 'Companion line for grief and loss. Daytime hours, free.',               handoffs:  7, delta: '+2 vs prior' },
  { id: 'respect',    name: '1800RESPECT',  phone: '1800 737 732', desc: 'Confidential support for family, domestic or sexual violence.',         handoffs:  3, delta: '0' },
];

// k-anonymous sample phrases (n≥5 only) for the drill-in. Phrases are paraphrased
// from clusters of similar messages — no individual quote is shown.
const RECENT_PHRASES = [
  { text: '“The house has been so quiet since Bill passed.”',     sent: 'concerned',  n: 12 },
  { text: '“I’d love to walk with someone again.”',                sent: 'reflective', n: 18 },
  { text: '“There’s no one to share a meal with most evenings.”',  sent: 'concerned',  n: 14 },
  { text: '“I don’t see the point of getting up some mornings.”',  sent: 'distressed', n:  6 },
  { text: '“The bus is too far for me to manage now.”',            sent: 'concerned',  n:  9 },
  { text: '“I quite like a cup of tea with the volunteers.”',      sent: 'steady',     n: 21 },
];

// Resident-as-host: a quiet day can be a chance to offer something rather than
// only consume. These are the preset topics, venues and time slots used by
// the Host flow.
const HOST_TOPICS = [
  { id: 'bake',     swatch: 'var(--clay)',                  label: 'Cook or bake',        eg: 'sourdough, scones, polenta cake' },
  { id: 'garden',   swatch: 'var(--sage)',                  label: 'Garden or grow',      eg: 'herbs, seedlings, balcony pots' },
  { id: 'tea',      swatch: 'var(--gold)',                  label: 'Tea & a chat',        eg: 'an hour at the library, just talking' },
  { id: 'walk',     swatch: 'oklch(0.60 0.08 200)',         label: 'Walk together',       eg: 'a gentle loop around Princes Park' },
  { id: 'language', swatch: 'oklch(0.60 0.12 290)',         label: 'Share a language',    eg: 'Italian conversation, beginners welcome' },
  { id: 'music',    swatch: 'oklch(0.62 0.10 340)',         label: 'Music or singing',    eg: 'piano, a small choir, listening together' },
  { id: 'stories',  swatch: 'oklch(0.55 0.05 50)',          label: 'Tell stories',        eg: 'memories, family, the old neighbourhood' },
  { id: 'other',    swatch: 'var(--ink-3)',                 label: 'Something else',      eg: 'tell me in your own words' },
];

const HOST_VENUES = [
  { id: 'home',     label: 'Your kitchen',                desc: 'Small, 2–3 people' },
  { id: 'library',  label: 'Carlton Library · kitchen',   desc: 'Up to 6 · book ahead' },
  { id: 'community',label: 'Drummond St community room',  desc: 'Up to 12 · accessible' },
  { id: 'park',     label: 'Princes Park · picnic spot',  desc: 'Outdoor · fine-weather' },
];

const HOST_TIMES = [
  { id: 'sat', label: 'This Saturday',  detail: '15 Jun · 10:00–12:00' },
  { id: 'tue', label: 'Next Tuesday',   detail: '18 Jun · 14:00–16:00' },
  { id: 'pick',label: 'Help me pick a date', detail: 'I’ll talk you through it' },
];

const HOST_SIZES = [
  { id: 'small', label: '2–3 people',  detail: 'Cosy · easy to host' },
  { id: 'med',   label: '4–6 people',  detail: 'A nice small group' },
  { id: 'open',  label: 'Up to 10',    detail: 'Open to neighbours' },
];

Object.assign(window, { SUBURBS, NEEDS_BY_SUBURB, SERVICES, MOOD_PULSE, SPECIALISTS, RECENT_PHRASES, HOST_TOPICS, HOST_VENUES, HOST_TIMES, HOST_SIZES, gapColor, gapBand });
