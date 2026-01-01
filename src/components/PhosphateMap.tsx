import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { averageCoordinates, toLatLon, toLatLonAverage, Coordinate } from '../utils/dataProcessing';

type Feature = {
  type?: string;
  geometry?: {
    type: string;
    // GeoJSON uses [lon, lat] by default for point coordinates, but we normalize in helpers
    coordinates: any;
  };
  properties?: {
    infrastructure_type?: string;
    name?: string;
    [key: string]: any;
  };
};

type Props = {
  features: Feature[];
  center?: Coordinate;
  zoom?: number;
};

// Simple mapping from infrastructure type to symbol/color
const typeStyle = (type: string) => {
  const key = (type || '').toLowerCase();
  switch (key) {
    case 'power':
    case 'powerline':
    case 'electrical':
      return { color: '#c0392b', radius: 8 }; // red
    case 'road':
    case 'highway':
      return { color: '#e67e22', radius: 6 }; // orange
    case 'water':
    case 'pipeline':
      return { color: '#2980b9', radius: 7 }; // blue
    case 'mine':
    case 'factory':
      return { color: '#8e44ad', radius: 8 }; // purple
    default:
      return { color: '#27ae60', radius: 6 }; // green
  }
};

function groupByInfrastructure(features: Feature[]) {
  const groups: Record<string, Feature[]> = {};
  for (const f of features || []) {
    const type = (f.properties && (f.properties.infrastructure_type || f.properties.type)) || 'unknown';
    if (!groups[type]) groups[type] = [];
    groups[type].push(f);
  }
  return groups;
}

export default function PhosphateMap({ features = [], center, zoom = 6 }: Props) {
  const groups = useMemo(() => groupByInfrastructure(features), [features]);

  // Visible toggles for each infrastructure type
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  // Initialize visibility when groups change
  useEffect(() => {
    const keys = Object.keys(groups);
    const init: Record<string, boolean> = {};
    for (const k of keys) {
      init[k] = visible[k] !== undefined ? visible[k] : true;
    }
    setVisible(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Object.keys(groups))]);

  // Determine a sensible center if none provided: average all feature coords
  const computedCenter = useMemo(() => {
    try {
      const points: Coordinate[] = [];
      for (const f of features || []) {
        if (!f.geometry || !f.geometry.coordinates) continue;
        const geom = f.geometry;
        if (geom.type === 'Point') {
          points.push(toLatLon(geom.coordinates as number[]));
        } else if (Array.isArray(geom.coordinates)) {
          // For LineString/Polygon/MultiPoint etc, compute average
          const coord = toLatLonAverage(geom.coordinates as number[][]);
          points.push(coord);
        }
      }
      if (points.length === 0) return center || ([0, 0] as Coordinate);
      return averageCoordinates(points);
    } catch (err) {
      return center || ([0, 0] as Coordinate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features]);

  const mapCenter = center || computedCenter;

  const toggleType = (type: string) => {
    setVisible((v) => ({ ...v, [type]: !v[type] }));
  };

  // Helper to compute a display coordinate for a feature
  const featureCoordinate = (f: Feature): Coordinate | null => {
    if (!f.geometry || !f.geometry.coordinates) return null;
    const geom = f.geometry;
    try {
      if (geom.type === 'Point') {
        return toLatLon(geom.coordinates as number[]);
      }
      if (Array.isArray(geom.coordinates)) {
        return toLatLonAverage(geom.coordinates as number[][]);
      }
    } catch (e) {
      // fallback: attempt best-effort normalization
      const c = Array.isArray(geom.coordinates[0]) ? geom.coordinates[0] : geom.coordinates;
      try {
        return toLatLon(c as number[]);
      } catch (_) {
        return null;
      }
    }
    return null;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Simple overlay controls for filter toggles */}
      <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 1000, background: 'white', padding: 8, borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
        <strong>Infrastructure</strong>
        <div style={{ maxHeight: 240, overflowY: 'auto', marginTop: 6 }}>
          {Object.keys(groups).map((type) => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <input type="checkbox" checked={visible[type] ?? true} onChange={() => toggleType(type)} />
              <span style={{ marginLeft: 8 }}>{type} ({groups[type].length})</span>
            </label>
          ))}
        </div>
      </div>

      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {Object.entries(groups).map(([type, feats]) => {
          if (!visible[type]) return null;
          const style = typeStyle(type);
          return (
            <LayerGroup key={type}>
              {feats.map((f, idx) => {
                const coord = featureCoordinate(f);
                if (!coord) return null;
                const [lat, lon] = coord;
                // Use CircleMarker for clear, color-coded symbols
                return (
                  <CircleMarker key={`${type}-${idx}`} center={[lat, lon]} pathOptions={{ color: style.color }} radius={style.radius}>
                    <Popup>
                      <div>
                        <strong>{(f.properties && (f.properties.name || f.properties.title)) || 'Unnamed'}</strong>
                        <div>Type: {type}</div>
                        {f.properties && Object.keys(f.properties).length > 0 && (
                          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{JSON.stringify(f.properties, null, 2)}</pre>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </LayerGroup>
          );
        })}
      </MapContainer>
    </div>
  );
}
