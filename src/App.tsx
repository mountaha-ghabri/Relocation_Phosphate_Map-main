import React from 'react';
import PhosphateMap from './components/PhosphateMap';
import { tunisiaGeoJSON } from './data/tunisiaGeoJSON';
import { infrastructureData, railwayRoutes, governorateRawData } from './data/phosphateData';

/**
 * Build a features array for PhosphateMap by:
 * - including the tunisiaGeoJSON features (polygons),
 * - converting infrastructureData items to GeoJSON Point features (coordinates: [lon, lat]),
 * - converting railwayRoutes to LineString features (coordinates: [lon, lat]),
 * - attaching suitability numbers to governorate features (matching by name).
 */
function buildFeatures() {
  const features: any[] = [];

  // 1) Add tunisia polygons and attach suitability when possible
  for (const f of tunisiaGeoJSON.features) {
    const name = (f.properties && (f.properties.name || f.properties.NAME || f.id)) || '';
    const idx = governorateRawData.names.indexOf(name);
    const suitability = idx >= 0 ? governorateRawData.suitability[idx] : undefined;
    const properties = { ...(f.properties || {}), name, suitability };
    features.push({
      type: 'Feature',
      geometry: f.geometry,
      properties,
    });
  }

  // 2) Convert infrastructureData to Point features (GeoJSON expects [lon, lat])
  for (const infra of infrastructureData) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [infra.lon, infra.lat] },
      properties: {
        name: infra.name,
        type: infra.type, // groupByInfrastructure uses properties.type or properties.infrastructure_type
        capacity: infra.capacity,
        status: infra.status,
        emoji: infra.emoji,
        // mark them as infrastructure explicitly
        infrastructure: true,
      },
    });
  }

  // 3) Convert railwayRoutes to LineString features (note: route points in data are [lat, lon])
  for (const r of railwayRoutes) {
    const coords = (r.points || []).map((p) => {
      // ensure GeoJSON order [lon, lat]
      return [p[1], p[0]];
    });
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { name: r.name, type: 'Railway', description: r.description },
    });
  }

  return features;
}

function App() {
  const features = buildFeatures();

  // Set a Tunisia-focused center [lat, lon] and a comfortable zoom
  const tunisCenter: [number, number] = [34.0, 9.0];

  return (
    <div className="min-h-screen bg-gray-50">
      <PhosphateMap features={features} center={tunisCenter} zoom={6} />
    </div>
  );
}

export default App;
