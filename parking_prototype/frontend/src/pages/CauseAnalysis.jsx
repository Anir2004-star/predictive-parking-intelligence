import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';


const bengaluruLocations = [
  "Silk Board Junction", "Marathahalli Bridge", "Koramangala Sony", "Indiranagar 100ft",
  "MG Road Metro", "Hebbal Flyover", "Electronic City Ph1", "Whitefield Tech Park",
  "Tin Factory", "Madiwala Checkpost", "KR Puram Station", "Majestic Station",
  "Richmond Circle", "Domlur Flyover", "Bellandur ORR", "HSR Layout Sector 1",
  "Jayanagar 4th Block", "BTM Layout Tank", "Yeshwanthpur", "Peenya Ind Area",
  "Kalyan Nagar", "Banashankari", "Malleswaram 8th Cross", "Basavanagudi",
  "Kengeri Satellite Town", "Yelahanka New Town", "Jalahalli Cross", "Vidyaranyapura",
  "Sahakarnagar", "Hennur Cross", "Mahadevapura", "Kundalahalli Gate",
  "Brookefield", "Hoodi Circle", "Kaggadasapura", "CV Raman Nagar",
  "Ulsoor Lake", "Shivajinagar", "Frazer Town", "Cox Town"
];

const CauseAnalysis = () => {
  const [selectedLocation, setSelectedLocation] = useState(bengaluruLocations[0]);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  // Radar Data Generation
  const radarData = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < selectedLocation.length; i++) {
      hash = selectedLocation.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seedRandom = (seed) => {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    let hashVal = hash;
    const rng = () => seedRandom(hashVal++);

    return [
      { subject: 'Carriageway Blockage', A: Math.round(rng() * 60 + 40), fullMark: 100 },
      { subject: 'Commercial Freight', A: Math.round(rng() * 70 + 20), fullMark: 100 },
      { subject: 'Volume Surge', A: Math.round(rng() * 50 + 50), fullMark: 100 },
      { subject: 'Pedestrian Spillover', A: Math.round(rng() * 60 + 10), fullMark: 100 },
      { subject: 'Intersection Choke', A: Math.round(rng() * 50 + 40), fullMark: 100 },
      { subject: 'Transit Delay', A: Math.round(rng() * 40 + 30), fullMark: 100 },
    ];
  }, [selectedLocation]);

  const topAnomaly = [...radarData].sort((a, b) => b.A - a.A)[0];

  // Terminal Simulator
  useEffect(() => {
    setLogs([`[SYSTEM] Initializing telemetry feed for ${selectedLocation}...`]);
    const interval = setInterval(() => {
      const time = new Date().toISOString().substring(11, 19);
      const logTypes = [
        `[${time}] SYNC_TENSOR_MATCH: Vehicle anomaly mapped -> Conf: ${(Math.random() * 5 + 94).toFixed(1)}%`,
        `[${time}] SPATIAL_ALERT: Density cluster forming at sector ${Math.floor(Math.random() * 9 + 1)}.`,
        `[${time}] CV_NODE_ACTIVE: Tracking ${Math.floor(Math.random() * 20 + 5)} stationary objects on carriageway.`,
        `[${time}] PREDICTIVE_ENGINE: Calculating routing alternatives...`,
        `[${time}] WARNING: Flow velocity degraded by ${(Math.random() * 15 + 5).toFixed(1)}%.`
      ];
      const newLog = logTypes[Math.floor(Math.random() * logTypes.length)];
      setLogs(prev => [...prev.slice(-14), newLog]);
    }, 1200);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Intervention Vector
  const interventionCommand = useMemo(() => {
    const commands = {
      'Carriageway Blockage': "DEPLOY HEAVY TOW FLEET TO CLEARED ZONES. ISSUE DIGITAL E-CHALLANS VIA SURVEILLANCE GRID.",
      'Commercial Freight': "REROUTE HGV TRAFFIC TO PERIPHERAL BYPASS. ENFORCE NO-ENTRY TIMINGS FOR GOODS CARRIERS.",
      'Volume Surge': "ACTIVATE DYNAMIC SIGNAL TIMING (PHASE 4). DISPATCH RAPID RESPONSE TEAM TO CHOKE POINTS.",
      'Pedestrian Spillover': "DISPATCH GROUND PATROL FOR SIDEWALK CLEARANCE. ERECT TEMPORARY BARRICADES.",
      'Intersection Choke': "INITIATE MANUAL OVERRIDE ON JUNCTION SIGNALS. DEPLOY TRAFFIC WARDENS IMMEDIATELY.",
      'Transit Delay': "CLEAR BUS BAYS AND DEDICATED CORRIDORS. PENALIZE UNAUTHORIZED ENCROACHMENT."
    };
    return commands[topAnomaly.subject];
  }, [topAnomaly]);

  const networkNodes = [
    { title: topAnomaly.subject,  color: 'var(--critical-red)' },
    { title: "Capacity Attrition",  color: 'var(--alert-orange)' },
    { title: "Velocity Decay",  color: '#fcd34d' },
    { title: "Systemic Gridlock",  color: 'var(--electric-cyan)' }
  ];

  return (
    <div style={{ height: '100%', width: '100%', padding: '30px', overflowY: 'auto' }}>
      
      {/* Header and Dropdown */}
      <div style={{ paddingLeft: '50px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             Root Cause Synthesis
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Multi-dimensional AI telemetry and intervention generation.</p>
        </div>
        
        {/* Hotspot Selector Dropdown */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--electric-cyan)', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)' }}>
          
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}
          >
            {bengaluruLocations.map(loc => (
              <option key={loc} value={loc} style={{ background: '#050b14', color: '#fff' }}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Radar Chart Panel */}
        <div className="premium-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--electric-cyan)', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
               Anomaly Signature Vector
            </h2>
          </div>
          
          <div style={{ flex: 1, minHeight: '300px', background: 'radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)', borderRadius: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--electric-cyan)', borderRadius: '8px' }} />
                <Radar name="Threat Level" dataKey="A" stroke="var(--critical-red)" fill="var(--critical-red)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vision Telemetry Panel */}
        <div className="premium-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            
            <h2 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>Live Vision Telemetry</h2>
            <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-green)', boxShadow: '0 0 8px var(--success-green)', animation: 'pulse 1.5s infinite' }} />
          </div>
          
          <div style={{ flex: 1, padding: '20px', background: '#0a0a0a', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--success-green)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.map((log, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                {log}
              </motion.div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

      </div>

      {/* Horizontal Neural Flow */}
      <div className="premium-card" style={{ padding: '30px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           Causal Inference Pipeline
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {/* Animated Flow Line */}
          <div style={{ position: 'absolute', top: '50%', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
          <motion.div 
            style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '40px', height: '4px', width: '100px', background: 'linear-gradient(90deg, transparent, var(--electric-cyan), transparent)', zIndex: 1, borderRadius: '4px' }}
            animate={{ x: ['0%', '1000%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          />

          {networkNodes.map((node, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 2, background: 'var(--bg-dark)', padding: '0 10px' }}>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.2 }}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: `2px solid ${node.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.color, boxShadow: `0 0 15px ${node.color}40` }}
              >
                {node.icon}
              </motion.div>
              <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{node.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention Vector */}
      <motion.div 
        key={`intervention-${selectedLocation}`}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--critical-red)', borderRadius: '12px', display: 'flex', gap: '20px', alignItems: 'center' }}
      >
        <div style={{ background: 'var(--critical-red)', padding: '16px', borderRadius: '8px', color: '#fff', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}>
          
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--critical-red)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: 700 }}>Recommended Intervention Vector</h3>
          <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 500, margin: 0, fontFamily: 'monospace' }}>
            &gt; {interventionCommand}
          </p>
        </div>
      </motion.div>

    </div>
  );
};

export default CauseAnalysis;
