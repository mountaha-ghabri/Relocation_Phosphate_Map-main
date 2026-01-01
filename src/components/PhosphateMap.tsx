import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toLatLon, toLatLonAverage, averageCoordinates } from '../utils/geo';

type Feature = {
  type?: string;
  geometry?: {
    type: string;
    coordinates: any;
  };
  properties?: {
    infrastructure_type?: string;
    name?: string;
    [key: string]: any;
  };
};

type Coordinate = [number, number];

type Props = {
  features: Feature[];
  center?: Coordinate;
  zoom?: number;
};

const typeStyle = (type: string) => {
  const key = (type || '').toLowerCase();
  switch (key) {
    case 'power':
    case 'powerline':
    case 'electrical':
      return { color: '#c0392b', radius: 8 };
    case 'road':
    case 'highway':
      return { color: '#e67e22', radius: 6 };
    case 'water':
    case 'pipeline':
      return { color: '#2980b9', radius: 7 };
    case 'mine':
    case 'factory':
      return { color: '#8e44ad', radius: 8 };
    default:
      return { color: '#27ae60', radius: 6 };
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
  // compute center first (avoid using it before declaration)
  const computedCenter = useMemo(() => {
    try {
      const points: Coordinate[] = [];
      for (const f of features || []) {
        if (!f.geometry || !f.geometry.coordinates) continue;
        const geom = f.geometry;
        if (geom.type === 'Point') {
          points.push(toLatLon(geom.coordinates as number[]));
        } else if (Array.isArray(geom.coordinates)) {
          points.push(toLatLonAverage(geom.coordinates));
        }
      }
      if (points.length === 0) return center || ([0, 0] as Coordinate);
      return averageCoordinates(points);
    } catch {
      return center || ([0, 0] as Coordinate);
    }
  }, [features, center]);

  const groups = useMemo(() => groupByInfrastructure(features), [features]);

  const [visible, setVisible] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const keys = Object.keys(groups);
    const init: Record<string, boolean> = {};
    for (const k of keys) init[k] = visible[k] !== undefined ? visible[k] : true;
    setVisible(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  useEffect(() => {
    console.debug('PhosphateMap debug:', {
      featuresCount: features?.length ?? 0,
      groups: Object.keys(groups),
      computedCenter,
    });
  }, [features, groups, computedCenter]);

  const mapCenter = center || computedCenter;
  const validCenter = Array.isArray(mapCenter) && Number.isFinite(mapCenter[0]) && Number.isFinite(mapCenter[1]);
  useEffect(() => {
    if (!validCenter) console.error('PhosphateMap: invalid map center', { mapCenter });
  }, [validCenter, mapCenter]);

  if (!validCenter) {
    return <div style={{ padding: 16 }}>Map cannot render: invalid center — check console for details.</div>;
  }

  const toggleType = (type: string) => setVisible((v) => ({ ...v, [type]: !v[type] }));

  const featureCoordinate = (f: Feature): Coordinate | null => {
    if (!f.geometry || !f.geometry.coordinates) return null;
    const geom = f.geometry;
    try {
      if (geom.type === 'Point') return toLatLon(geom.coordinates as number[]);
      if (geom.type === 'MultiPoint' || geom.type === 'LineString' || geom.type === 'Polygon') {
        return toLatLonAverage(geom.coordinates);
      }
      // fallback: try to average any nested coords
      if (Array.isArray(geom.coordinates)) return toLatLonAverage(geom.coordinates);
    } catch {
      // final fallback: try first numeric pair
      const coords = geom.coordinates;
      if (Array.isArray(coords)) {
        const first = Array.isArray(coords[0]) ? coords[0] : coords;
        if (Array.isArray(first) && typeof first[0] === 'number' && typeof first[1] === 'number') {
          return toLatLon(first as number[]);
        }
      }
    }
    return null;
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 1000, background: 'white', padding: 8, borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>Legend</strong>
        {Object.keys(groups).map((k) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <input type="checkbox" checked={visible[k] ?? true} onChange={() => toggleType(k)} />
            <span style={{ width: 12, height: 12, background: typeStyle(k).color, display: 'inline-block', borderRadius: 6 }} />
            <span>{k} ({groups[k].length})</span>
          </label>
        ))}
      </div>

      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '80vh', width: '100%' }} key={`${mapCenter[0]}_${mapCenter[1]}_${zoom}`}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        {Object.entries(groups).map(([type, items]) => (
          <LayerGroup key={type}>
            {(visible[type] ?? true) &&
              items.map((f, idx) => {
                const coord = featureCoordinate(f);
                if (!coord) return null;
                const style = typeStyle(type);
                return (
                  <CircleMarker key={`${type}_${idx}`} center={coord} pathOptions={{ color: style.color }} radius={style.radius}>
                    <Popup>
                      <div>
                        <strong>{f.properties?.name ?? type}</strong>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(f.properties || {}, null, 2)}</pre>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
          </LayerGroup>
        ))}
      </MapContainer>
    </div>
  );
}
