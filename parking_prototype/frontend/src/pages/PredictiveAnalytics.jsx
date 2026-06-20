import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet';
import realTrafficData from '../data/real_traffic_data.json';

const PredictiveAnalytics = () => {
  const [timeHorizon, setTimeHorizon] = useState('Current'); // Current, +30m, +1h, +3h, +24h

  const [selectedLocation, setSelectedLocation] = useState('All Bengaluru');
  const realLocations = Object.keys(realTrafficData);

  const generateBaseModel = (loc) => {
    const totalRealDemand = realLocations.reduce((sum, l) => sum + realTrafficData[l].demand, 0);
    const globalViolations = Math.round(totalRealDemand * 1000);
    
    let locViolations;
    let baseHotspotsCount;
    if (loc === 'All Bengaluru') {
      locViolations = globalViolations;
      baseHotspotsCount = 15;
    } else {
      const rawDemand = realTrafficData[loc]?.demand || 0.01;
      locViolations = Math.round((rawDemand * 25000) + 300);
      baseHotspotsCount = 1;
    }

    const now = new Date();
    now.setMinutes(0, 0, 0);
    const getT = (offsetHours) => {
      const d = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    return {
      baselineMax: Math.round(locViolations * 3.5),
      horizonData: {
        'Current': { violations: locViolations, confidence: 98, severity: 'High', hotspots: baseHotspotsCount, baseRadius: 10, roadRed: false },
        '+30m': { violations: Math.round(locViolations * 1.09), confidence: 92, severity: 'High', hotspots: baseHotspotsCount + 1, baseRadius: 12, roadRed: false },
        '+1h': { violations: Math.round(locViolations * 1.2), confidence: 88, severity: 'Severe', hotspots: baseHotspotsCount + 3, baseRadius: 15, roadRed: true },
        '+3h': { violations: Math.round(locViolations * 1.66), confidence: 81, severity: 'Critical', hotspots: baseHotspotsCount + 5, baseRadius: 18, roadRed: true },
        '+24h': { violations: Math.round(locViolations * 2.55), confidence: 74, severity: 'Catastrophic', hotspots: baseHotspotsCount + 8, baseRadius: 25, roadRed: true },
      },
      chartData: {
        'Current': [
          { time: getT(-4), actual: Math.round(locViolations * 0.34), predicted: Math.round(locViolations * 0.34) },
          { time: getT(-2), actual: Math.round(locViolations * 0.8), predicted: Math.round(locViolations * 0.81) },
          { time: getT(0), actual: locViolations, predicted: locViolations },
          { time: getT(2), predicted: Math.round(locViolations * 1.2) },
          { time: getT(4), predicted: Math.round(locViolations * 1.46) },
          { time: getT(6), predicted: Math.round(locViolations * 1.95) },
          { time: getT(8), predicted: Math.round(locViolations * 1.29) },
        ],
        '+30m': [
          { time: getT(-4), actual: Math.round(locViolations * 0.34), predicted: Math.round(locViolations * 0.34) },
          { time: getT(-2), actual: Math.round(locViolations * 0.8), predicted: Math.round(locViolations * 0.81) },
          { time: getT(0), actual: locViolations, predicted: locViolations },
          { time: getT(0.5), actual: Math.round(locViolations * 1.09), predicted: Math.round(locViolations * 1.09) },
          { time: getT(2), predicted: Math.round(locViolations * 1.26) },
          { time: getT(4), predicted: Math.round(locViolations * 1.55) },
          { time: getT(6), predicted: Math.round(locViolations * 2.03) },
          { time: getT(8), predicted: Math.round(locViolations * 1.37) },
        ],
        '+1h': [
          { time: getT(-4), actual: Math.round(locViolations * 0.34), predicted: Math.round(locViolations * 0.34) },
          { time: getT(-2), actual: Math.round(locViolations * 0.8), predicted: Math.round(locViolations * 0.81) },
          { time: getT(0), actual: locViolations, predicted: locViolations },
          { time: getT(1), actual: Math.round(locViolations * 1.2), predicted: Math.round(locViolations * 1.2) },
          { time: getT(2), predicted: Math.round(locViolations * 1.34) },
          { time: getT(4), predicted: Math.round(locViolations * 1.66) },
          { time: getT(6), predicted: Math.round(locViolations * 2.15) },
          { time: getT(8), predicted: Math.round(locViolations * 1.49) },
        ],
        '+3h': [
          { time: getT(-4), actual: Math.round(locViolations * 0.34), predicted: Math.round(locViolations * 0.34) },
          { time: getT(-2), actual: Math.round(locViolations * 0.8), predicted: Math.round(locViolations * 0.81) },
          { time: getT(0), actual: locViolations, predicted: locViolations },
          { time: getT(2), actual: Math.round(locViolations * 1.2), predicted: Math.round(locViolations * 1.2) },
          { time: getT(3), actual: Math.round(locViolations * 1.66), predicted: Math.round(locViolations * 1.66) },
          { time: getT(4), predicted: Math.round(locViolations * 1.89) },
          { time: getT(6), predicted: Math.round(locViolations * 2.46) },
          { time: getT(8), predicted: Math.round(locViolations * 1.75) },
        ],
        '+24h': [
          { time: getT(0), actual: Math.round(locViolations * 0.43), predicted: Math.round(locViolations * 0.43) },
          { time: getT(2), actual: Math.round(locViolations * 1.0), predicted: Math.round(locViolations * 1.01) },
          { time: getT(4), actual: Math.round(locViolations * 1.49), predicted: Math.round(locViolations * 1.49) },
          { time: getT(6), predicted: Math.round(locViolations * 1.95) },
          { time: getT(8), predicted: Math.round(locViolations * 2.41) },
          { time: getT(10), predicted: Math.round(locViolations * 3.3) },
          { time: getT(12), predicted: Math.round(locViolations * 2.55) },
        ]
      }
    };
  };

  const [dataModel, setDataModel] = useState(() => generateBaseModel('All Bengaluru'));

  useEffect(() => {
    setDataModel(generateBaseModel(selectedLocation));
  }, [selectedLocation]);

  // Pre-calculate stable random offsets for generated hotspots so they don't teleport
  const [stableOffsets] = useState(() => Array(100).fill(0).map(() => ({
    latOff: Math.random() * 0.04 - 0.02,
    lngOff: Math.random() * 0.04 - 0.02,
    radPulse: Math.random() * 4
  })));


  const currentData = dataModel.horizonData[timeHorizon];

  const stringToCoords = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOff = ((hash % 1000) / 1000) * 0.1 - 0.05;
    const lngOff = (((hash >> 3) % 1000) / 1000) * 0.1 - 0.05;
    return { lat: 12.9650 + latOff, lng: 77.6000 + lngOff };
  };

  const renderHotspots = () => {
    let spots = [];
    if (selectedLocation === 'All Bengaluru') {
      const globalSpots = realLocations.map(loc => stringToCoords(loc));
      while (spots.length < currentData.hotspots) {
        const parent = globalSpots[spots.length % globalSpots.length];
        const offset = stableOffsets[spots.length % stableOffsets.length];
        spots.push({
          lat: parent.lat + offset.latOff * 0.5,
          lng: parent.lng + offset.lngOff * 0.5,
          pulse: offset.radPulse
        });
      }
    } else {
      const parent = stringToCoords(selectedLocation);
      while (spots.length < currentData.hotspots) {
        const offset = stableOffsets[spots.length % stableOffsets.length];
        spots.push({
          lat: parent.lat + offset.latOff * 0.1,
          lng: parent.lng + offset.lngOff * 0.1,
          pulse: offset.radPulse
        });
      }
    }
    return spots.map((spot, i) => (
      <CircleMarker 
        key={i} center={[spot.lat, spot.lng]} 
        pathOptions={{ color: 'var(--warning)', fillColor: 'var(--warning)', fillOpacity: 0.6 }} 
        radius={currentData.baseRadius + (spot.pulse || (i % 4))} 
      />
    ));
  };

  const mapCenter = selectedLocation === 'All Bengaluru' ? [12.9650, 77.6000] : [stringToCoords(selectedLocation).lat, stringToCoords(selectedLocation).lng];
  const mapZoom = selectedLocation === 'All Bengaluru' ? 12 : 15;

  return (
    <div style={{ height: '100%', width: '100%', padding: '32px', overflowY: 'auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">
             Predictive Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Grid Forecasting: Anticipating congestion before it happens.</p>
        </div>
        <div>
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ 
              padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', 
              background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '1rem', 
              fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
            }}
          >
            <option value="All Bengaluru">All Bengaluru</option>
            {realLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        
        {/* Left Column: Time Control & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Time Slider Panel */}
          <div className="premium-card">
            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
               Time Horizon
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Current', '+30m', '+1h', '+3h', '+24h'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeHorizon(t)}
                  style={{
                    padding: '12px 16px', 
                    background: timeHorizon === t ? 'var(--accent-blue)' : 'var(--card-bg)',
                    color: timeHorizon === t ? '#fff' : 'var(--text-primary)', 
                    border: '1px solid',
                    borderColor: timeHorizon === t ? 'var(--accent-blue)' : 'var(--border-color)',
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 600, 
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t} Forecast
                </button>
              ))}
            </div>
          </div>

          {/* AI Confidence Panel */}
          <motion.div 
            key={timeHorizon} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="premium-card" 
            style={{ borderTop: '4px solid var(--accent-blue)' }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Forecast Summary</div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Predicted congestion</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentData.violations.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>vehicles</span></div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confidence</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>{currentData.confidence}%</div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Chart & Dynamic Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Predictive Chart */}
          <div className="premium-card" style={{ flex: '0.8', display: 'flex', flexDirection: 'column' }}>
            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>
               Volume Trajectory
            </h2>
            <div style={{ flex: 1, minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataModel.chartData[timeHorizon]}>
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" domain={[0, dataModel.baselineMax]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  {/* Both lines are blue now to match requirements */}
                  <Area type="monotone" dataKey="actual" stroke="var(--accent-blue)" fill="url(#colorBlue)" strokeWidth={3} isAnimationActive={false} />
                  <Area type="monotone" dataKey="predicted" stroke="var(--accent-blue)" fill="url(#colorBlue)" strokeDasharray="5 5" strokeWidth={3} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Forecasting Map */}
          <div className="premium-card" style={{ flex: '1.2', display: 'flex', flexDirection: 'column' }}>
            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>
               Spatial Escalation Forecast: <span style={{ color: 'var(--accent-blue)' }}>{timeHorizon}</span>
            </h2>
            <div style={{ width: '100%', height: '500px', minHeight: '500px', flexShrink: 0, position: 'relative', borderRadius: '18px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <MapContainer key={`${timeHorizon}-${selectedLocation}`} center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                
                {selectedLocation === 'All Bengaluru' && (
                  <>
                    <Polyline positions={[[12.9716, 77.5946], [12.9750, 77.6050], [12.9780, 77.6150]]} pathOptions={{ color: currentData.roadRed ? 'var(--warning)' : 'var(--warning)', weight: currentData.roadRed ? 6 : 4 }} />
                    <Polyline positions={[[12.9600, 77.5800], [12.9650, 77.5900], [12.9716, 77.5946]]} pathOptions={{ color: currentData.roadRed ? 'var(--warning)' : 'var(--success)', weight: 4 }} />
                    <Polyline positions={[[12.9300, 77.6200], [12.9400, 77.6300], [12.9500, 77.6400]]} pathOptions={{ color: 'var(--warning)', weight: currentData.roadRed ? 8 : 4 }} />
                  </>
                )}

                {/* Hotspots */}
                {renderHotspots()}
              </MapContainer>

              {/* Map Overlay Metrics */}
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 1000, background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hotspot Clusters Detected</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentData.hotspots} Zones</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PredictiveAnalytics;
