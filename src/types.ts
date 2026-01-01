export interface Governorate {
  name: string;
  suitability: number;
  population_density: number;
  center_lat: number;
  center_lon: number;
  color: string;
  suitability_group: string;
  infra_count: number;
  infra_emoji: string;
  infra_list: InfrastructureItem[];
}

export interface InfrastructureItem {
  name: string;
  lat: number;
  lon: number;
  emoji: string;
  type: string;
  capacity: number;
  status: string;
  region?: string;
}

export interface RailwayRoute {
  name: string;
  points: [number, number][];
  description: string;
}

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export interface InfrastructureGroup {
  emoji: string;
  color: string;
  symbol: string;
  size: number;
}

export interface SuitabilityGroup {
  color: string;
  description: string;
}
