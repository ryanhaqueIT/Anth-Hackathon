-- Neighbourhood Pulse — MVP schema
-- Source: ERD.docx §10 (Data Model). Eight tables; foreign keys ON.

CREATE TABLE IF NOT EXISTS areas (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  postcode        TEXT,
  centroid_lat    REAL,
  centroid_lon    REAL,
  pop_65_pct      REAL,         -- e.g. 14.2 = 14.2% of residents aged 65+
  social_index    REAL          -- normalised social-isolation indicator (0-100)
);

CREATE TABLE IF NOT EXISTS service_categories (
  id              TEXT PRIMARY KEY,
  label           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_services (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category_id     TEXT NOT NULL REFERENCES service_categories(id),
  area_id         TEXT NOT NULL REFERENCES areas(id),
  address         TEXT,
  distance_km     REAL,         -- representative walking distance from the area centroid
  cost            TEXT,         -- "Free" | "Low cost" | "Donation" | "Paid"
  accessibility   TEXT,         -- comma-separated tags: "wheelchair,phone_support,slow_pace"
  opening_hours   TEXT,
  next_session    TEXT,         -- human-readable: "Today, 12:30pm"
  contact         TEXT,
  description     TEXT
);

CREATE TABLE IF NOT EXISTS need_types (
  id              TEXT PRIMARY KEY,
  label           TEXT NOT NULL,
  keywords        TEXT          -- pipe-separated trigger words for rule-based classifier
);

CREATE TABLE IF NOT EXISTS residents (
  id              TEXT PRIMARY KEY,
  age_band        TEXT,
  area_id         TEXT REFERENCES areas(id),
  preferred_language TEXT,
  mobility_needs  TEXT,
  accessibility_needs TEXT,
  consent_for_aggregation INTEGER DEFAULT 1,  -- 1 = consented, 0 = no
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS checkins (
  id              TEXT PRIMARY KEY,
  resident_id     TEXT REFERENCES residents(id),
  area_id         TEXT NOT NULL REFERENCES areas(id),
  age_band        TEXT,
  mood            TEXT,         -- "steady" | "reflective" | "concerned" | "distressed" | raw
  free_text       TEXT,
  need_type_id    TEXT REFERENCES need_types(id),
  input_channel   TEXT,         -- "text" | "voice"
  consent         INTEGER DEFAULT 1,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_checkins_area  ON checkins(area_id);
CREATE INDEX IF NOT EXISTS idx_checkins_need  ON checkins(need_type_id);
CREATE INDEX IF NOT EXISTS idx_checkins_time  ON checkins(created_at);

CREATE TABLE IF NOT EXISTS recommendations (
  id              TEXT PRIMARY KEY,
  checkin_id      TEXT NOT NULL REFERENCES checkins(id),
  service_id      TEXT NOT NULL REFERENCES support_services(id),
  score           REAL,
  reason          TEXT,
  position        INTEGER,      -- 1, 2, 3 — display rank
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_recs_checkin ON recommendations(checkin_id);

-- Materialised aggregated view, refreshed when the dashboard is fetched.
CREATE TABLE IF NOT EXISTS area_insights (
  area_id              TEXT PRIMARY KEY REFERENCES areas(id),
  total_checkins       INTEGER DEFAULT 0,
  top_need_type_id     TEXT REFERENCES need_types(id),
  isolation_signal_pct REAL DEFAULT 0,
  service_count        INTEGER DEFAULT 0,
  gap_score            REAL DEFAULT 0,
  recommended_action   TEXT,
  refreshed_at         TEXT DEFAULT (datetime('now'))
);

-- Specialist helplines surfaced when distressed language is detected.
-- Handoff counts feed the council dashboard's referral panel.
CREATE TABLE IF NOT EXISTS specialists (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  phone           TEXT,
  description     TEXT,
  handoffs        INTEGER DEFAULT 0,
  prev_handoffs   INTEGER DEFAULT 0
);

-- k-anonymous paraphrased phrase clusters surfaced on the suburb drill-in.
-- area_id NULL = city-wide; mood_key matches the four mood pulse buckets.
CREATE TABLE IF NOT EXISTS recurring_phrases (
  id              TEXT PRIMARY KEY,
  area_id         TEXT REFERENCES areas(id),
  text            TEXT NOT NULL,
  mood_key        TEXT NOT NULL,
  n               INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_phrases_area ON recurring_phrases(area_id);
