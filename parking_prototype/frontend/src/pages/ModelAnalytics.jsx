import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const ModelAnalytics = () => {
  const containerRef = useRef(null);

  const featureImportance = [
    { name: 'Time of Day', value: 85 },
    { name: 'Historical Demand', value: 78 },
    { name: 'Weather Condition', value: 62 },
    { name: 'Road Capacity', value: 55 },
    { name: 'Event Proximity', value: 40 }
  ];

  const modelMetrics = [
    { model: 'XGBoost (Prod)', acc: '94.2%', prec: '92.1%', rec: '95.4%', f1: '93.7%', lat: '45ms' },
    { model: 'LightGBM (Staging)', acc: '93.8%', prec: '91.5%', rec: '94.8%', f1: '93.1%', lat: '32ms' },
    { model: 'Random Forest (Legacy)', acc: '88.5%', prec: '86.2%', rec: '89.1%', f1: '87.6%', lat: '120ms' },
  ];

  useGSAP(() => {
    gsap.from('.anim-fade', {
      y: 15, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
    });
  }, { scope: containerRef });

  return (
    <div className="page-container" ref={containerRef}>
      
      <div className="anim-fade" style={{ marginBottom: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>ML Model Analytics</h1>
        <span style={{ color: 'var(--text-secondary)' }}>Performance metrics and explainability for congestion prediction models.</span>
      </div>

      <div className="cards-grid anim-fade" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Training Dataset</div>
           <div className="metric-number">300,000+</div>
           <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Verified violation records</div>
        </div>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Model</div>
           <div className="metric-number">XGBoost</div>
           <div style={{ fontSize: '12px', color: 'var(--success)' }}>V2.4 (Production)</div>
        </div>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Global Accuracy</div>
           <div className="metric-number">94.2%</div>
           <div style={{ fontSize: '12px', color: 'var(--success)' }}>+1.2% vs last month</div>
        </div>
        <div className="card">
           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Inference Latency</div>
           <div className="metric-number">45ms</div>
           <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>P99 on Edge Nodes</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left: Model Comparison */}
        <div className="card anim-fade" style={{ display: 'flex', flexDirection: 'column' }}>
           <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Model Comparison</h2>
           <div style={{ overflowX: 'auto' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
               <thead>
                 <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                   <th style={{ padding: '12px 8px' }}>Model</th>
                   <th style={{ padding: '12px 8px' }}>Accuracy</th>
                   <th style={{ padding: '12px 8px' }}>Precision</th>
                   <th style={{ padding: '12px 8px' }}>Recall</th>
                   <th style={{ padding: '12px 8px' }}>F1 Score</th>
                   <th style={{ padding: '12px 8px' }}>Latency</th>
                 </tr>
               </thead>
               <tbody>
                 {modelMetrics.map((m, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i === 0 ? '#EFF6FF' : 'transparent' }}>
                     <td style={{ padding: '12px 8px', fontWeight: 600, color: i === 0 ? 'var(--primary-blue)' : 'var(--text-primary)' }}>{m.model}</td>
                     <td style={{ padding: '12px 8px' }}>{m.acc}</td>
                     <td style={{ padding: '12px 8px' }}>{m.prec}</td>
                     <td style={{ padding: '12px 8px' }}>{m.rec}</td>
                     <td style={{ padding: '12px 8px' }}>{m.f1}</td>
                     <td style={{ padding: '12px 8px' }}>{m.lat}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* Right: Feature Importance */}
        <div className="card anim-fade" style={{ display: 'flex', flexDirection: 'column' }}>
           <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Feature Importance (SHAP Values)</h2>
           <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: 'var(--bg-color)'}} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--danger)' : index === 1 ? 'var(--warning)' : 'var(--primary-blue)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Bottom Left: Confusion Matrix Placeholder */}
        <div className="card anim-fade" style={{ display: 'flex', flexDirection: 'column' }}>
           <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Confusion Matrix</h2>
           <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px', fontSize: '13px', textAlign: 'center' }}>
             <div></div>
             <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Predicted Normal</div>
             <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Predicted Congestion</div>
             
             <div style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>Actual Normal</div>
             <div style={{ background: '#EFF6FF', padding: '24px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
               <div className="metric-number" style={{ fontSize: '24px' }}>14,205</div>
               <div style={{ color: 'var(--text-secondary)' }}>True Negatives</div>
             </div>
             <div style={{ background: '#FEF2F2', padding: '24px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
               <div className="metric-number" style={{ fontSize: '24px', color: 'var(--danger)' }}>184</div>
               <div style={{ color: 'var(--danger)' }}>False Positives</div>
             </div>

             <div style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>Actual Congestion</div>
             <div style={{ background: '#FEF2F2', padding: '24px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
               <div className="metric-number" style={{ fontSize: '24px', color: 'var(--danger)' }}>212</div>
               <div style={{ color: 'var(--danger)' }}>False Negatives</div>
             </div>
             <div style={{ background: '#F0FDF4', padding: '24px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
               <div className="metric-number" style={{ fontSize: '24px', color: 'var(--success)' }}>3,490</div>
               <div style={{ color: 'var(--success)' }}>True Positives</div>
             </div>
           </div>
        </div>

        {/* Bottom Right: AI Decision Explainability */}
        <div className="card anim-fade" style={{ display: 'flex', flexDirection: 'column' }}>
           <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>AI Explainability (Local Trace)</h2>
           <div style={{ flex: 1, background: '#1E293B', color: '#F8FAFC', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto' }}>
             <div>> INFERENCE TRACE ID: 894F-294A</div>
             <div>> MODEL: XGBoost_Prod_V2.4</div>
             <br/>
             <div style={{ color: '#4ADE80' }}>[PASS] Feature check: TimeOfDay=14:30</div>
             <div style={{ color: '#4ADE80' }}>[PASS] Feature check: HistoryDemand=High</div>
             <div style={{ color: '#F87171' }}>[WARN] Feature check: CapacityLoss=31% (Threshold=15%)</div>
             <br/>
             <div>> COMPUTING NODE WEIGHTS...</div>
             <div>> NODE 42: Split CapacityLoss > 20% -> TRUE (Weight: +2.4)</div>
             <div>> NODE 18: Split EventProximity < 2km -> FALSE (Weight: -0.2)</div>
             <br/>
             <div style={{ color: '#FACC15' }}>> LOGITS OUTPUT: 4.82</div>
             <div style={{ color: '#4ADE80', fontWeight: 'bold' }}>> FINAL PREDICTION: SEVERE_CONGESTION (Prob: 94.2%)</div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default ModelAnalytics;
