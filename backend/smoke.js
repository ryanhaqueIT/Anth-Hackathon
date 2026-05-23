// Smoke test — exercises every endpoint against a running server.
//
// Usage: in one terminal run `npm start`; in another run `npm run smoke`.
// Override the base URL with NP_BASE if you've moved the port.

const http = require('http');

const BASE = process.env.NP_BASE || 'http://localhost:3000';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': data.length } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(raw); } catch { parsed = raw; }
          resolve({ status: res.statusCode, body: parsed });
        });
      },
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`Smoke test against ${BASE}`);
  console.log('');

  // 1. Health
  const health = await request('GET', '/api/health');
  console.log(`GET  /api/health         => ${health.status}`);
  console.log(`     ${JSON.stringify(health.body)}`);
  if (health.status !== 200) throw new Error('health failed');
  console.log('');

  // 2. Resident check-in
  const checkin = await request('POST', '/api/checkins', {
    suburb: 'Carlton',
    age_band: '65+',
    mood: 'concerned',
    free_text: 'I feel lonely and want something nearby this afternoon',
    consent: true,
  });
  console.log(`POST /api/checkins        => ${checkin.status}`);
  if (checkin.status !== 200) throw new Error(`checkin failed: ${JSON.stringify(checkin.body)}`);
  console.log(`     need_type:           ${checkin.body.need_type}`);
  console.log(`     area:                ${checkin.body.area.name} (${checkin.body.area.postcode})`);
  console.log(`     recommendations:`);
  for (const r of checkin.body.recommendations || []) {
    console.log(`       #${r.position} ${r.service.name}`);
    console.log(`           ${r.service.distance_km} km · ${r.service.cost} · score=${r.score}`);
    console.log(`           reason: ${r.reason}`);
  }
  console.log('');

  // 3. Services list
  const services = await request('GET', '/api/services?suburb=Carlton');
  console.log(`GET  /api/services?suburb=Carlton => ${services.status}, ${services.body.count} services`);
  console.log('');

  // 4. Dashboard
  const dashboard = await request('GET', '/api/dashboard/areas');
  console.log(`GET  /api/dashboard/areas => ${dashboard.status}, ${dashboard.body.areas?.length || 0} areas`);
  if (dashboard.body.areas) {
    const top = dashboard.body.areas.slice(0, 3);
    for (const a of top) {
      console.log(`     ${a.name.padEnd(18)} gap=${a.gap_score.toString().padStart(3)} (${a.gap_band.padEnd(8)}) checkins=${a.total_checkins} top=${a.top_need || '—'}`);
      console.log(`       action: ${a.recommended_action}`);
    }
  }
  console.log('');
  console.log('Smoke test passed.');
}

main().catch((err) => {
  console.error('SMOKE FAILED:', err.message);
  process.exit(1);
});
