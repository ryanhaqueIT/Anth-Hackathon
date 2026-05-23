const DATASET_ID = "free-and-cheap-support-services-with-opening-hours-public-transport-and-parking-";
const ENDPOINT = `https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets/${DATASET_ID}/records?limit=100`;

export type HelpingOutRow = {
	name: string;
	what: string | null;
	who: string | null;
	address_1: string | null;
	address_2: string | null;
	suburb: string | null;
	phone: string | null;
	free_call: string | null;
	email: string | null;
	website: string | null;
	monday: string | null;
	tuesday: string | null;
	wednesday: string | null;
	thursday: string | null;
	friday: string | null;
	saturday: string | null;
	sunday: string | null;
	cost: string | null;
	tram_routes: string | null;
	bus_routes: string | null;
	nearest_train_station: string | null;
	category_1: string | null;
	category_2: string | null;
	category_3: string | null;
	category_4: string | null;
	category_5: string | null;
	category_6: string | null;
	longitude: number | null;
	latitude: number | null;
};

let cache: { fetchedAt: number; rows: HelpingOutRow[] } | null = null;
const TTL_MS = 1000 * 60 * 60;

export async function loadHelpingOut(): Promise<HelpingOutRow[]> {
	if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.rows;
	const res = await fetch(ENDPOINT);
	if (!res.ok) throw new Error(`Helping Out fetch failed: ${res.status}`);
	const json = (await res.json()) as { results: HelpingOutRow[] };
	cache = { fetchedAt: Date.now(), rows: json.results };
	return json.results;
}

const CARLTON_LAT = -37.7997;
const CARLTON_LON = 144.9669;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371;
	const toRad = (d: number) => (d * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}

export type ServiceMatch = {
	name: string;
	what: string;
	suburb: string;
	address: string;
	phone: string;
	categories: string[];
	hours: Record<string, string>;
	cost: string;
	transport: string;
	website: string | null;
	distance_km: number | null;
};

function shape(row: HelpingOutRow): ServiceMatch {
	const cats = [row.category_1, row.category_2, row.category_3, row.category_4, row.category_5, row.category_6]
		.filter((c): c is string => !!c && c !== "N/A");
	const addressParts = [row.address_1, row.address_2, row.suburb].filter((x): x is string => !!x);
	const transportParts = [
		row.tram_routes ? `tram ${row.tram_routes}` : null,
		row.bus_routes ? `bus ${row.bus_routes}` : null,
		row.nearest_train_station ? `train ${row.nearest_train_station}` : null,
	].filter((x): x is string => !!x);
	const distance = row.latitude != null && row.longitude != null
		? haversineKm(CARLTON_LAT, CARLTON_LON, row.latitude, row.longitude)
		: null;
	return {
		name: row.name,
		what: row.what ?? "",
		suburb: row.suburb ?? "",
		address: addressParts.join(", "),
		phone: row.free_call || row.phone || "",
		categories: cats,
		hours: {
			monday: row.monday ?? "",
			tuesday: row.tuesday ?? "",
			wednesday: row.wednesday ?? "",
			thursday: row.thursday ?? "",
			friday: row.friday ?? "",
			saturday: row.saturday ?? "",
			sunday: row.sunday ?? "",
		},
		cost: row.cost ?? "Free or low-cost",
		transport: transportParts.join(" · "),
		website: row.website,
		distance_km: distance != null ? Number(distance.toFixed(1)) : null,
	};
}

export type SearchArgs = {
	keywords?: string;
	suburb?: string;
	max_distance_km?: number;
	limit?: number;
};

export async function searchServices(args: SearchArgs): Promise<ServiceMatch[]> {
	const rows = await loadHelpingOut();
	const kw = (args.keywords ?? "").toLowerCase().trim();
	const tokens = kw ? kw.split(/\s+/) : [];
	const targetSuburb = args.suburb?.toLowerCase();
	const max = args.max_distance_km ?? Infinity;
	const limit = args.limit ?? 8;

	const scored = rows.map((row) => {
		const shaped = shape(row);
		const hay = `${row.name ?? ""} ${row.what ?? ""} ${shaped.categories.join(" ")} ${row.suburb ?? ""}`.toLowerCase();
		const tokenHits = tokens.filter((t) => hay.includes(t)).length;
		const suburbBoost = targetSuburb && row.suburb?.toLowerCase() === targetSuburb ? 3 : 0;
		const distancePenalty = shaped.distance_km != null ? Math.min(shaped.distance_km, 10) / 10 : 1;
		const score = tokenHits * 2 + suburbBoost - distancePenalty;
		return { shaped, score };
	});

	return scored
		.filter((s) => s.shaped.distance_km == null || s.shaped.distance_km <= max)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((s) => s.shaped);
}
