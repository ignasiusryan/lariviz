// Client-side reverse geocoding using BigDataCloud (free, no API key, no strict rate limits)
// Caches results by ~11km grid cell

const cache = new Map<string, { city: string | null; country: string | null }>();

function gridKey(lat: number, lng: number): string {
  return `${Math.round(lat * 10) / 10},${Math.round(lng * 10) / 10}`;
}

function extractCity(data: Record<string, unknown>): string | null {
  // Use the top-level city if available
  const city = data.city as string | undefined;

  // Also check administrative levels for province/region (e.g., "Provinsi Bali")
  const adminLevels = (
    (data.localityInfo as Record<string, unknown>)?.administrative as
      Array<{ order: number; name: string; description?: string }> | undefined
  ) || [];

  // Find province level (order 6-7 typically) for context
  const province = adminLevels.find(
    (a) => a.order >= 6 && a.order <= 7 && a.name !== city
  );

  // If city exists and is different from province, use "City, Province" style
  // But only if province is meaningful (not just an island name)
  if (city && province) {
    const provName = province.name.replace(/^Provinsi\s+/i, "");
    // If city and province are the same, just return city
    if (provName.toLowerCase() === city.toLowerCase()) return city;
    return `${city}, ${provName}`;
  }

  if (city) return city;

  // Fallback: use province name
  if (province) return province.name.replace(/^Provinsi\s+/i, "");

  // Last resort: locality
  return (data.locality as string) || null;
}

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city: string | null; country: string | null }> {
  const key = gridKey(lat, lng);
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const city = extractCity(data);
      const country = (data.countryName as string) || null;
      const result = { city, country };
      cache.set(key, result);
      return result;
    }
  } catch {
    // ignore
  }

  const fallback = { city: null, country: null };
  cache.set(key, fallback);
  return fallback;
}

export interface GeoActivity {
  start_latlng?: [number, number] | null;
  location_city?: string | null;
}

/**
 * Reverse-geocode a batch of activities.
 * Deduplicates by ~11km grid, caches results.
 */
export async function geocodeActivities(
  activities: GeoActivity[],
): Promise<Map<string, { city: string | null; country: string | null }>> {
  // Collect unique grid cells that need geocoding
  const toResolve = new Map<string, { lat: number; lng: number }>();
  for (const a of activities) {
    if (!a.start_latlng || a.start_latlng.length !== 2) continue;
    const key = gridKey(a.start_latlng[0], a.start_latlng[1]);
    if (!cache.has(key) && !toResolve.has(key)) {
      toResolve.set(key, { lat: a.start_latlng[0], lng: a.start_latlng[1] });
    }
  }

  // Fetch all in parallel (BigDataCloud has no strict rate limits)
  const entries = [...toResolve.entries()];
  await Promise.all(
    entries.map(([, coord]) => reverseGeocode(coord.lat, coord.lng))
  );

  return cache;
}

/**
 * Look up the cached geocode result for a single activity.
 */
export function getGeocodedLocation(
  activity: GeoActivity
): { city: string | null; country: string | null } | null {
  if (!activity.start_latlng || activity.start_latlng.length !== 2) return null;
  const key = gridKey(activity.start_latlng[0], activity.start_latlng[1]);
  return cache.get(key) || null;
}
