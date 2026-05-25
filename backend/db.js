// SQLite handle + initialisation. Loads schema.sql on first run, applies
// idempotent column migrations for evolving tables, and seeds from seed.js
// if the support_services table is empty.

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.NP_DB_PATH || path.join(__dirname, 'data.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  migrate();

  const serviceCount = db.prepare('SELECT COUNT(*) AS c FROM support_services').get().c;
  if (serviceCount === 0) {
    const { seed } = require('./seed');
    seed(db);
    console.log('[db] seeded fresh database at', DB_PATH);
  }
}

// Apply column additions to existing tables. SQLite's ALTER TABLE supports
// ADD COLUMN safely (no rewrite), and PRAGMA table_info gives us the
// idempotency check we need so this can run on every startup without harm.
// Used to retrofit the agent_reply / key_phrases / distress_* columns onto
// existing databases that pre-date the agentic layer.
function migrate() {
  const additions = {
    checkins: [
      ['agent_reply', 'TEXT'],
      ['key_phrases', 'TEXT'],              // JSON-encoded array of 1-3 strings
      ['distress_detected', 'INTEGER DEFAULT 0'],
      ['distress_urgency', 'TEXT'],         // 'low' | 'medium' | 'high'
    ],
  };

  for (const [table, cols] of Object.entries(additions)) {
    const existing = new Set(
      db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name),
    );
    for (const [name, type] of cols) {
      if (!existing.has(name)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
        console.log(`[db] migrated: added column ${table}.${name}`);
      }
    }
  }
}

module.exports = { db, init };
