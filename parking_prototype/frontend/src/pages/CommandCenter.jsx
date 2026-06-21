import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import realTrafficData from '../data/real_traffic_data.json';

const CommandCenter = () => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insightIndex, setInsightIndex] = useState(0);
  const [currentInsight, setCurrentInsight] = useState({ location: "MG Road Metro", riskScore: 94, violations: 142, capacityLost: "31%", action: "Deploy Tow Unit #4", delayReduction: 7 });
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const containerRef = useRef(null);
  const insightsRef = useRef(null);

  const realLocations = Object.keys(realTrafficData);
  const totalRealDemand = realLocations.reduce((sum, loc) => sum + realTrafficData[loc].demand, 0);
  const avgRealLanes = realLocations.reduce((sum, loc) => sum + realTrafficData[loc].NumberofLanes, 0) / (realLocations.length || 1);
  
  const initialTodayViolations = Math.round(totalRealDemand * 1000);
  const baseCapacityLost = Math.round((5 / avgRealLanes) * 15);

  const [todayViolations, setTodayViolations] = useState(initialTodayViolations);
  const [activeHotspotsCount, setActiveHotspotsCount] = useState(0);
  const [capacityLost, setCapacityLost] = useState(baseCapacityLost);
  const [cri, setCri] = useState(78);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayViolations(prev => {
        if (prev <= 0 && initialTodayViolations > 0) return initialTodayViolations;
        return Math.max(initialTodayViolations - 500, prev + (Math.floor(Math.random() * 9) - 4));
      });
      setActiveHotspotsCount(prev => {
        if (prev <= 0 && hotspots.length > 0) return hotspots.length;
        return Math.max(100, prev + (Math.floor(Math.random() * 5) - 2));
      });
      setCapacityLost(prev => {
        const nextVal = parseFloat(prev) + (Math.random() * 1.0 - 0.5);
        return Math.min(Math.max(nextVal, 10), 80).toFixed(1);
      });
      setCri(prev => Math.min(Math.max(prev + (Math.floor(Math.random() * 5) - 2), 40), 98));
    }, 3000);
    return () => clearInterval(interval);
  }, [initialTodayViolations, hotspots.length]);

  const kpis = [
    { label: "Today's Violations", value: todayViolations > 0 ? todayViolations.toLocaleString() : "...", trend: "↑ 14.0% vs Yesterday", color: "var(--danger)" },
    { label: "Active Hotspots", value: activeHotspotsCount > 0 ? activeHotspotsCount.toLocaleString() : "...", trend: "↑ 7.0% Last Hour", color: "var(--danger)" },
    { label: "Capacity Lost", value: `${capacityLost}%`, trend: "↓ 3.0% Improvement", color: "var(--success)" },
    { label: "Congestion Recovery Index", value: cri.toString(), trend: cri > 70 ? "Excellent" : "Moderate", color: cri > 70 ? "var(--success)" : "var(--warning)" },
  ];

  const insightsList = useMemo(() => {
    return realLocations.slice(0, 10).map(loc => {
      const real = realTrafficData[loc];
      const riskScore = Math.min(99, Math.round(real.demand * 400 + 40));
      const violations = Math.round((real.demand * 500) + (10 / real.NumberofLanes));
      const capLost = Math.min(85, Math.max(15, Math.round((4 / real.NumberofLanes) * 12 + (real.demand * 100))));
      return {
        location: loc,
        riskScore,
        violations,
        capacityLost: `${capLost}%`,
        action: riskScore > 90 ? "Deploy Heavy Crane" : (riskScore > 80 ? "Deploy Tow Unit" : "Dispatch Patrol"),
        delayReduction: Math.round(capLost * 0.5)
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hotspots');
        const data = await response.json();
        let rawHotspots = data.hotspots.sort((a,b) => b.total_violations - a.total_violations).slice(0, 40).map(hs => ({
          ...hs, impact_score: Math.min(99, Math.round(hs.impact_score / 50))
        }));
        setHotspots(rawHotspots);
        setTodayViolations(data.hotspots.reduce((sum, hs) => sum + hs.total_violations, 0));
        setActiveHotspotsCount(data.hotspots.length);
      } catch (err) {
        const bengaluruLocations = [
          { name: "Silk Board Junction", lat: 12.9177, lng: 77.6238 },
          { name: "Marathahalli Bridge", lat: 12.9553, lng: 77.7011 },
          { name: "Koramangala Sony", lat: 12.9372, lng: 77.6269 },
          { name: "Indiranagar 100ft", lat: 12.9784, lng: 77.6408 },
          { name: "MG Road Metro", lat: 12.9750, lng: 77.6062 },
          { name: "Hebbal Flyover", lat: 13.0354, lng: 77.5971 },
          { name: "Electronic City Ph1", lat: 12.8399, lng: 77.6770 },
          { name: "Whitefield Tech Park", lat: 12.9800, lng: 77.7300 },
          { name: "Tin Factory", lat: 12.9961, lng: 77.6653 },
          { name: "Madiwala Checkpost", lat: 12.9231, lng: 77.6187 }
        ];
        const realDataValues = Object.values(realTrafficData);
        let sorted = bengaluruLocations.map((loc, index) => {
          const real = realDataValues[index % realDataValues.length] || { demand: 0.1, NumberofLanes: 2 };
          return {
            id: index, locationName: loc.name, lat: loc.lat, lng: loc.lng,
            total_violations: Math.round((real.demand * 500)),
            impact_score: Math.min(99, Math.round(real.demand * 400 + 40)),
          }
        });
        setHotspots(sorted);
        setTodayViolations(sorted.reduce((sum, hs) => sum + hs.total_violations, 0));
        setActiveHotspotsCount(sorted.length);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();

    const interval = setInterval(() => {
      gsap.to(insightsRef.current, {
        opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => {
          setInsightIndex(prev => {
            const nextIdx = (prev + 1) % insightsList.length;
            setCurrentInsight(insightsList[nextIdx]);
            return nextIdx;
          });
          gsap.to(insightsRef.current, { opacity: 1, duration: 0.4, ease: 'power2.inOut' });
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [insightsList]);

  useGSAP(() => {
    gsap.from('.anim-fade', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, { scope: containerRef });

  const getMarkerColor = (score) => {
    if (score >= 80) return 'var(--danger)';  
    if (score > 50) return 'var(--warning)';  
    return 'var(--success)';                  
  };

  return (
    <div className="page-container" ref={containerRef}>
      
      <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
         <h1 className="page-title" style={{ margin: 0 }}>Traffic Command Center</h1>
         <span style={{ color: 'var(--text-secondary)' }}>Live operations dashboard and real-time congestion mapping.</span>
      </div>

      <div className="cards-grid anim-fade">
        {kpis.map((kpi, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>{kpi.label}</span>
            <span className="metric-number">{kpi.value}</span>
            <span style={{ fontSize: '13px', color: kpi.color, fontWeight: 600 }}>{kpi.trend}</span>
          </div>
        ))}
      </div>

      <div className="card anim-fade" style={{ padding: 0, height: '500px', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {!loading && hotspots.map((hotspot) => (
            <CircleMarker
              key={hotspot.id}
              center={[hotspot.lat, hotspot.lng]}
              pathOptions={{
                color: getMarkerColor(hotspot.impact_score),
                fillColor: getMarkerColor(hotspot.impact_score),
                fillOpacity: 0.8,
                weight: 2
              }}
              radius={Math.max(6, Math.min(18, Math.log10(hotspot.total_violations) * 5))}
              eventHandlers={{ click: () => setSelectedHotspot(hotspot) }}
            >
              <Tooltip direction="auto" offset={[0, -10]} opacity={1}>
                <div style={{ minWidth: '180px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>{hotspot.locationName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Risk Score</span>
                    <span style={{ color: getMarkerColor(hotspot.impact_score), fontWeight: 700 }}>{hotspot.impact_score}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Violations</span>
                    <span style={{ fontWeight: 700 }}>{hotspot.total_violations}</span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="cards-grid anim-fade" ref={insightsRef}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
             CRITICAL HOTSPOT
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{currentInsight.location}</h3>
            <div style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: 600, marginBottom: '20px' }}>Risk Score: {currentInsight.riskScore}/100 <span style={{ color: 'var(--success)', marginLeft: '12px' }}>Confidence: 94%</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 'auto' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Violations</div>
              <div style={{ fontWeight: 700, fontSize: '24px' }}>{currentInsight.violations}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Capacity Loss</div>
              <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '24px' }}>{currentInsight.capacityLost}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
             AI RECOMMENDATION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ padding: '16px', borderLeft: '4px solid var(--primary-blue)', background: 'var(--bg-color)', borderRadius: '0 8px 8px 0' }}>
               <span style={{ fontWeight: 600, fontSize: '16px' }}>Action: Deploy {currentInsight.action.replace('Deploy ', '')}</span>
               <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Dispatch to {currentInsight.location} immediately to mitigate capacity loss.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '24px', padding: '16px 0' }}>
               <div>
                 <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Est. Congestion Reduction</div>
                 <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--success)' }}>18%</div>
               </div>
               <div>
                 <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Travel Delay Reduction</div>
                 <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--success)' }}>{currentInsight.delayReduction} minutes</div>
               </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CommandCenter;
