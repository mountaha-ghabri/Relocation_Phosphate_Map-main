export type Coordinate = [number, number]; // [lat, lon]

/**
 * Normalize a coordinate array to [lat, lon].
 * Many GIS sources (GeoJSON) use [lon, lat]. This helper will detect and swap
 * when the first number looks like a longitude (> 90 or < -90) and return [lat, lon].
 */
export function toLatLon(coord: number[]): Coordinate {
  if (!coord || coord.length < 2) {
    throw new Error('Invalid coordinate: expected an array with at least 2 numbers');
  }
  const [a, b] = coord;
  // If the first value is outside possible latitude range, assume it's longitude and swap
  if (Math.abs(a) > 90) {
    return [b, a];
  }
  return [a, b];
}

/**
 * Average an array of coordinates. Each coordinate must be [lat, lon].
 * Returns [lat, lon].
 */
export function averageCoordinates(coords: Coordinate[]): Coordinate {
  if (!coords || coords.length === 0) {
    throw new Error('averageCoordinates requires a non-empty array of coordinates');
  }

  let sumLat = 0;
  let sumLon = 0;
  for (const c of coords) {
    if (!Array.isArray(c) || c.length < 2) {
      throw new Error('Each coordinate must be an array [lat, lon]');
    }
    const [lat, lon] = c;
    if (typeof lat !== 'number' || typeof lon !== 'number' || Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new Error('Coordinates must be numeric [lat, lon] pairs');
    }
    sumLat += lat;
    sumLon += lon;
  }

  return [sumLat / coords.length, sumLon / coords.length];
}

/**
 * Convenience: take a GeoJSON coordinate or an array of GeoJSON coordinates and
 * return a single [lat, lon]. If it's a single point (number[]), it will normalize.
 * If it's an array of points (number[][]), it will normalize each and return the average.
 */
export function toLatLonAverage(geoCoords: number[] | number[][]): Coordinate {
  if (!geoCoords) {
    throw new Error('toLatLonAverage received null/undefined coordinates');
  }

  if (Array.isArray(geoCoords) && geoCoords.length > 0 && typeof geoCoords[0] === 'number') {
    // Single coordinate: [lon, lat] or [lat, lon]
    return toLatLon(geoCoords as number[]);
  }

  // Otherwise assume array of coordinates: number[][]
  const arr = geoCoords as number[][];
  const normalized: Coordinate[] = arr.map((c) => toLatLon(c));
  return averageCoordinates(normalized);
}
