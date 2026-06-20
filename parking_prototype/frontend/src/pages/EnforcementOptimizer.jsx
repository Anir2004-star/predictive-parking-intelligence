import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';

const customTruckIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713303.png', // Basic truck icon
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const policeStation = [12.9400, 77.5800];
const targetHotspot = [12.9716, 77.5946];

// Mock Route Path
const routePath = [
  policeStation,
  [12.9450, 77.5820],
  [12.9500, 77.5850],
  [12.9550, 77.5880],
  [12.9600, 77.5900],
  [12.9650, 77.5920],
  targetHotspot
];

const EnforcementOptimizer = () => {
  const [dispatchStatus, setDispatchStatus] = useState('IDLE'); // IDLE, EN_ROUTE, ARRIVED
  const [truckPosition, setTruckPosition] = useState(policeStation);
  const [eta, setEta] = useState(8);
  const [distance, setDistance] = useState(3.2);
  const [showExplanation, setShowExplanation] = useState(false);

  const startDispatch = () => {
    setDispatchStatus('EN_ROUTE');
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      if (step < routePath.length) {
        setTruckPosition(routePath[step]);
        setEta(Math.max(1, 8 - Math.floor((step / routePath.length) * 8)));
        setDistance(Math.max(0.1, 3.2 - ((step / routePath.length) * 3.2)).toFixed(1));
      } else {
        clearInterval(interval);
        setDispatchStatus('ARRIVED');
        setEta(0);
        setDistance(0);
      }
    }, 1500); // Move every 1.5s
  };

  return (
    <div style={{ height: '100%', width: '100%', padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
           Enforcement Optimizer
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>AI-driven dispatch and routing for congestion resolution.</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flex: 1, minHeight: 0 }}>
        
        {/* Actions Panel */}
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px' }}>
          
          <div className="premium-card" style={{ padding: '24px', borderTop: '4px solid var(--alert-orange)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              
              <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>Critical Target</h2>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>MG Road Metro</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--critical-red)' }}>Risk Score: 94/100</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--success-green)', marginTop: '4px' }}>AI Confidence: 91%</div>
            </div>

            {dispatchStatus === 'IDLE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={startDispatch}
                  style={{ 
                    width: '100%', padding: '16px', background: 'var(--electric-cyan)', color: '#000', 
                    border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
                  }}
                >
                   DEPLOY TOW UNIT #3
                </button>
                <button 
                  onClick={() => setShowExplanation(true)}
                  style={{ 
                    width: '100%', padding: '12px', background: 'transparent', color: 'var(--text-secondary)', 
                    border: '1px solid var(--panel-border)', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                   Explain Recommendation
                </button>
              </div>
            )}

            <AnimatePresence>
              {dispatchStatus !== 'IDLE' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-green)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-green)', fontWeight: 700, marginBottom: '12px' }}>
                      {dispatchStatus === 'ARRIVED' ? 'UNIT ARRIVED' : 'UNIT EN ROUTE'}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{distance} km</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live ETA</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--alert-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}> {eta} min</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Expected Impact</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.9rem', color: '#fff' }}>Violations Removed</span>
                      <span style={{ fontWeight: 700, color: 'var(--success-green)' }}> 84</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem', color: '#fff' }}>Capacity Recovery</span>
                      <span style={{ fontWeight: 700, color: 'var(--success-green)' }}> 22%</span>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Dispatch Map */}
        <div style={{ width: '100%', height: '500px', minHeight: '500px', flexShrink: 0, overflow: 'hidden', borderRadius: '18px', background: '#FFFFFF', border: '1px solid #E5E7EB', position: 'relative' }}>
          <MapContainer center={[12.9550, 77.5880]} zoom={14} style={{ height: '100%', width: '100%', background: '#F8FAFC' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            
            {/* Police Station */}
            <CircleMarker center={policeStation} pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.8 }} radius={8}>
              <Popup>Dispatch Center</Popup>
            </CircleMarker>

            {/* Target Hotspot */}
            <CircleMarker center={targetHotspot} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 }} radius={20}>
              <Popup>MG Road Metro (Critical)</Popup>
            </CircleMarker>
            
            {/* Pulsing effect on target */}
            <CircleMarker center={targetHotspot} pathOptions={{ color: '#ef4444', fillOpacity: 0.2 }} radius={35} className="pulse-marker" />

            {/* Route Line */}
            {dispatchStatus !== 'IDLE' && (
              <Polyline positions={routePath} pathOptions={{ color: 'var(--electric-cyan)', weight: 4, dashArray: '10, 10' }} className="animated-path" />
            )}

            {/* Moving Truck */}
            {dispatchStatus !== 'IDLE' && (
              <Marker position={truckPosition} icon={customTruckIcon} />
            )}

          </MapContainer>

          {/* "Why This Recommendation?" Drawer */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 25 }}
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '380px', zIndex: 1000, background: 'rgba(5, 11, 20, 0.95)', backdropFilter: 'blur(10px)', borderLeft: '1px solid var(--electric-cyan)', padding: '24px', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     Recommendation Rationale
                  </h2>
                  <button onClick={() => setShowExplanation(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>Deploy Tow Unit #3 to MG Road</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--success-green)', fontWeight: 600 }}>AI Confidence: 92%</div>
                </div>

                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>Primary Drivers (SHAP)</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ color: 'var(--critical-red)', marginTop: '2px' }}>•</div>
                    <div><span style={{ color: '#fff', fontWeight: 600 }}>Highest Congestion Impact:</span> 142 active violations causing massive bottleneck.</div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ color: 'var(--critical-red)', marginTop: '2px' }}>•</div>
                    <div><span style={{ color: '#fff', fontWeight: 600 }}>Capacity Loss:</span> Road width is reduced by 31% during peak hours.</div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ color: 'var(--alert-orange)', marginTop: '2px' }}>•</div>
                    <div><span style={{ color: '#fff', fontWeight: 600 }}>Escalation Risk:</span> XGBoost predicts +12% delay increase if unaddressed.</div>
                  </li>
                </ul>

                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>Expected Outcome</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-green)' }}>-22%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Congestion Reduction</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-green)' }}>-17 min</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Commuter Delay</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => { setShowExplanation(false); startDispatch(); }}
                  style={{ 
                    marginTop: 'auto', width: '100%', padding: '16px', background: 'var(--electric-cyan)', color: '#000', 
                    border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                  }}
                >
                   EXECUTE DEPLOYMENT
                </button>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
};

export default EnforcementOptimizer;
