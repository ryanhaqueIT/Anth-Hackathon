// SQLite handle + initialisation. Loads schema.sql on first run and seeds
// from seed.js if the support_services table is empty.

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

  const serviceCount = db.prepare('SELECT COUNT(*) AS c FROM support_services').get().c;
  if (serviceCount === 0) {
    const { seed } = require('./seed');
    seed(db);
    console.log('[db] seeded fresh database at', DB_PATH);
  }
}

module.exports = { db, init };
