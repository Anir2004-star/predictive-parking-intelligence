import React, { useState, useEffect, useMemo } from 'react';
import realTrafficData from '../data/real_traffic_data.json';

const bengaluruLocations = Object.keys(realTrafficData);

const ImpactSimulator = () => {
  const [enforcementLevel, setEnforcementLevel] = useState('Medium');
  const [selectedLocation, setSelectedLocation] = useState(bengaluruLocations[0] || "MG Road Metro");
  const [apiData, setApiData] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/api/hotspots')
      .then(res => res.json())
      .then(data => {
        let rawHotspots = data.hotspots.sort((a,b) => b.impact_score - a.impact_score).slice(0, bengaluruLocations.length);
        let mapped = {};
        rawHotspots.forEach((hs, i) => {
           mapped[bengaluruLocations[i]] = hs;
        });
        setApiData(mapped);
      }).catch(err => console.log('API Fetch Error:', err));
  }, []);

  const levels = {
    'Low': 25,
    'Medium': 50,
    'High': 85,
    'Maximum': 100
  };

  const currentLevelValue = levels[enforcementLevel];

  const { metrics, revenueMultiplier, delayMultiplier } = useMemo(() => {
    const realData = realTrafficData[selectedLocation] || { demand: 0.1, NumberofLanes: 2 };
    const backendData = apiData[selectedLocation];
    
    const demandVal = realData.demand;
    const impactScore = backendData ? backendData.impact_score : demandVal * 5000;
    
    const baseCongestion = Math.min(99, Math.max(30, Math.round((impactScore / 5000) * 100)));
    const baseCapacity = Math.min(100, Math.max(10, 100 - Math.round(baseCongestion * 0.8)));
    const baseDelay = Math.round(baseCongestion * 0.3) + 5;
    const baseFuel = Number((demandVal * 12).toFixed(1));
    const baseCO2 = Number((demandVal * 35).toFixed(1));

    return {
      metrics: [
        { label: 'Congestion Level', current: baseCongestion, unit: '%' },
        { label: 'Road Capacity', current: baseCapacity, unit: '%' },
        { label: 'Avg Travel Delay', current: baseDelay, unit: ' min' },
        { label: 'Fuel Wastage', current: Math.max(0.5, baseFuel), unit: ' kL/d' },
        { label: 'CO₂ Emissions', current: Math.max(1.5, baseCO2), unit: ' t/d' }
      ],
      revenueMultiplier: Math.max(0.5, (demandVal * 30)),
      delayMultiplier: Math.max(2, baseDelay * 0.6)
    };
  }, [selectedLocation, apiData]);

  const getSimulatedValue = (index, current, levelValue) => {
    const factor = levelValue / 100;
    switch(index) {
      case 0: return current - (current * 0.63 * factor); // Congestion down
      case 1: return current + ((100 - current) * 0.8 * factor); // Capacity up
      case 2: return current - (current * 0.6 * factor); // Delay down
      case 3: return current - (current * 0.5 * factor); // Fuel down
      case 4: return current - (current * 0.5 * factor); // CO2 down
      default: return current;
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', padding: '32px', overflowY: 'auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">
             Impact Simulator
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Simulate location-specific ROI based on enforcement intensity.</p>
        </div>

        <div style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {bengaluruLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Left Column: Enforcement Level Control */}
        <div className="premium-card" style={{ height: 'fit-content' }}>
          <h2 className="section-title" style={{ marginBottom: '24px' }}>Enforcement Level</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(levels).map((level) => (
              <button
                key={level}
                onClick={() => setEnforcementLevel(level)}
                style={{
                  padding: '16px',
                  background: enforcementLevel === level ? 'var(--light-blue-bg)' : 'var(--card-bg)',
                  border: `1px solid ${enforcementLevel === level ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: enforcementLevel === level ? '0 2px 4px rgba(37, 99, 235, 0.1)' : 'none'
                }}
              >
                <span style={{ 
                  fontWeight: 600, 
                  color: enforcementLevel === level ? 'var(--accent-blue)' : 'var(--text-primary)',
                  fontSize: '1.1rem' 
                }}>
                  {level}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {levels[level]}% Intensity
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Structured Output Table */}
        <div className="premium-card">
          <h2 className="section-title" style={{ marginBottom: '24px' }}>Projected Impact Analysis</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Metric</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Current Baseline</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Projected</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Net Improvement</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => {
                  const simValue = getSimulatedValue(i, m.current, currentLevelValue);
                  const isImproved = i === 1 ? simValue > m.current : simValue < m.current;
                  const diff = Math.abs(simValue - m.current);
                  
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--card-bg)' : '#F8FAFC' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.label}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                        {m.current}{m.unit}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {simValue.toFixed(i > 1 ? 1 : 0)}{m.unit}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: isImproved ? 'var(--success)' : 'var(--text-primary)' }}>
                        {i === 1 ? '+' : '-'}{diff.toFixed(i > 1 ? 1 : 0)}{m.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="ai-decision-block" style={{ marginTop: '32px', marginBottom: 0 }}>
            <div className="ai-decision-title">ROI Assessment</div>
            <div className="ai-decision-text">
              Based on <span style={{ fontWeight: 600 }}>{enforcementLevel}</span> enforcement intensity ({currentLevelValue}%), the location can expect to recover 
              <span style={{ fontWeight: 600, color: 'var(--success)' }}> {((currentLevelValue / 100) * revenueMultiplier).toFixed(1)}Cr in revenue</span> while reducing average travel delays by <span style={{ fontWeight: 600, color: 'var(--success)' }}>{((currentLevelValue / 100) * delayMultiplier).toFixed(1)} minutes</span> per commuter.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImpactSimulator;
