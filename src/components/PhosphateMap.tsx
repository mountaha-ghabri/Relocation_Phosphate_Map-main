import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { processGovernorateData, getInfrastructureWithRegions } from '../utils/dataProcessing';
import { railwayRoutes, cities, infrastructureGroups, suitabilityGroups } from '../data/phosphateData';

export default function PhosphateMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const governorates = processGovernorateData();
    const infrastructureWithRegions = getInfrastructureWithRegions();

    const data: Plotly.Data[] = [];

    for (const [groupName, style] of Object.entries(suitabilityGroups)) {
      const groupData = governorates.filter(gov => gov.suitability_group === groupName);

      if (groupData.length > 0) {
        const regionNamesWithEmoji = groupData.map(row =>
          row.infra_emoji ? `${row.infra_emoji} ${row.name}` : row.name
        );

        const hoverDataList = groupData.map(row => {
          const infraText = row.infra_count > 0
            ? row.infra_list.map(item => `${item.emoji} ${item.name}`).join('<br>')
            : 'None';
          return [row.name, row.suitability, row.population_density, row.infra_count, infraText];
        });

        data.push({
          type: 'scattermapbox',
          lat: groupData.map(g => g.center_lat),
          lon: groupData.map(g => g.center_lon),
          mode: 'markers+text',
          marker: {
            size: groupData.map(g => 15 + (g.suitability / 100) * 25),
            color: style.color,
            opacity: 0.8,
          },
          text: regionNamesWithEmoji,
          textposition: 'middle center',
          textfont: {
            size: 10,
            color: 'white',
            family: 'Times New Roman, serif'
          },
          customdata: hoverDataList,
          hovertemplate:
            '<b>%{customdata[0]}</b><br>' +
            'Suitability: %{customdata[1]:.0f}%<br>' +
            'Pop Density: %{customdata[2]:.0f} p/km²<br>' +
            '<b>Infrastructure Sites: %{customdata[3]}</b><br>' +
            '%{customdata[4]}<br>' +
            '<extra></extra>',
          name: `<b>${groupName}</b><br><span style="font-size:9px">${style.description}</span>`,
          showlegend: true,
          legendgroup: 'Suitability',
          legendgrouptitle: { text: '<b>📊 Regional Suitability (Relocation Score)</b>' }
        } as Plotly.Data);
      }
    }

    const infraGroupNames = ['Mines', 'Processing Plants', 'Export Ports', 'Exploration Sites'];

    for (const groupName of infraGroupNames) {
      const style = infrastructureGroups[groupName];
      const groupData = infrastructureWithRegions.filter(infra => infra.emoji === style.emoji);

      if (groupData.length > 0) {
        const hoverData = groupData.map(row => [
          row.name,
          row.type,
          row.capacity,
          row.status,
          row.region || 'Unknown'
        ]);

        // Use different shapes for infrastructure to differentiate from suitability circles
        const shapeMap: Record<string, string> = {
          'Mines': 'diamond',
          'Processing Plants': 'square',
          'Export Ports': 'star',
          'Exploration Sites': 'triangle-up'
        };
        
        data.push({
          type: 'scattermapbox',
          lat: groupData.map(i => i.lat),
          lon: groupData.map(i => i.lon),
          mode: 'markers+text',
          marker: {
            size: 30,
            color: style.color,
            opacity: 0.9,
            symbol: shapeMap[groupName] || 'circle',
            line: {
              width: 2,
              color: 'white'
            }
          },
          text: groupData.map(() => style.emoji),
          textposition: 'middle center',
          textfont: {
            size: 22,
            family: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, Arial Unicode MS, sans-serif'
          },
          customdata: hoverData,
          hovertemplate:
            '<b>%{customdata[0]}</b><br>' +
            'Type: %{customdata[1]}<br>' +
            'Capacity: %{customdata[2]:.1f} M tons/year<br>' +
            'Status: %{customdata[3]}<br>' +
            'Region: %{customdata[4]}<br>' +
            '<extra></extra>',
          name: `<b>${style.emoji} ${groupName}</b>`,
          showlegend: true,
          legendgroup: 'Infrastructure',
          legendgrouptitle: { text: '<b>🔧 Phosphate Infrastructure</b>' }
        } as Plotly.Data);
      }
    }

    for (const route of railwayRoutes) {
      const lats = route.points.map(point => point[0]);
      const lons = route.points.map(point => point[1]);

      data.push({
        type: 'scattermapbox',
        lat: lats,
        lon: lons,
        mode: 'lines+markers',
        line: {
          width: 3,
          color: '#8B4513'
        },
        marker: {
          size: 8,
          color: '#8B4513',
          symbol: 'circle'
        },
        name: `<b>🚂 ${route.name}</b>`,
        hovertemplate:
          `<b>${route.name}</b><br>` +
          `${route.description}<br>` +
          '<extra></extra>',
        showlegend: true,
        legendgroup: 'Transportation',
        legendgrouptitle: { text: '<b>🚂 Transportation</b>' }
      } as Plotly.Data);
    }

    for (const city of cities) {
      data.push({
        type: 'scattermapbox',
        lat: [city.lat],
        lon: [city.lon],
        mode: 'markers+text',
        marker: {
          size: 10,
          color: 'purple',
          symbol: 'circle',
          opacity: 0.7
        },
        text: [`🏛️ ${city.name}`],
        textposition: 'bottom center',
        textfont: {
          size: 10,
          color: 'purple',
          family: 'Times New Roman, serif'
        },
        hovertemplate: `<b>${city.name}</b><br>Major City<br><extra></extra>`,
        showlegend: false,
        name: `City: ${city.name}`
      } as Plotly.Data);
    }

    const layout: Partial<Plotly.Layout> = {
      title: {
        text:
          '🇹🇳 TUNISIAN PHOSPHATE INDUSTRY - RELOCATION SUITABILITY ANALYSIS<br>' +
          '<span style="font-size:15px; color:#555">Interactive Map with Regional Scores & Infrastructure Locations</span>',
        y: 0.98,
        x: 0.5,
        xanchor: 'center',
        yanchor: 'top',
        font: {
          size: 26,
          family: 'Times New Roman, serif',
          color: '#2E8B57'
        }
      },
      mapbox: {
        style: 'carto-positron',
        center: { lat: 34.2, lon: 9.5 },
        zoom: 5.5,
        bearing: 0,
        pitch: 0
      },
      height: 900,
      width: undefined,
      margin: { l: 20, r: 120, t: 100, b: 20 },
      paper_bgcolor: '#f8f9fa',
      hovermode: 'closest',
      legend: {
        yanchor: 'bottom',
        y: 0.01,
        xanchor: 'left',
        x: 0.01,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        bordercolor: '#2E8B57',
        borderwidth: 2,
        font: { size: 11, family: 'Times New Roman, serif', color: '#000000' },
        itemsizing: 'constant',
        tracegroupgap: 10,
        itemwidth: 30,
        groupclick: 'toggleitem',
        itemclick: 'toggle'
      },
      font: { family: 'Times New Roman, serif' },
      annotations: [
        {
          x: 0.98,
          y: 0.02,
          xref: 'paper',
          yref: 'paper',
          text:
            '<b>📈 SUMMARY STATISTICS</b><br><br>' +
            `<b>Total Infrastructure Sites:</b> ${infrastructureWithRegions.length}<br>` +
            `<b>Active Mines:</b> ${infrastructureWithRegions.filter(i => i.emoji === '⛏️').length}<br>` +
            `<b>Processing Plants:</b> ${infrastructureWithRegions.filter(i => i.emoji === '🏭').length}<br>` +
            `<b>Export Ports:</b> ${infrastructureWithRegions.filter(i => i.emoji === '🛳️').length}<br>` +
            `<b>Exploration Sites:</b> ${infrastructureWithRegions.filter(i => i.emoji === '🔍').length}<br>` +
            `<b>Railway Routes:</b> ${railwayRoutes.length}<br><br>` +
            '<b>Highest Suitability:</b><br>' +
            '   • Medenine (95%)<br>' +
            '   • Kebili (94%)<br>' +
            '   • Tozeur (92%)<br>' +
            '<b>Lowest Suitability:</b><br>' +
            '   • Gabès (20%) ⚠️<br><br>' +
            '<span style="font-size:10px; color:#777">' +
            'Data sources: INS Tunisia,<br>' +
            'GCT, World Bank, IFA<br>' +
            'For GP optimization model</span>',
          showarrow: false,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          bordercolor: '#2E8B57',
          borderwidth: 2,
          borderpad: 10,
          align: 'left',
          font: { size: 11, family: 'Times New Roman, serif' }
        },
        {
          x: 0.5,
          y: 0.01,
          xref: 'paper',
          yref: 'paper',
          text:
            '<span style="font-size:10px; color:#666">' +
            'Interactive map for Goal Programming optimization model • ' +
            'Suitability scores based on population density, water availability, environmental impact, and infrastructure access • ' +
            'Click legend items to toggle visibility</span>',
          showarrow: false,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: 'gray',
          borderwidth: 1,
          borderpad: 5,
          align: 'center',
          font: { size: 9, family: 'Times New Roman, serif' }
        }
      ]
    };

    const config: Partial<Plotly.Config> = {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: [],
      scrollZoom: true,
      doubleClick: 'reset+autosize' as any,
      toImageButtonOptions: {
        format: 'png',
        filename: 'tunisia_phosphate_map',
        height: 900,
        width: 1400,
        scale: 1
      }
    };

    const currentRef = mapRef.current;
    Plotly.newPlot(currentRef, data, layout, config);

    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}
