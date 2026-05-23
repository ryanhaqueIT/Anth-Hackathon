// Neighbourhood Pulse — Express API server.
// Serves the static frontend at / and the JSON API at /api/*.
// One process, one port, no CORS to wrangle.

const express = require('express');
const path = require('path');
const { init: initDb } = require('./db');

const checkinsRouter = require('./routes/checkins');
const servicesRouter = require('./routes/services');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

initDb();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'neighbourhood-pulse', time: new Date().toISOString() });
});

app.use('/api/checkins', checkinsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/dashboard', dashboardRouter);

// Static frontend — the existing CDN-Babel prototype, served as-is.
const FRONTEND_DIR = path.resolve(__dirname, '..', 'Neighbourhood Pulse_interactive');
app.use(express.static(FRONTEND_DIR));

// Root route serves the HTML scaffold; static middleware above handles the rest.
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'Neighbourhood Pulse.html'));
});

app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, () => {
  console.log(`Neighbourhood Pulse running at http://localhost:${PORT}`);
  console.log(`  Frontend:  http://localhost:${PORT}/`);
  console.log(`  Health:    http://localhost:${PORT}/api/health`);
});
