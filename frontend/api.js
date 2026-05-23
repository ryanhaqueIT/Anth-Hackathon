// Neighbourhood Pulse — frontend API client.
// Loaded BEFORE the component scripts in index.html so that
// components can use window.NPApi.* synchronously.
//
// Every call returns a Promise. Callers that want graceful degradation when
// the backend is offline can use the *OrFallback helpers, which catch errors
// and return the supplied fallback value instead of throwing.

(function () {
  const API_BASE = '/api';

  async function _fetchJson(path, init) {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API ${path} failed: ${res.status} ${body}`);
    }
    return await res.json();
  }

  async function submitCheckin(payload) {
    // payload: { suburb, age_band, mood, free_text, consent?, input_channel? }
    return _fetchJson('/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: true,
        input_channel: 'text',
        ...payload,
      }),
    });
  }

  async function getServices(query = {}) {
    const params = new URLSearchParams();
    if (query.suburb) params.set('suburb', query.suburb);
    if (query.need_type) params.set('need_type', query.need_type);
    const qs = params.toString();
    return _fetchJson(`/services${qs ? `?${qs}` : ''}`);
  }

  async function getDashboard() {
    return _fetchJson('/dashboard/areas');
  }

  async function getHealth() {
    return _fetchJson('/health');
  }

  // Send a recorded audio Blob to /api/transcribe (ElevenLabs scribe_v1 on
  // the server). Returns { text, language, duration_sec, model }. Throws on
  // network failure or non-2xx; callers should catch and degrade gracefully.
  async function transcribeAudio(blob, filename) {
    const fd = new FormData();
    fd.append('audio', blob, filename || 'recording.webm');
    const res = await fetch(`${API_BASE}/transcribe`, { method: 'POST', body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(json.error || `transcribe failed: ${res.status}`);
      err.code = json.code;
      err.status = res.status;
      throw err;
    }
    return json;
  }

  // Graceful-degradation helpers: keep the static prototype usable even if
  // the backend isn't running. Components can pass a fallback (typically the
  // hardcoded SUBURBS/SERVICES arrays already on window) and stay rendering.
  async function getDashboardOrFallback(fallback) {
    try { return await getDashboard(); } catch (e) {
      console.warn('[NPApi] dashboard fetch failed, using fallback:', e.message);
      return fallback;
    }
  }
  async function getServicesOrFallback(query, fallback) {
    try { return await getServices(query); } catch (e) {
      console.warn('[NPApi] services fetch failed, using fallback:', e.message);
      return fallback;
    }
  }

  window.NPApi = {
    submitCheckin,
    getServices,
    getServicesOrFallback,
    getDashboard,
    getDashboardOrFallback,
    getHealth,
    transcribeAudio,
  };
})();
