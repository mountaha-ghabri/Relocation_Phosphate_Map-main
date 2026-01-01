import { InfrastructureItem, RailwayRoute, City, InfrastructureGroup, SuitabilityGroup } from '../types';

export const infrastructureData: InfrastructureItem[] = [
  { name: "Gafsa Mining Hub", lat: 34.4253, lon: 8.7750, emoji: "⛏️", type: "Mine Region", capacity: 10.2, status: "Active" },
  { name: "Redeyef Mine", lat: 34.3830, lon: 8.1500, emoji: "⛏️", type: "Mine", capacity: 4.2, status: "Active" },
  { name: "Mdhilla Mine/Processing", lat: 34.2909, lon: 8.7526, emoji: "⛏️", type: "Mine/Plant", capacity: 3.2, status: "Active" },
  { name: "Sra Ouertene Mine", lat: 36.2167, lon: 8.7500, emoji: "⛏️", type: "Mine", capacity: 5.0, status: "Active" },
  { name: "Gabès Chemical Complex", lat: 33.9360, lon: 9.8660, emoji: "🏭", type: "Processing Plant", capacity: 12.5, status: "To Relocate" },
  { name: "Skhira Plant", lat: 34.3910, lon: 10.7330, emoji: "🏭", type: "Processing Plant", capacity: 8.5, status: "Active" },
  { name: "Sfax TSP Plant", lat: 34.7406, lon: 10.7603, emoji: "🏭", type: "Processing Plant", capacity: 6.8, status: "Existing" },
  { name: "M'dhilla Fertilizer Plant", lat: 34.2909, lon: 8.7526, emoji: "🏭", type: "Processing Plant", capacity: 4.0, status: "Active" },
  { name: "Port of Sfax", lat: 34.7406, lon: 10.7603, emoji: "🛳️", type: "Export Port", capacity: 15.0, status: "Active" },
  { name: "Port of Gabès", lat: 33.8815, lon: 9.7238, emoji: "🛳️", type: "Export Port", capacity: 10.0, status: "Active" },
  { name: "Northern Exploration", lat: 36.5, lon: 9.0, emoji: "🔍", type: "Exploration Site", capacity: 0, status: "Survey" },
  { name: "Central Exploration", lat: 35.0, lon: 9.5, emoji: "🔍", type: "Exploration Site", capacity: 0, status: "Survey" },
  { name: "Southern Exploration", lat: 33.0, lon: 10.0, emoji: "🔍", type: "Exploration Site", capacity: 0, status: "Survey" },
];

export const railwayRoutes: RailwayRoute[] = [
  {
    name: 'Gafsa → Gabès Rail',
    points: [
      [34.4253, 8.7750],
      [34.3, 9.0],
      [33.9360, 9.8660],
    ],
    description: 'Main freight line from Gafsa basin to Gabès processing'
  },
  {
    name: 'Gafsa → Sfax Rail',
    points: [
      [34.4253, 8.7750],
      [34.5, 9.5],
      [34.7406, 10.7603],
    ],
    description: 'Freight route to Sfax port and processing'
  },
  {
    name: 'Redeyef → Metlaoui Branch',
    points: [
      [34.3830, 8.1500],
      [34.32, 8.40],
      [34.4253, 8.7750],
    ],
    description: 'Mining spur connecting Redeyef to main network'
  },
];

export const cities: City[] = [
  { name: "Tunis", lat: 36.8065, lon: 10.1815 },
  { name: "Sfax", lat: 34.7406, lon: 10.7608 },
  { name: "Sousse", lat: 35.8254, lon: 10.6365 },
];

export const governorateRawData = {
  names: [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul',
    'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Kef',
    'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax',
    'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès',
    'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ],
  suitability: [
    15, 20, 25, 30, 35,
    65, 60, 70, 75, 80,
    85, 30, 40, 45, 25,
    50, 90, 85, 20,
    95, 90, 88, 92, 94
  ],
  population_density: [
    3056, 1349, 920, 396, 305,
    72, 160, 90, 141, 52,
    54, 281, 589, 152, 139,
    89, 60, 69, 57,
    4, 41, 24, 8, 8
  ]
};

export const infrastructureGroups: Record<string, InfrastructureGroup> = {
  'Mines': {
    emoji: '⛏️',
    color: '#8B4513',
    symbol: 'diamond',
    size: 20
  },
  'Processing Plants': {
    emoji: '🏭',
    color: '#DC143C',
    symbol: 'square',
    size: 25
  },
  'Export Ports': {
    emoji: '🛳️',
    color: '#0066CC',
    symbol: 'star',
    size: 20
  },
  'Exploration Sites': {
    emoji: '🔍',
    color: '#FF8C00',
    symbol: 'diamond',
    size: 18
  }
};

export const suitabilityGroups: Record<string, SuitabilityGroup> = {
  'Very Poor (0-20%)': {
    color: '#8B0000',
    description: 'Dense urban areas - Low relocation suitability score'
  },
  'Poor (20-40%)': {
    color: '#FF6347',
    description: 'High population - Below average relocation suitability score'
  },
  'Fair (40-60%)': {
    color: '#FFD700',
    description: 'Moderate density - Average relocation suitability score'
  },
  'Good (60-80%)': {
    color: '#ADFF2F',
    description: 'Low population - Above average relocation suitability score'
  },
  'Excellent (80-100%)': {
    color: '#006400',
    description: 'Optimal conditions - Highest relocation suitability score'
  }
};

export function getColor(suitability: number): string {
  if (suitability < 20) return '#8B0000';
  if (suitability < 40) return '#FF6347';
  if (suitability < 60) return '#FFD700';
  if (suitability < 80) return '#ADFF2F';
  return '#006400';
}

export function getSuitabilityGroup(suitability: number): string {
  if (suitability < 20) return 'Very Poor (0-20%)';
  if (suitability < 40) return 'Poor (20-40%)';
  if (suitability < 60) return 'Fair (40-60%)';
  if (suitability < 80) return 'Good (60-80%)';
  return 'Excellent (80-100%)';
}
