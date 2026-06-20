import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map zooming to selected hotspot
const MapController = ({ selectedHotspot }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedHotspot) {
      map.flyTo([selectedHotspot.lat, selectedHotspot.lng], 16, {
        duration: 1.5
      });
    }
  }, [selectedHotspot, map]);
  
  return null;
};

const MapComponent = ({ hotspots, selectedHotspot }) => {
  // Center on Bengaluru
  const center = [12.9716, 77.5946];

  const getMarkerColor = (score) => {
    if (score > 100) return '#ef4444'; // critical
    if (score > 50) return '#f59e0b'; // warning
    return '#3b82f6'; // info
  };

  const getMarkerRadius = (violations) => {
    // Scale radius logarithmically to prevent massive blobs for high-violation areas
    return Math.max(4, Math.min(12, Math.log10(violations) * 3));
  };

  return (
    <div style={{ width: '100%', height: '500px', minHeight: '500px', flexShrink: 0, overflow: 'hidden', borderRadius: '18px', background: '#FFFFFF', border: '1px solid #E5E7EB', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Render lower impact hotspots first, so critical red ones are on top */}
        {[...hotspots].reverse().map((hotspot) => (
          <CircleMarker
            key={hotspot.id}
            center={[hotspot.lat, hotspot.lng]}
            pathOptions={{
              color: getMarkerColor(hotspot.impact_score),
              fillColor: getMarkerColor(hotspot.impact_score),
              fillOpacity: 0.6,
              weight: 2
            }}
            radius={getMarkerRadius(hotspot.total_violations)}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold mb-1 border-b border-white/20 pb-1">Zone Details</h3>
                <p><strong>Primary Offence:</strong> {hotspot.primary_offence}</p>
                <p><strong>Total Violations:</strong> {hotspot.total_violations}</p>
                <p><strong>Impact Score:</strong> {hotspot.impact_score}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <MapController selectedHotspot={selectedHotspot} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
