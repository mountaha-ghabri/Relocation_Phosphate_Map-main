import { tunisiaGeoJSON } from '../data/tunisiaGeoJSON';
import { governorateRawData, infrastructureData, getColor, getSuitabilityGroup } from '../data/phosphateData';
import { Governorate, InfrastructureItem } from '../types';

function calculateCenter(coords: number[][][]): [number, number] {
  const lons = coords[0].map(coord => coord[0]);
  const lats = coords[0].map(coord => coord[1]);
  const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  return [centerLat, centerLon];
}

function findRegionForInfrastructure(infra_lat: number, infra_lon: number, regionCenters: Record<string, [number, number]>): string {
  let minDist = Infinity;
  let closestRegion = '';

  for (const [name, [centerLat, centerLon]] of Object.entries(regionCenters)) {
    const dist = Math.sqrt(
      Math.pow(infra_lat - centerLat, 2) +
      Math.pow(infra_lon - centerLon, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closestRegion = name;
    }
  }

  return closestRegion;
}

export function processGovernorateData(): Governorate[] {
  const regionCenters: Record<string, [number, number]> = {};

  for (const feature of tunisiaGeoJSON.features) {
    const name = feature.properties.name;
    const coords = feature.geometry.coordinates;
    regionCenters[name] = calculateCenter(coords);
  }

  const infraWithRegion: InfrastructureItem[] = infrastructureData.map(infra => ({
    ...infra,
    region: findRegionForInfrastructure(infra.lat, infra.lon, regionCenters)
  }));

  const governorates: Governorate[] = governorateRawData.names.map((name, index) => {
    const suitability = governorateRawData.suitability[index];
    const population_density = governorateRawData.population_density[index];
    const [center_lat, center_lon] = regionCenters[name] || [0, 0];

    const regionInfra = infraWithRegion.filter(infra => infra.region === name);
    const uniqueEmojis = [...new Set(regionInfra.map(infra => infra.emoji))];
    const infra_emoji = uniqueEmojis.join(' ');

    return {
      name,
      suitability,
      population_density,
      center_lat,
      center_lon,
      color: getColor(suitability),
      suitability_group: getSuitabilityGroup(suitability),
      infra_count: regionInfra.length,
      infra_emoji,
      infra_list: regionInfra.map(infra => ({
        name: infra.name,
        type: infra.type,
        emoji: infra.emoji,
        lat: infra.lat,
        lon: infra.lon,
        capacity: infra.capacity,
        status: infra.status
      }))
    };
  });

  return governorates;
}

export function getInfrastructureWithRegions(): InfrastructureItem[] {
  const regionCenters: Record<string, [number, number]> = {};

  for (const feature of tunisiaGeoJSON.features) {
    const name = feature.properties.name;
    const coords = feature.geometry.coordinates;
    regionCenters[name] = calculateCenter(coords);
  }

  return infrastructureData.map(infra => ({
    ...infra,
    region: findRegionForInfrastructure(infra.lat, infra.lon, regionCenters)
  }));
}
