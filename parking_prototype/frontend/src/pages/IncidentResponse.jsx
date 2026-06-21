import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const IncidentResponse = () => {
  const containerRef = useRef(null);
  const [allHotspots, setAllHotspots] = useState([]);
  const [topHotspot, setTopHotspot] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState('pending'); // 'pending', 'authorized', 'manual_review'
  const [currentTime, setCurrentTime] = useState('');

  const [pastTimes, setPastTimes] = useState({ t1: '...', t2: '...', t3: '...' });

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/hotspots');
        const data = await res.json();
        if(data.hotspots && data.hotspots.length > 0) {
          setAllHotspots(data.hotspots);
          setTopHotspot(data.hotspots[0]);
        }
      } catch (e) { console.error(e); }
    };
    fetchTop();
    
    // Set current time for the timestamp
    const now = new Date();
    setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);

    const t3 = new Date(now.getTime() - 2 * 60000); // 2 mins ago
    const t2 = new Date(t3.getTime() - 3 * 60000); // 5 mins ago
    const t1 = new Date(t2.getTime() - 7 * 60000); // 12 mins ago

    const formatTime = (d) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    
    setPastTimes({
      t1: formatTime(t1),
      t2: formatTime(t2),
      t3: formatTime(t3)
    });
  }, []);

  const timelineSteps = [
    { time: pastTimes.t1, title: 'Violation Detected', desc: `Illegal parking detected near ${topHotspot ? topHotspot.locationName : 'outer ring road'}.`, status: 'past' },
    { time: pastTimes.t2, title: 'Road Capacity Reduced', desc: 'Capacity dropped by 31% due to blockage.', status: 'past' },
    { time: pastTimes.t3, title: 'Congestion Predicted', AI: true, desc: 'AI forecast: Severe gridlock in 20 mins.', status: dispatchStatus === 'pending' ? 'current' : 'past' },
    { 
      time: dispatchStatus === 'authorized' ? currentTime : dispatchStatus === 'manual_review' ? currentTime : 'Pending', 
      title: dispatchStatus === 'manual_review' ? 'Manual Review Requested' : 'Tow Dispatched', 
      desc: dispatchStatus === 'authorized' ? 'Tow unit #04 is en route.' : dispatchStatus === 'manual_review' ? 'Sent to Senior Commander for review.' : 'Awaiting command center approval.', 
      status: dispatchStatus === 'authorized' ? 'current' : dispatchStatus === 'manual_review' ? 'current' : 'future' 
    },
    { 
      time: 'Pending', 
      title: 'Recovery Achieved', 
      desc: 'Restoration of normal traffic flow.', 
      status: 'future' 
    }
  ];

  useGSAP(() => {
    gsap.from('.anim-fade', {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
    });
    
    gsap.from('.timeline-item', {
      x: -20, opacity: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out', delay: 0.3
    });
  }, { scope: containerRef });

  const delayWithout = topHotspot ? Math.max(25, Math.round(topHotspot.total_violations / 4)) : 42;
  const delayWith = topHotspot ? Math.max(8, Math.round(topHotspot.total_violations / 15)) : 12;

  const handleAuthorize = () => {
    setDispatchStatus('authorized');
  };

  const handleManualReview = () => {
    setDispatchStatus('manual_review');
  };

  return (
    <div className="page-container" ref={containerRef}>
      
      <div className="anim-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Incident Response</h1>
          <span style={{ color: 'var(--text-secondary)' }}>Live operations workflow and resource dispatch tracking.</span>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '8px' }}>Select Monitored Location:</label>
          <select 
            value={topHotspot?.locationName || ''} 
            onChange={(e) => {
              const selected = allHotspots.find(h => h.locationName === e.target.value);
              setTopHotspot(selected);
              setDispatchStatus('pending'); // Reset timeline when location changes
            }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--card-bg)', cursor: 'pointer' }}
          >
            {allHotspots.map(h => (
              <option key={h.locationName} value={h.locationName}>
                {h.locationName} ({h.total_violations} Violations)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Timeline */}
        <div className="card anim-fade" style={{ display: 'flex', flexDirection: 'column' }}>
           <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>Incident Workflow</h2>
           
           <div style={{ position: 'relative', paddingLeft: '24px', flex: 1 }}>
              <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: 'var(--border-color)' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {timelineSteps.map((step, i) => (
                  <div key={i} className="timeline-item" style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%',
                      background: step.status === 'past' ? 'var(--success)' : step.status === 'current' ? 'var(--warning)' : 'var(--card-bg)',
                      border: `2px solid ${step.status === 'future' ? 'var(--border-color)' : 'transparent'}`,
                      boxShadow: step.status === 'current' ? '0 0 0 4px rgba(245, 158, 11, 0.2)' : 'none'
                    }}></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, color: step.status === 'future' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {step.title} {step.AI && <span style={{ background: '#EFF6FF', color: 'var(--primary-blue)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px' }}>AI</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{step.time}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{step.desc}</div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Right Column: Dispatch Panel & Before/After */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card anim-fade" style={{ background: '#F8FAFC' }}>
             <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>AI Dispatch Recommendation</h2>
             <p style={{ fontSize: '14px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
               Deploying Heavy Tow Unit #04 to {topHotspot ? topHotspot.locationName : 'Marathahalli Bridge'} will clear the blockage before peak traffic hits.
             </p>
             <div style={{ display: 'flex', gap: '16px' }}>
               <button 
                  onClick={handleAuthorize} 
                  disabled={dispatchStatus !== 'pending'}
                  className="primary-btn" 
                  style={{ flex: 1, opacity: dispatchStatus !== 'pending' ? 0.5 : 1, cursor: dispatchStatus !== 'pending' ? 'not-allowed' : 'pointer' }}>
                  {dispatchStatus === 'authorized' ? 'Authorized ✓' : 'Authorize Dispatch'}
               </button>
               <button 
                  onClick={handleManualReview}
                  disabled={dispatchStatus !== 'pending'}
                  className="secondary-btn" 
                  style={{ flex: 1, opacity: dispatchStatus !== 'pending' ? 0.5 : 1, cursor: dispatchStatus !== 'pending' ? 'not-allowed' : 'pointer' }}>
                  {dispatchStatus === 'manual_review' ? 'In Review ⏳' : 'Request Manual Review'}
               </button>
             </div>
          </div>

          <div className="card anim-fade" style={{ flex: 1 }}>
             <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>Deployment Impact (Forecast)</h2>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', padding: '24px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                  <div style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600, marginBottom: '8px' }}>Without Action</div>
                  <div className="metric-number" style={{ color: 'var(--danger)' }}>{delayWithout} mins</div>
                  <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>Peak Travel Delay</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0FDF4', padding: '24px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                  <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600, marginBottom: '8px' }}>With AI Dispatch</div>
                  <div className="metric-number" style={{ color: 'var(--success)' }}>{delayWith} mins</div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>Peak Travel Delay</div>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default IncidentResponse;
