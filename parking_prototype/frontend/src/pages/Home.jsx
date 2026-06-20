import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- MAIN HOME COMPONENT ---
const Home = () => {
  const navigate = useNavigate();
  const container = useRef(null);

  const [liveMetrics, setLiveMetrics] = useState({
    spot1: { risk: 94, violations: 34468, capacity: 31, name: 'Upparpet' },
    spot2: { risk: 91, delay: 14, violations: 28044, name: 'Shivajinagar' },
    spot3: { risk: 88, violations: 22200, recovery: 18, name: 'Malleshwaram' },
    kpis: { violations: 82300, hotspots: 40, capacityLost: 37.9, recoveryIdx: 77 },
    impact: { historical: 300, accuracy: 92.4, congestion: 18.2, zones: 42, units: 24, delay: 12.4, enforcement: 14.1, emission: 11.3 }
  });

  const [mapSpots, setMapSpots] = useState([
    { id: 1, name: "Upparpet - Red Hotspot", lat: 12.9777, lng: 77.5805, color: '#DC2626', radius: 10 },
    { id: 2, name: "Shivajinagar - Red Hotspot", lat: 12.9816, lng: 77.6081, color: '#DC2626', radius: 10 },
    { id: 3, name: "Malleshwaram - Orange Hotspot", lat: 13.0108, lng: 77.5544, color: '#F59E0B', radius: 8 },
    { id: 4, name: "Patrol Unit #4 - Majestic", lat: 12.9780, lng: 77.5700, color: '#2563EB', radius: 6 },
    { id: 5, name: "Patrol Unit #2 - Vasanth Nagar", lat: 12.9850, lng: 77.5950, color: '#2563EB', radius: 6 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        spot1: { 
          ...prev.spot1,
          risk: Math.max(80, Math.min(99, prev.spot1.risk + Math.floor(Math.random() * 5) - 2)),
          violations: prev.spot1.violations + Math.floor(Math.random() * 3),
          capacity: Math.max(20, Math.min(50, prev.spot1.capacity + Math.floor(Math.random() * 3) - 1))
        },
        spot2: { 
          ...prev.spot2,
          risk: Math.max(80, Math.min(99, prev.spot2.risk + Math.floor(Math.random() * 5) - 2)),
          delay: Math.max(10, Math.min(30, prev.spot2.delay + Math.floor(Math.random() * 3) - 1)),
          violations: prev.spot2.violations + Math.floor(Math.random() * 3)
        },
        spot3: { 
          ...prev.spot3,
          risk: Math.max(80, Math.min(99, prev.spot3.risk + Math.floor(Math.random() * 5) - 2)),
          violations: prev.spot3.violations + Math.floor(Math.random() * 3),
          recovery: Math.max(10, Math.min(40, prev.spot3.recovery + Math.floor(Math.random() * 3) - 1))
        },
        kpis: {
          violations: prev.kpis.violations + Math.floor(Math.random() * 5),
          hotspots: Math.max(30, Math.min(50, prev.kpis.hotspots + Math.floor(Math.random() * 3) - 1)),
          capacityLost: parseFloat(Math.max(35.0, Math.min(45.0, prev.kpis.capacityLost + (Math.random() * 0.4 - 0.2))).toFixed(1)),
          recoveryIdx: Math.max(70, Math.min(90, prev.kpis.recoveryIdx + Math.floor(Math.random() * 3) - 1))
        },
        impact: {
          historical: prev.impact.historical + Math.floor(Math.random() * 3),
          accuracy: Math.max(90.0, Math.min(99.9, prev.impact.accuracy + (Math.random() * 0.4 - 0.2))),
          congestion: Math.max(15.0, Math.min(25.0, prev.impact.congestion + (Math.random() * 0.4 - 0.2))),
          zones: Math.max(40, Math.min(50, prev.impact.zones + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
          units: Math.max(20, Math.min(30, prev.impact.units + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
          delay: Math.max(10.0, Math.min(20.0, prev.impact.delay + (Math.random() * 0.4 - 0.2))),
          enforcement: Math.max(10.0, Math.min(20.0, prev.impact.enforcement + (Math.random() * 0.4 - 0.2))),
          emission: Math.max(8.0, Math.min(15.0, prev.impact.emission + (Math.random() * 0.4 - 0.2))),
        }
      }));

      setMapSpots(prev => prev.map(spot => ({
        ...spot,
        radius: spot.color === '#2563EB' ? spot.radius : Math.max(6, Math.min(14, spot.radius + (Math.random() > 0.5 ? 1 : -1)))
      })));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    // 1. Hero Animation
    const tl = gsap.timeline();
    tl.fromTo('.hero-logo', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' })
      .fromTo('.hero-sublabel', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-title-word', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .fromTo('.hero-btns button', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.6');

    // Section reveals
    const sections = gsap.utils.toArray('.reveal-section');
    sections.forEach(sec => {
      gsap.fromTo(sec, 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 85%' } }
      );
    });

    // Staggered Cards (used multiple times)
    const staggerGrids = gsap.utils.toArray('.stagger-grid');
    staggerGrids.forEach(grid => {
      gsap.fromTo(grid.children, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: grid, start: 'top 85%' } }
      );
    });

    // Number counters - start with final HTML, animate via proxy object on scroll
    // (Removed static GSAP counter code because we are using dynamic live state now)

  }, { scope: container });

  return (
    <div ref={container} style={{ width: '100%', minHeight: '100vh', background: '#F7F8FA', color: '#111827', overflowX: 'hidden', position: 'relative' }}>
      
      {/* 3D BACKGROUND */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <Sparkles count={150} scale={12} size={1.5} speed={0.4} color="#2563EB" opacity={0.4} />
        </Canvas>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* HERO SECTION */}
        <section style={{ height: '100vh', minHeight: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '850px', margin: '0 auto', paddingX: '24px' }}>
          <div className="hero-logo" style={{ width: '60px', height: '60px', background: '#FFFFFF', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', color: '#111827', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
            BTP
          </div>
          <div className="hero-sublabel" style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '20px' }}>
            BENGALURU TRAFFIC POLICE
          </div>
          <h1 style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            <span className="hero-title-word" style={{ display: 'inline-block', marginRight: '16px' }}>Predictive</span> 
            <span className="hero-title-word" style={{ display: 'inline-block' }}>Parking</span><br/>
            <span className="hero-title-word" style={{ background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', marginRight: '16px' }}>Intelligence</span> 
            <span className="hero-title-word" style={{ background: 'linear-gradient(90deg, #0D9488 0%, #16A34A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Engine</span>
          </h1>
          <p className="hero-desc" style={{ fontSize: '24px', color: '#6B7280', lineHeight: 1.5, maxWidth: '750px', marginBottom: '48px', fontWeight: 400 }}>
            AI-powered congestion prediction and parking enforcement optimization for Bengaluru city.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)'; }}
              style={{ padding: '16px 32px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 12px rgba(37,99,235,0.1)' }}
            >
              Launch Command Center
            </button>
            <button 
              onClick={() => { document.getElementById('live-city').scrollIntoView({ behavior: 'smooth' }); }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
              style={{ padding: '16px 32px', background: '#FFFFFF', color: '#111827', border: '1px solid #E5E7EB', borderRadius: '50px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              View Live Intelligence
            </button>
          </div>
        </section>

        {/* SECTION 1: LIVE CITY OVERVIEW */}
        <section id="live-city" className="reveal-section" style={{ maxWidth: '1100px', margin: '0 auto 100px', padding: '0 24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '32px' }}>Live City Intelligence</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '60% 38%', gap: '2%' }}>
            
            {/* Map */}
            <div style={{ height: '450px', background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {mapSpots.map(spot => (
                  <CircleMarker key={spot.id} center={[spot.lat, spot.lng]} pathOptions={{ color: spot.color, fillColor: spot.color, fillOpacity: spot.color === '#2563EB' ? 1 : 0.8 }} radius={spot.radius}>
                    <Popup>{spot.name}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {/* KPI Cards */}
            <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: "Today's Violations", val: liveMetrics.kpis.violations.toLocaleString(), color: '#DC2626' },
                { label: "Active Hotspots", val: liveMetrics.kpis.hotspots, color: '#F59E0B' },
                { label: "Capacity Lost", val: `${liveMetrics.kpis.capacityLost}%`, color: '#DC2626' },
                { label: "Congestion Recovery Index", val: liveMetrics.kpis.recoveryIdx, color: '#16A34A' }
              ].map((kpi, i) => (
                <div key={i} style={{ background: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: kpi.color }}></div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>{kpi.label}</div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>{kpi.val}</div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* SECTION 2: AI WORKFLOW */}
        <section className="reveal-section" style={{ maxWidth: '1100px', margin: '0 auto 100px', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '60px' }}>How the AI Works</h2>
          <div className="stagger-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '24px', left: '50px', right: '50px', height: '2px', background: '#2563EB', opacity: 0.2, zIndex: 0 }}></div>
            
            {[
              { title: 'Data Ingested', desc: 'Violation datasets', icon: '📊' },
              { title: 'Hotspot Generated', desc: 'Cluster analysis', icon: '📍' },
              { title: 'Congestion Predicted', desc: 'Flow forecast', icon: '📉' },
              { title: 'Risk Score Calculated', desc: 'Severity ranked', icon: '⚠️' },
              { title: 'AI Recommendation', desc: 'Action suggested', icon: '💡' },
              { title: 'Tow Unit Deployed', desc: 'Issue resolved', icon: '🚛' }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '15%', zIndex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFFFFF', border: '2px solid #2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '16px', boxShadow: '0 4px 12px rgba(37,99,235,0.1)' }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{step.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: REAL-TIME CITY SNAPSHOTS */}
        <section className="reveal-section" style={{ maxWidth: '1100px', margin: '0 auto 100px', padding: '0 24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '32px' }}>Real-Time City Snapshots</h2>
          <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            
            <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>{liveMetrics.spot1.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><span style={{ color: '#6B7280' }}>Risk Score</span><span style={{ fontWeight: 700, color: '#DC2626', transition: 'color 0.3s ease' }}>{liveMetrics.spot1.risk}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><span style={{ color: '#6B7280' }}>Violations</span><span style={{ fontWeight: 600, color: '#111827', transition: 'color 0.3s ease' }}>{liveMetrics.spot1.violations.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Capacity Loss</span><span style={{ fontWeight: 600, color: '#111827', transition: 'color 0.3s ease' }}>{liveMetrics.spot1.capacity}%</span></div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>{liveMetrics.spot2.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><span style={{ color: '#6B7280' }}>Risk Score</span><span style={{ fontWeight: 700, color: '#DC2626', transition: 'color 0.3s ease' }}>{liveMetrics.spot2.risk}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><span style={{ color: '#6B7280' }}>Delay</span><span style={{ fontWeight: 600, color: '#111827', transition: 'color 0.3s ease' }}>{liveMetrics.spot2.delay} min</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Violations</span><span style={{ fontWeight: 600, color: '#111827', transition: 'color 0.3s ease' }}>{liveMetrics.spot2.violations.toLocaleString()}</span></div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>{liveMetrics.spot3.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><span style={{ color: '#6B7280' }}>Risk Score</span><span style={{ fontWeight: 700, color: '#F59E0B', transition: 'color 0.3s ease' }}>{liveMetrics.spot3.risk}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><span style={{ color: '#6B7280' }}>Violations</span><span style={{ fontWeight: 600, color: '#111827', transition: 'color 0.3s ease' }}>{liveMetrics.spot3.violations.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Recovery</span><span style={{ fontWeight: 600, color: '#16A34A', transition: 'color 0.3s ease' }}>{liveMetrics.spot3.recovery}%</span></div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: AI CAPABILITIES */}
        <section className="reveal-section" style={{ maxWidth: '1100px', margin: '0 auto 100px', padding: '0 24px' }}>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '32px' }}>AI Capabilities</h2>
           <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>📍</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Hotspot Detection</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.5 }}>Detect illegal parking clusters.</p>
              </div>
              <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>📈</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Congestion Prediction</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.5 }}>Forecast traffic impact.</p>
              </div>
              <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>💡</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Enforcement Recommendation</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.5 }}>Suggest optimal deployment.</p>
              </div>
              <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>⚡</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Impact Simulation</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.5 }}>Estimate congestion reduction.</p>
              </div>
           </div>
        </section>

      </div>

    </div>
  );
};

export default Home;
