import React from 'react';
import { motion } from 'framer-motion';


const ExecutiveSummary = () => {
  const pipelineSteps = [
    {  title: "Violations", desc: "Data Ingestion" },
    {  title: "Detection", desc: "Hotspot Clustering" },
    {  title: "Impact", desc: "Congestion Scoring" },
    {  title: "Prediction", desc: "Risk Forecasting" },
    {  title: "Enforcement", desc: "AI Optimization" },
    {  title: "Reduction", desc: "CRI Calculation" }
  ];

  return (
    <div style={{ height: '100%', width: '100%', padding: '40px', overflowY: 'auto', background: 'radial-gradient(circle at top right, rgba(0, 240, 255, 0.05), transparent 50%), var(--bg-color)' }}>
      
      {/* AI Workflow Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '8px' }}>
          AI-Powered Parking Intelligence Platform
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Transforming Reactive Enforcement into Predictive Congestion Management
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {pipelineSteps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', 
                  padding: '16px', borderRadius: '12px', minWidth: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  boxShadow: i === 5 ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
                  borderColor: i === 5 ? 'var(--success-green)' : 'var(--panel-border)'
                }}
              >
                <div style={{ color: i === 5 ? 'var(--success-green)' : 'var(--electric-cyan)' }}>{step.icon}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{step.title}</div>
              </motion.div>
              {i < pipelineSteps.length - 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.1 }} style={{ color: 'var(--text-muted)' }}>
                  
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        {/* Mission Statement Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="premium-card" style={{ padding: '40px', borderLeft: '4px solid var(--electric-cyan)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--electric-cyan)', fontWeight: 700, letterSpacing: '2px' }}>
             OUR MISSION
          </div>
          <p style={{ fontSize: '1.5rem', lineHeight: '1.6', color: '#fff', fontWeight: 300 }}>
            Detect illegal parking <strong style={{ color: 'var(--electric-cyan)', fontWeight: 700 }}>hotspots</strong>,<br/>
            quantify congestion <strong style={{ color: 'var(--critical-red)', fontWeight: 700 }}>impact</strong>,<br/>
            predict future <strong style={{ color: 'var(--alert-orange)', fontWeight: 700 }}>risk</strong>,<br/>
            and optimize enforcement <strong style={{ color: 'var(--success-green)', fontWeight: 700 }}>deployment</strong><br/>
            using AI-driven intelligence.
          </p>
        </motion.div>

        {/* Strategic Impact Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="premium-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>
             STRATEGIC IMPACT PROJECTION
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1 }}>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--critical-red)', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 700 }}>Without Intervention</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>+12%</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Violations (YTD)</div></div>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>+18%</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Congestion Growth</div></div>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>+2.4 min</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Commuter Delay</div></div>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--success-green)', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 700 }}>With AI Deployment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-green)' }}>-22%</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Congestion Reduction</div></div>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-green)' }}>-17 min</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delay Avoided</div></div>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--electric-cyan)' }}>78/100</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Congestion Recovery Index (CRI)</div></div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* AI Methodology Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="premium-card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>
           AI INTELLIGENCE PIPELINE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          {pipelineSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--electric-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '4px', fontWeight: 600 }}>{step.desc}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {i === 0 && "Aggregating millions of raw parking violation records."}
                  {i === 1 && "Unsupervised learning identifies critical spatial nodes."}
                  {i === 2 && "Correlating violations directly to road width and peak traffic."}
                  {i === 3 && "XGBoost modeling forecasts escalations over a 24-hour horizon."}
                  {i === 4 && "AI generates optimal routing for heavy tow units and patrols."}
                  {i === 5 && "Quantifying the city-wide impact into a single executive metric."}
                </p>
              </div>
            </div>
          ))}

        </div>
      </motion.div>

    </div>
  );
};

export default ExecutiveSummary;
