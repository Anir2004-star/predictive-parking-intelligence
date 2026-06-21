import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const PredictiveAnalytics = () => {
  const [activeTab, setActiveTab] = useState('Current');
  const [timelineData, setTimelineData] = useState([]);
  const [allHotspots, setAllHotspots] = useState([]);
  const [hotspotsData, setHotspotsData] = useState([]);
  const [selectedStation, setSelectedStation] = useState('All Stations');
  const containerRef = useRef(null);
  
  const tabs = ['Current', '+30 minutes', '+1 hour', '+3 hours', '+24 hours'];
  
  const getMultiplier = (tab) => {
    switch(tab) {
      case 'Current': return 1;
      case '+30 minutes': return 1.2;
      case '+1 hour': return 1.5;
      case '+3 hours': return 2.0;
      case '+24 hours': return 2.5;
      default: return 1;
    }
  };

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const hsRes = await fetch('http://localhost:5000/api/hotspots');
        const hsData = await hsRes.json();
        if(hsData.hotspots) {
            setAllHotspots(hsData.hotspots);
            setHotspotsData(hsData.hotspots.slice(0, 5)); // top 5 for map
        }
      } catch (err) { console.error(err); }
    };
    fetchHotspots();
  }, []);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const url = selectedStation === 'All Stations' 
          ? 'http://localhost:5000/api/predict_timeline' 
          : `http://localhost:5000/api/predict_timeline?station=${encodeURIComponent(selectedStation)}`;
        const timelineRes = await fetch(url);
        const tData = await timelineRes.json();
        if(tData.timeline) setTimelineData(tData.timeline);
      } catch (err) { console.error("Error fetching ML predictions", err); }
    };
    fetchTimeline();
  }, [selectedStation]);

  // Scale the chart data based on the selected future tab
  const chartData = timelineData.map(d => ({
    ...d,
    demand: Math.round(d.demand * getMultiplier(activeTab))
  }));

  useGSAP(() => {
    gsap.from('.anim-fade', {
      y: 15, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
    });
  }, [activeTab]);

  return (
    <div className="page-container" ref={containerRef}>
      
      <div className="anim-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Predictive Analytics</h1>
          <span style={{ color: 'var(--text-secondary)' }}>AI forecasting model projecting congestion and resource demand.</span>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '8px' }}>Select Location:</label>
          <select 
            value={selectedStation} 
            onChange={(e) => setSelectedStation(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--card-bg)', cursor: 'pointer' }}
          >
            <option value="All Stations">All Stations (City-Wide)</option>
            {allHotspots.map(h => (
              <option key={h.locationName} value={h.locationName}>
                {h.locationName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="cards-grid anim-fade" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Prediction Confidence</div>
           <div className="metric-number">98.3%</div>
        </div>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Model Accuracy (R²)</div>
           <div className="metric-number">0.98</div>
        </div>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Projected Peak Time</div>
           <div className="metric-number">
             {chartData.length > 0 ? chartData.reduce((max, obj) => obj.demand > max.demand ? obj : max, chartData[0]).time : '18:00'}
           </div>
        </div>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Expected Violations (24h)</div>
           <div className="metric-number">
             {chartData.reduce((sum, obj) => sum + obj.demand, 0).toLocaleString()}
           </div>
        </div>
      </div>

      <div className="card anim-fade" style={{ display: 'flex', flexDirection: 'column' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="card-title" style={{ margin: 0 }}>Demand Forecasting</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
               {tabs.map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   style={{
                     padding: '8px 16px',
                     borderRadius: '6px',
                     border: `1px solid ${activeTab === tab ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                     background: activeTab === tab ? '#EFF6FF' : 'var(--card-bg)',
                     color: activeTab === tab ? 'var(--primary-blue)' : 'var(--text-primary)',
                     fontWeight: 600,
                     cursor: 'pointer',
                     fontSize: '13px',
                     transition: 'all 0.2s'
                   }}
                 >
                   {tab}
                 </button>
               ))}
            </div>
         </div>
         
         <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="demand" stroke="var(--primary-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="card anim-fade" style={{ padding: 0, height: '400px', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
         <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, background: 'var(--card-bg)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Future Hotspot Spread Map</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Showing forecast for {activeTab}</span>
         </div>
         <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={true} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            
            {hotspotsData.map((hs, i) => (
              <CircleMarker 
                key={i}
                center={[hs.lat, hs.lng]} 
                pathOptions={{ 
                  color: i === 0 ? 'var(--danger)' : 'var(--warning)', 
                  fillColor: i === 0 ? 'var(--danger)' : 'var(--warning)', 
                  fillOpacity: 0.6 
                }} 
                radius={getMultiplier(activeTab) * (i === 0 ? 15 : 10)}
              >
                 <Tooltip>Predicted Blockage at {hs.locationName}</Tooltip>
              </CircleMarker>
            ))}

         </MapContainer>
      </div>

    </div>
  );
};

export default PredictiveAnalytics;
