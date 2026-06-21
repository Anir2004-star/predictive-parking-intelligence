import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const IncidentResponse = () => {
  const containerRef = useRef(null);

  const timelineSteps = [
    { time: '14:05', title: 'Violation Detected', desc: 'Illegal parking detected on outer ring road.', status: 'past' },
    { time: '14:12', title: 'Road Capacity Reduced', desc: 'Capacity dropped by 31% due to blockage.', status: 'past' },
    { time: '14:15', title: 'Congestion Predicted', AI: true, desc: 'AI forecast: Severe gridlock in 20 mins.', status: 'current' },
    { time: 'Pending', title: 'Tow Dispatched', desc: 'Awaiting command center approval.', status: 'future' },
    { time: 'Pending', title: 'Recovery Achieved', desc: 'Restoration of normal traffic flow.', status: 'future' }
  ];

  useGSAP(() => {
    gsap.from('.anim-fade', {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
    });
    
    gsap.from('.timeline-item', {
      x: -20, opacity: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out', delay: 0.3
    });
  }, { scope: containerRef });

  return (
    <div className="page-container" ref={containerRef}>
      
      <div className="anim-fade" style={{ marginBottom: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Incident Response</h1>
        <span style={{ color: 'var(--text-secondary)' }}>Live operations workflow and resource dispatch tracking.</span>
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
               Deploying Heavy Tow Unit #04 to Marathahalli Bridge will clear the blockage before peak traffic hits.
             </p>
             <div style={{ display: 'flex', gap: '16px' }}>
               <button className="primary-btn" style={{ flex: 1 }}>Authorize Dispatch</button>
               <button className="secondary-btn" style={{ flex: 1 }}>Request Manual Review</button>
             </div>
          </div>

          <div className="card anim-fade" style={{ flex: 1 }}>
             <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>Deployment Impact (Forecast)</h2>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', padding: '24px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                  <div style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600, marginBottom: '8px' }}>Without Action</div>
                  <div className="metric-number" style={{ color: 'var(--danger)' }}>42 mins</div>
                  <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>Peak Travel Delay</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0FDF4', padding: '24px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                  <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600, marginBottom: '8px' }}>With AI Dispatch</div>
                  <div className="metric-number" style={{ color: 'var(--success)' }}>12 mins</div>
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
