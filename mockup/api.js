// Neighbourhood Pulse — frontend API client.
// Loaded BEFORE the component scripts in Neighbourhood Pulse.html so that
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
  };
})();
