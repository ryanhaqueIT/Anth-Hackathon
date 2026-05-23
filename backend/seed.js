// Initial seed for the Neighbourhood Pulse database.
// Runs once on first start (db.js detects an empty support_services table).
//
// Sources:
//   - Suburb list + gap scores: mirrors data.js SUBURBS so the council view
//     reads coherent numbers whether the data comes from the API or the
//     hardcoded fallback.
//   - Service entries s1-s3: lifted from data.js SERVICES (the ones the
//     resident view's reference dataset already names).
//   - Mock check-ins: distributed by area weight so the dashboard has
//     plausible aggregates from the moment the server starts.

const { randomUUID } = require('crypto');

const SERVICE_CATEGORIES = [
  { id: 'social',    label: 'Social' },
  { id: 'food',      label: 'Food' },
  { id: 'transport', label: 'Transport' },
  { id: 'health',    label: 'Health' },
  { id: 'wellbeing', label: 'Wellbeing' },
  { id: 'financial', label: 'Financial' },
  { id: 'safety',    label: 'Safety' },
  { id: 'general',   label: 'General' },
];

const NEED_TYPES = [
  { id: 'social_connection', label: 'Social connection', keywords: 'lonely|loneliness|alone|isolated|friend|chat|company|social|connect|meet|talk' },
  { id: 'food_support',      label: 'Food support',      keywords: 'food|meal|hungry|eat|lunch|dinner|breakfast|cook|grocery|groceries' },
  { id: 'transport_support', label: 'Transport support', keywords: 'transport|bus|tram|train|car|drive|ride|cant get there|too far' },
  { id: 'health_navigation', label: 'Health navigation', keywords: 'health|doctor|gp|medical|medicine|pharmacy|nurse|hospital|appointment|sick|pain|ache' },
  { id: 'wellbeing_chat',    label: 'Wellbeing chat',    keywords: 'feel|mood|sad|down|tired|anxious|worry|listen|wellbeing|grief|loss|missing' },
  { id: 'financial_help',    label: 'Financial help',    keywords: 'money|bill|rent|finance|afford|cost|cheap|free|pension|centrelink' },
  { id: 'safety_support',    label: 'Safety support',    keywords: 'unsafe|danger|scared|fear|fall|accident|emergency|abuse|violence' },
  { id: 'general_support',   label: 'General support',   keywords: '' },
];

// Coordinates are City of Melbourne centroids; pop_65_pct and social_index
// mirror the gap/checkins fields in data.js SUBURBS so the dashboard math
// produces comparable bands.
const AREAS = [
  { id: 'carlton',     name: 'Carlton',         postcode: '3053', centroid_lat: -37.7995, centroid_lon: 144.9670, pop_65_pct: 14.2, social_index: 65 },
  { id: 'nthmelb',     name: 'North Melbourne', postcode: '3051', centroid_lat: -37.8000, centroid_lon: 144.9450, pop_65_pct: 11.8, social_index: 60 },
  { id: 'fitzroy',     name: 'Fitzroy',         postcode: '3065', centroid_lat: -37.7995, centroid_lon: 144.9787, pop_65_pct:  8.4, social_index: 52 },
  { id: 'collingwood', name: 'Collingwood',     postcode: '3066', centroid_lat: -37.8016, centroid_lon: 144.9874, pop_65_pct:  7.9, social_index: 42 },
  { id: 'brunswick',   name: 'Brunswick',       postcode: '3056', centroid_lat: -37.7674, centroid_lon: 144.9603, pop_65_pct: 10.1, social_index: 38 },
  { id: 'richmond',    name: 'Richmond',        postcode: '3121', centroid_lat: -37.8197, centroid_lon: 145.0073, pop_65_pct:  9.5, social_index: 46 },
  { id: 'eastmelb',    name: 'East Melbourne',  postcode: '3002', centroid_lat: -37.8158, centroid_lon: 144.9851, pop_65_pct: 13.4, social_index: 18 },
  { id: 'parkville',   name: 'Parkville',       postcode: '3052', centroid_lat: -37.7843, centroid_lon: 144.9523, pop_65_pct:  6.2, social_index: 14 },
  { id: 'sthyarra',    name: 'South Yarra',     postcode: '3141', centroid_lat: -37.8408, centroid_lon: 144.9931, pop_65_pct:  5.1, social_index: 26 },
  { id: 'docklands',   name: 'Docklands',       postcode: '3008', centroid_lat: -37.8154, centroid_lon: 144.9461, pop_65_pct:  4.8, social_index: 22 },
];

const SUPPORT_SERVICES = [
  // ── Carlton (matches the three resident-app reference services) ──────
  { id: 's1', name: 'Wednesday Community Lunch',       category_id: 'food',      area_id: 'carlton',     address: 'Carlton Library, 667 Rathdowne St', distance_km: 0.9, cost: 'Free',     accessibility: 'wheelchair,phone_support',  opening_hours: 'Wed 12:00-14:00',     next_session: 'Today, 12:30pm',  contact: '(03) 9011 1234',      description: 'Free hot lunch and friendly conversation in the library community room.' },
  { id: 's2', name: 'Walking Group at Princes Park',   category_id: 'social',    area_id: 'carlton',     address: 'Royal Parade entrance',             distance_km: 1.2, cost: 'Free',     accessibility: 'slow_pace,benches',         opening_hours: 'Wed & Fri 10:00',     next_session: 'Wed, 10:00am',    contact: 'walks@example.org',   description: 'Slow gentle pace with regular benches; two regulars are from your street.' },
  { id: 's3', name: 'Friendly Phone Visitor Programme',category_id: 'wellbeing', area_id: 'carlton',     address: 'Phone call to you',                 distance_km: 0.0, cost: 'Free',     accessibility: 'phone_support',             opening_hours: 'Daily 9:00-17:00',    next_session: 'Same-week match', contact: 'visitor@example.org', description: 'Volunteer-matched 20-minute weekly phone calls.' },
  { id: 's4', name: 'Carlton Library Reading Circle',  category_id: 'social',    area_id: 'carlton',     address: 'Carlton Library',                   distance_km: 0.9, cost: 'Free',     accessibility: 'wheelchair,large_print',    opening_hours: 'Tue 14:00-15:30',     next_session: 'Tue, 2:00pm',     contact: 'library@example.org', description: 'Quiet reading and discussion circle for older residents.' },
  { id: 's5', name: 'Meals on Wheels — Carlton',       category_id: 'food',      area_id: 'carlton',     address: 'Delivered to your door',            distance_km: 0.0, cost: 'Low cost', accessibility: 'home_delivery,phone_support', opening_hours: 'Mon-Fri',           next_session: 'Tomorrow',        contact: '(03) 9658 9658',      description: 'Affordable hot meals delivered weekdays.' },

  // ── North Melbourne ──────────────────────────────────────────────────
  { id: 's6', name: 'North Melbourne Community Centre',category_id: 'social',    area_id: 'nthmelb',     address: '60 Errol St',                       distance_km: 0.6, cost: 'Free',     accessibility: 'wheelchair',                 opening_hours: 'Mon-Fri 9:00-17:00',  next_session: 'Today',           contact: '(03) 9329 8865',      description: 'Drop-in social room with tea, board games, and a weekly speaker.' },
  { id: 's7', name: 'Errol St Walking Buddies',        category_id: 'social',    area_id: 'nthmelb',     address: 'Errol St shops',                    distance_km: 0.4, cost: 'Free',     accessibility: 'slow_pace',                  opening_hours: 'Thu 10:00',           next_session: 'Thu, 10:00am',    contact: 'buddies@example.org', description: '30-minute friendly walk-and-chat for older residents.' },

  // ── Fitzroy ──────────────────────────────────────────────────────────
  { id: 's8', name: 'Fitzroy Senior Citizens Centre',  category_id: 'social',    area_id: 'fitzroy',     address: '201 Napier St',                     distance_km: 0.5, cost: 'Free',     accessibility: 'wheelchair,hearing_loop',    opening_hours: 'Mon-Fri 9:00-15:00',  next_session: 'Today',           contact: '(03) 9417 7333',      description: 'Bingo, lunch, and craft sessions for older residents.' },
  { id: 's9', name: 'Fitzroy Community Garden',        category_id: 'wellbeing', area_id: 'fitzroy',     address: 'Atherton Gardens',                  distance_km: 0.7, cost: 'Free',     accessibility: 'wheelchair,seating',         opening_hours: 'Sat 10:00-12:00',     next_session: 'Sat, 10:00am',    contact: 'garden@example.org',  description: 'Volunteer-run gardening and tea morning.' },

  // ── Collingwood ──────────────────────────────────────────────────────
  { id: 's10', name: 'Smith St Wellbeing Drop-in',     category_id: 'wellbeing', area_id: 'collingwood', address: 'Smith St',                          distance_km: 0.3, cost: 'Free',     accessibility: 'phone_support',              opening_hours: 'Tue & Thu 13:00-16:00',next_session: 'Thu, 1:00pm',     contact: 'wellbeing@example.org',description: 'Drop-in wellbeing chat with trained listeners.' },

  // ── Brunswick ────────────────────────────────────────────────────────
  { id: 's11', name: 'Brunswick Library Tech Help',    category_id: 'general',   area_id: 'brunswick',   address: 'Brunswick Library',                 distance_km: 0.8, cost: 'Free',     accessibility: 'wheelchair,one_on_one',      opening_hours: 'Mon 14:00-16:00',     next_session: 'Mon, 2:00pm',     contact: 'tech@example.org',    description: 'One-on-one help with smartphones, MyGov, and email.' },
  { id: 's12', name: 'Brunswick Free Meals Tuesday',   category_id: 'food',      area_id: 'brunswick',   address: 'Sydney Rd Uniting Church',          distance_km: 0.6, cost: 'Free',     accessibility: 'wheelchair,phone_support',   opening_hours: 'Tue 17:00-19:00',     next_session: 'Tue, 5:00pm',     contact: '(03) 9384 1234',      description: 'Free community dinner, all welcome.' },

  // ── Richmond ─────────────────────────────────────────────────────────
  { id: 's13', name: 'Richmond Community Hub',         category_id: 'social',    area_id: 'richmond',    address: '237 Bridge Rd',                     distance_km: 0.5, cost: 'Free',     accessibility: 'wheelchair',                 opening_hours: 'Mon-Fri 10:00-15:00', next_session: 'Today',           contact: '(03) 9428 0188',      description: 'Community room with daily activities and a quiet corner.' },

  // ── East Melbourne ───────────────────────────────────────────────────
  { id: 's14', name: 'Fitzroy Gardens Walking Group',  category_id: 'social',    area_id: 'eastmelb',    address: 'Fitzroy Gardens',                   distance_km: 0.4, cost: 'Free',     accessibility: 'slow_pace,benches',          opening_hours: 'Mon & Wed 9:30',      next_session: 'Mon, 9:30am',     contact: 'walks@example.org',   description: '45-minute gentle walk in the gardens.' },

  // ── Phone-based / 24-7 (anchored to Carlton but reachable from anywhere) ──
  { id: 's_lifeline',   name: 'Lifeline',    category_id: 'safety',    area_id: 'carlton', address: 'Phone', distance_km: 0.0, cost: 'Free', accessibility: 'phone_support,24_7', opening_hours: '24/7', next_session: 'Anytime', contact: '13 11 14',     description: 'Free, anytime, confidential listening line.' },
  { id: 's_beyondblue', name: 'Beyond Blue', category_id: 'wellbeing', area_id: 'carlton', address: 'Phone', distance_km: 0.0, cost: 'Free', accessibility: 'phone_support,24_7', opening_hours: '24/7', next_session: 'Anytime', contact: '1300 22 4636', description: 'Mental-health support phone or web chat, 24/7.' },
];

// Mock check-ins so the council dashboard reads non-empty on first load.
// Counts roughly match data.js gap/checkins ratios.
const MOCK_CHECKINS = [
  // Carlton — high gap, social-connection-dominant
  { area: 'carlton', mood: 'concerned',  need: 'social_connection', text: 'The house has been so quiet since Bill passed.' },
  { area: 'carlton', mood: 'reflective', need: 'social_connection', text: 'I would love to walk with someone again.' },
  { area: 'carlton', mood: 'concerned',  need: 'food_support',      text: 'There is no one to share a meal with most evenings.' },
  { area: 'carlton', mood: 'steady',     need: 'social_connection', text: 'Looking for a friendly group to join.' },
  { area: 'carlton', mood: 'concerned',  need: 'transport_support', text: 'The bus is too far for me to manage now.' },
  { area: 'carlton', mood: 'reflective', need: 'wellbeing_chat',    text: 'Some mornings feel heavy.' },
  // North Melbourne
  { area: 'nthmelb', mood: 'concerned',  need: 'social_connection', text: 'I miss having neighbours to chat with.' },
  { area: 'nthmelb', mood: 'steady',     need: 'food_support',      text: 'Looking for an affordable weekly meal.' },
  { area: 'nthmelb', mood: 'reflective', need: 'wellbeing_chat',    text: 'I feel a bit isolated lately.' },
  { area: 'nthmelb', mood: 'concerned',  need: 'social_connection', text: 'Would love a friendly group nearby.' },
  // Fitzroy
  { area: 'fitzroy', mood: 'reflective', need: 'social_connection', text: 'I would like a quiet group I can pop into.' },
  { area: 'fitzroy', mood: 'steady',     need: 'food_support',      text: 'Where is the closest free community lunch?' },
  { area: 'fitzroy', mood: 'concerned',  need: 'wellbeing_chat',    text: 'Things have been hard since my friend moved.' },
  // Collingwood
  { area: 'collingwood', mood: 'reflective', need: 'social_connection', text: 'Anywhere to meet other people my age?' },
  { area: 'collingwood', mood: 'steady',     need: 'general_support',  text: 'Just looking for what is around.' },
  // Brunswick
  { area: 'brunswick', mood: 'steady',     need: 'social_connection', text: 'Walking groups around here?' },
  { area: 'brunswick', mood: 'concerned',  need: 'food_support',      text: 'Hot dinner once a week would help.' },
  // Richmond
  { area: 'richmond', mood: 'reflective', need: 'social_connection', text: 'I would like to meet some friendly people.' },
  { area: 'richmond', mood: 'steady',     need: 'wellbeing_chat',    text: 'Sometimes I just need to chat.' },
  // East Melbourne (low gap)
  { area: 'eastmelb', mood: 'steady',     need: 'social_connection', text: 'Curious what is on this week.' },
  // Parkville (very low gap)
  { area: 'parkville', mood: 'steady',    need: 'general_support',   text: 'Browsing local options.' },
  // South Yarra
  { area: 'sthyarra', mood: 'steady',     need: 'wellbeing_chat',    text: 'Looking for a friendly check-in service.' },
  // Docklands
  { area: 'docklands', mood: 'reflective',need: 'social_connection', text: 'Where are the older-resident groups around here?' },
];

function seed(db) {
  const insertCat     = db.prepare('INSERT INTO service_categories (id, label) VALUES (?, ?)');
  const insertNeed    = db.prepare('INSERT INTO need_types (id, label, keywords) VALUES (?, ?, ?)');
  const insertArea    = db.prepare('INSERT INTO areas (id, name, postcode, centroid_lat, centroid_lon, pop_65_pct, social_index) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertService = db.prepare(`
    INSERT INTO support_services
      (id, name, category_id, area_id, address, distance_km, cost, accessibility, opening_hours, next_session, contact, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertCheckin = db.prepare(`
    INSERT INTO checkins
      (id, area_id, age_band, mood, free_text, need_type_id, input_channel, consent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const c of SERVICE_CATEGORIES) insertCat.run(c.id, c.label);
    for (const n of NEED_TYPES)         insertNeed.run(n.id, n.label, n.keywords);
    for (const a of AREAS)              insertArea.run(a.id, a.name, a.postcode, a.centroid_lat, a.centroid_lon, a.pop_65_pct, a.social_index);
    for (const s of SUPPORT_SERVICES) {
      insertService.run(s.id, s.name, s.category_id, s.area_id, s.address, s.distance_km, s.cost, s.accessibility, s.opening_hours, s.next_session, s.contact, s.description);
    }
    for (const c of MOCK_CHECKINS) {
      insertCheckin.run(randomUUID(), c.area, '65+', c.mood, c.text, c.need, 'text', 1);
    }
  });
  tx();
}

module.exports = { seed, SERVICE_CATEGORIES, NEED_TYPES, AREAS, SUPPORT_SERVICES, MOCK_CHECKINS };
