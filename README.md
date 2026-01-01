Relocation_Phosphate_Map-main

This repository contains a React map visualization for phosphate relocation infrastructure. The recent changes fix two issues:

- src/utils/dataProcessing.ts: Corrected coordinate averaging and normalization. The helper functions now consistently return coordinates in the format [lat, lon]. This avoids accidental latitude/longitude swaps when averaging or computing map centers.
- src/components/PhosphateMap.tsx: Fixed infrastructure grouping and filtering logic and improved symbol handling. The map now groups features by infrastructure type, provides a simple toggle UI to show/hide each group, and uses color-coded CircleMarker symbols for clarity.

Files changed/added

- src/utils/dataProcessing.ts (modified)
  - toLatLon: normalizes single coordinates to [lat, lon] (detects and swaps if the input looks like [lon, lat]).
  - averageCoordinates: expects an array of coordinates in [lat, lon] format and returns their average as [lat, lon].
  - toLatLonAverage: convenience function to handle arrays of coordinates (e.g. LineString/Polygon) and return a single [lat, lon].

- src/components/PhosphateMap.tsx (modified)
  - Groups infrastructure by type (from properties.infrastructure_type or properties.type) and renders a toggleable list.
  - Uses the utilities in src/utils/dataProcessing.ts to ensure coordinates are normalized to [lat, lon] before rendering.
  - Uses color-coded CircleMarker symbols per type for clearer visualization.
    
Getting started

Prerequisites

- Node.js (>=14)
- npm or yarn

Install and run

1. Install dependencies

   npm install
   # or
   yarn

2. Start development server

   npm start
   # or
   yarn start

Notes about Map provider

This project uses react-leaflet with OpenStreetMap tiles by default (no API key required). If you switch to a provider that requires an API key (e.g. Mapbox), set up the provider and add any environment variable or token as required by that provider.

Testing the fixes

- Coordinate normalization: Ensure GeoJSON features with Point geometries whose coordinates are in [lon, lat] will render in the correct place; the helpers will convert to [lat, lon] before plotting.
- Averaging: Multi-point geometries (LineString/Polygon/MultiPoint) are averaged using correct latitude/longitude sums and will return a centroid as [lat, lon].
- Grouping and filtering: Load your features into the PhosphateMap component and verify the control in the top-right lists each infrastructure type and correctly toggles visibility. Symbols are color-coded by type.
