// Utility helpers for converting GeoJSON coords (lon,lat) to Leaflet [lat, lon] and averaging.

export type Coordinate = [number, number];

/** Convert a single GeoJSON coordinate [lon, lat] (or similar) to [lat, lon]. */
export function toLatLon(coord: number[]): Coordinate {
  if (!Array.isArray(coord) || coord.length < 2 || typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
    return [0, 0];
  }
  return [coord[1], coord[0]];
}

/** Recursively collect numeric coordinate pairs from nested arrays. */
function collectPairs(coords: any, out: number[][] = []): number[][] {
  if (!Array.isArray(coords)) return out;
  // If this is a numeric pair
  if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    out.push([coords[0], coords[1]]);
    return out;
  }
  // Otherwise recurse
  for (const c of coords) {
    collectPairs(c, out);
  }
  return out;
}

/** Convert nested GeoJSON coordinates to the average [lat, lon]. */
export function toLatLonAverage(coords: any): Coordinate {
  try {
    const pairs = collectPairs(coords);
    if (pairs.length === 0) return [0, 0];
    const latlons = pairs.map((p) => toLatLon(p));
    return averageCoordinates(latlons);
  } catch {
    return [0, 0];
  }
}

/** Average an array of [lat, lon] coordinates to a single [lat, lon]. */
export function averageCoordinates(points: Coordinate[]): Coordinate {
  if (!Array.isArray(points) || points.length === 0) return [0, 0];
  let sumLat = 0;
  let sumLon = 0;
  let count = 0;
  for (const p of points) {
    if (!Array.isArray(p) || typeof p[0] !== 'number' || typeof p[1] !== 'number') continue;
    sumLat += p[0];
    sumLon += p[1];
    count++;
  }
  if (count === 0) return [0, 0];
  return [sumLat / count, sumLon / count];
}