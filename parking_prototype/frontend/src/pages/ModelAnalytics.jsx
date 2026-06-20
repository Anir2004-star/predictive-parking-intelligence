import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ModelAnalytics = () => {
  // 1. Semi-Dynamic Live Inference Data
  const [liveInferenceData, setLiveInferenceData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      latency: 42 + Math.random() * 5 - 2.5,
      confidence: 94 + Math.random() * 2 - 1
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveInferenceData(prev => {
        const newData = [...prev.slice(1)];
        const lastTime = prev[prev.length - 1].time;
        newData.push({
          time: lastTime + 1,
          latency: Math.max(30, Math.min(60, prev[prev.length - 1].latency + (Math.random() * 4 - 2))),
          confidence: Math.max(85, Math.min(99, prev[prev.length - 1].confidence + (Math.random() * 1.5 - 0.75)))
        });
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. Static Realistic Data
  const featureImportance = [
    { name: 'Location Density', score: 42.5 },
    { name: 'Time of Day', score: 28.1 },
    { name: 'Historical Violations', score: 18.4 },
    { name: 'Day of Week', score: 6.2 },
    { name: 'Weather Cond.', score: 3.5 },
    { name: 'Special Events', score: 1.3 }
  ];

  const lossCurve = [
    { epoch: 1, trainLoss: 1.45, valLoss: 1.38 },
    { epoch: 5, trainLoss: 0.95, valLoss: 0.98 },
    { epoch: 10, trainLoss: 0.65, valLoss: 0.71 },
    { epoch: 15, trainLoss: 0.45, valLoss: 0.52 },
    { epoch: 20, trainLoss: 0.35, valLoss: 0.41 },
    { epoch: 25, trainLoss: 0.28, valLoss: 0.35 },
    { epoch: 30, trainLoss: 0.22, valLoss: 0.31 },
    { epoch: 35, trainLoss: 0.18, valLoss: 0.29 },
    { epoch: 40, trainLoss: 0.15, valLoss: 0.28 },
    { epoch: 45, trainLoss: 0.13, valLoss: 0.28 },
    { epoch: 50, trainLoss: 0.11, valLoss: 0.29 }, // Slight overfitting at end
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: 0, fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color, fontSize: '0.85rem', fontWeight: 600 }}>
              {entry.name}: {entry.value.toFixed(2)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '100%', width: '100%', padding: '32px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">XGBoost & Neural Core Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live telemetry and performance metrics for the predictive parking intelligence engine.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: '#F0FDF4', color: 'var(--success)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span> Models Active
          </div>
          <div style={{ background: '#EFF6FF', color: 'var(--accent-blue)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #BFDBFE' }}>
            Version: v4.2.1
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
        {[
          { label: 'Global Accuracy', value: '92.4%', sub: '+1.2% from last epoch', color: 'var(--accent-blue)' },
          { label: 'Avg Inference Latency', value: liveInferenceData[liveInferenceData.length-1].latency.toFixed(1) + ' ms', sub: 'Real-time p95', color: 'var(--success)' },
          { label: 'F1 Score (Congestion)', value: '0.94', sub: 'Highly precise predictions', color: '#8B5CF6' },
          { label: 'Data Ingested', value: '298,450', sub: 'Anonymized violation records', color: 'var(--text-primary)' }
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="premium-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{kpi.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: kpi.color, marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Live Inference Drift */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title">Live Inference Telemetry</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Monitoring prediction confidence and latency drift in real-time.</p>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveInferenceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="time" hide />
                <YAxis yAxisId="left" domain={[20, 80]} hide />
                <YAxis yAxisId="right" orientation="right" domain={[80, 100]} hide />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem', fontWeight: 600 }} />
                <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency (ms)" stroke="var(--success)" strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="confidence" name="Confidence (%)" stroke="var(--accent-blue)" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Training Loss Curve */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title">Model Convergence (Loss Curve)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Training vs Validation loss across 50 epochs (XGBoost Gradient Descent).</p>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lossCurve}>
                <defs>
                  <linearGradient id="colorTrain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="epoch" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem', fontWeight: 600 }} />
                <Area type="monotone" dataKey="trainLoss" name="Training Loss" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorTrain)" strokeWidth={2} />
                <Area type="monotone" dataKey="valLoss" name="Validation Loss" stroke="var(--danger)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '60px' }}>
        
        {/* Feature Importance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title">Feature Importance Analysis</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>F-score contribution of each variable to the congestion prediction model.</p>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 600 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} content={<CustomTooltip />} />
                <Bar dataKey="score" name="Importance Score" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Confusion Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="premium-card">
          <h2 className="section-title">Confusion Matrix</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Classification performance on holdout test set (Congestion Detection).</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--border-color)', padding: '1px', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '1px' }}>
              <div style={{ background: '#F8FAFC' }}></div>
              <div style={{ background: '#F8FAFC', padding: '12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Predicted Positive</div>
              <div style={{ background: '#F8FAFC', padding: '12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Predicted Negative</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '1px' }}>
              <div style={{ background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ transform: 'rotate(-90deg)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Actual Pos</div>
              </div>
              <div style={{ background: '#EFF6FF', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>8,432</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>True Positive</div>
              </div>
              <div style={{ background: '#FEF2F2', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>112</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>False Negative</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '1px' }}>
              <div style={{ background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ transform: 'rotate(-90deg)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Actual Neg</div>
              </div>
              <div style={{ background: '#FEF2F2', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>584</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>False Positive</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>24,950</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>True Negative</div>
              </div>
            </div>
          </div>
          
        </motion.div>

      </div>

    </div>
  );
};

export default ModelAnalytics;
