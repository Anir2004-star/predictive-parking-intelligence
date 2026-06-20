import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

import realTrafficData from '../data/real_traffic_data.json';

const bengaluruLocations = Object.keys(realTrafficData);

const IncidentResponse = () => {
  const [selectedLocation, setSelectedLocation] = useState(bengaluruLocations[0] || "MG Road Metro");

  const [apiData, setApiData] = useState([]);
  
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

  // Dynamic Data Generator based on REAL CSV DATA
  const data = useMemo(() => {
    const realData = realTrafficData[selectedLocation] || {
        demand: 0.1, RoadType: "Residential", NumberofLanes: 2, Weather: "Clear", Temperature: 25.0
    };
    
    const backendData = apiData[selectedLocation];
    const demandVal = realData.demand; 
    
    // Base risk on the backend impact score if available
    const risk = backendData ? Math.min(99, Math.round(backendData.impact_score / 50)) : Math.min(99, Math.max(45, Math.round(demandVal * 400 + 40)));
    const conf = Math.round(90 + (demandVal * 5));
    const capLoss = backendData ? Math.min(95, Math.round(backendData.total_violations / 50)) : Math.min(85, Math.max(15, Math.round((4 / realData.NumberofLanes) * 12 + (demandVal * 100))));
    const affected = backendData ? backendData.total_violations : Math.round(demandVal * 150000 + 3000);
    
    let contributions = [];
    if (backendData && backendData.breakdown) {
      const tot = Object.values(backendData.breakdown).reduce((a, b) => a + b, 0) || 1;
      let used = 0;
      Object.entries(backendData.breakdown).forEach(([k, v]) => {
         const pct = Math.round((v / tot) * 100);
         contributions.push({ label: k.replace(/_/g, ' '), val: pct });
         used += pct;
      });
      if (used < 100 && used > 0) {
        contributions.push({ label: "OTHER FACTORS", val: 100 - used });
      }
    } else {
      let base = 100;
      const wp = Math.round(40 + (demandVal * 10)); base -= wp;
      const np = Math.round(20 + (realData.NumberofLanes * 2)); base -= Math.max(0, np);
      const ca = Math.round(15); base -= ca;
      const pht = Math.max(0, base);
      contributions = [
        { label: "Wrong Parking", val: wp },
        { label: "No Parking Violation", val: Math.max(0, np) },
        { label: "Commercial Activity", val: ca },
        { label: "Peak Hour Traffic", val: pht }
      ];
    }

    const hashStr = selectedLocation + realData.Weather;
    let hash = 0; for(let i=0;i<hashStr.length;i++) hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
    const towUnit = Math.abs(hash % 9) + 1;
    const distance = ((Math.abs(hash % 50) + 10) / 10).toFixed(1);
    const eta = Math.abs(hash % 15) + 4;
    const success = Math.min(98, Math.max(82, 95 - (realData.NumberofLanes)));
    const reduction = Math.round(capLoss * 0.7);

    const withoutCongestion = Math.min(98, Math.round(risk * 1.1));
    const withoutDelay = Math.round(risk * 0.4);
    const withoutCap = Math.round(100 - capLoss);

    const withCongestion = Math.max(20, withoutCongestion - reduction);
    const withDelay = Math.max(5, withoutDelay - Math.round(reduction * 0.5));
    const withCap = Math.min(95, withoutCap + Math.round(reduction * 0.8));

    return {
      real: realData,
      risk, conf, capLoss, affected, 
      contributions: contributions,
      towUnit, distance, eta, success, reduction,
      forecast: {
        without: { congestion: withoutCongestion, delay: withoutDelay, cap: withoutCap },
        after: { congestion: withCongestion, delay: withDelay, cap: withCap }
      }
    };
  }, [selectedLocation, apiData]);

  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const verticalTimelineSteps = [
    { label: 'Violation detected', desc: 'Flagged illegal parking event' },
    { label: `Road capacity reduced`, desc: `Capacity dropped by ${data.capLoss}%` },
    { label: 'Congestion predicted', desc: 'Gridlock probability: High' },
    { label: `Tow unit dispatched`, desc: `Unit #${data.towUnit} en route` }
  ];

  return (
    <div style={{ height: '100%', width: '100%', padding: '32px', overflowY: 'auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">
            Traffic Incident Command Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '8px' }}>Real-time automated incident tracking and resource dispatch.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
          
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>STATUS: ELEVATED RISK</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>CONFIDENCE: {data.conf}%</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', gap: '32px', marginBottom: '32px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* HERO SECTION */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="premium-card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>Critical Incident</h2>
              <span style={{ background: 'var(--danger)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>HIGH PRIORITY</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 24px 0', color: 'var(--text-primary)' }}>{selectedLocation}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Risk Score</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{data.risk}/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confidence</span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>{data.conf}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Capacity Loss</span>
                <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{data.capLoss}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Affected Commuters</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{data.affected.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* LIVE AI ANALYSIS */}
          <div className="premium-card">
            <h2 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
               Causal Analysis
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.contributions.map((c, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.label}</span>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{c.val}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.val}%` }} transition={{ duration: 1, delay: i * 0.1 }} style={{ height: '100%', background: 'var(--accent-blue)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER VISUAL - INCIDENT DECISION FLOW */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '32px' }}>Incident Workflow</h2>
          
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px', flex: 1, marginLeft: '24px' }}>
            <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)', zIndex: 0 }} />
            
            {verticalTimelineSteps.map((node, i) => {
              const isActive = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: isActive ? 1 : 0.4, x: 0 }} transition={{ delay: i * 0.2 }} style={{ zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '24px', position: 'relative' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isActive ? 'var(--accent-blue)' : 'var(--card-bg)', border: `4px solid ${isActive ? 'var(--light-blue-bg)' : 'var(--border-color)'}`, zIndex: 2, marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{node.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{node.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="ai-decision-block" style={{ marginTop: '32px', marginBottom: 0 }}>
            <div className="ai-decision-title">Recommendation</div>
            <div className="ai-decision-text">
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dispatch {data.towUnit > 0 ? `Tow Unit ${data.towUnit}` : 'Patrol'} to {selectedLocation}.</span><br/><br/>
              Expected congestion reduction: <strong>{data.reduction}%</strong><br/>
              Estimated travel delay reduction: <strong>{data.eta + 3} minutes</strong>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* RESOURCE MATCHING ENGINE */}
          <div className="premium-card">
            <h2 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
               Resource Dispatch
            </h2>
            
            <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>Selected: Tow Unit #{data.towUnit}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Distance:</span> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.distance} km</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>ETA:</span> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.eta} min</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Success Rate:</span> <span style={{ color: 'var(--success)', fontWeight: 600 }}>{data.success}%</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Reduction:</span> <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{data.reduction}%</span></div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>REJECTED UNITS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>Unit #{data.towUnit === 5 ? 6 : 5}</div>
                    <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>ETA too high.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>Patrol Alpha</div>
                    <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>No towing capability.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECOVERY FORECAST */}
          <div className="premium-card">
            <h2 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Recovery Forecast</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>WITHOUT ACTION</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Congestion</div>
                  <div style={{ color: 'var(--danger)', fontSize: '1.1rem', fontWeight: 700 }}>{data.forecast.without.congestion}%</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Delay</div>
                  <div style={{ color: 'var(--danger)', fontSize: '1.1rem', fontWeight: 700 }}>{data.forecast.without.delay}m</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Capacity</div>
                  <div style={{ color: 'var(--danger)', fontSize: '1.1rem', fontWeight: 700 }}>{data.forecast.without.cap}%</div>
                </div>
              </div>
            </div>
            
            <div>
              <div style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>AFTER DEPLOYMENT</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div style={{ background: '#F0FDF4', padding: '8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Congestion</div>
                  <div style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 700 }}>{data.forecast.after.congestion}%</div>
                </div>
                <div style={{ background: '#F0FDF4', padding: '8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Delay</div>
                  <div style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 700 }}>{data.forecast.after.delay}m</div>
                </div>
                <div style={{ background: '#F0FDF4', padding: '8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Capacity</div>
                  <div style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 700 }}>{data.forecast.after.cap}%</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default IncidentResponse;
