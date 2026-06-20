import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExecutiveDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  const monthlyData = [
    { name: 'Jan', violations: 45000, revenueLeakage: 22.5 },
    { name: 'Feb', violations: 52000, revenueLeakage: 26.0 },
    { name: 'Mar', violations: 48000, revenueLeakage: 24.0 },
    { name: 'Apr', violations: 61000, revenueLeakage: 30.5 },
    { name: 'May', violations: 65000, revenueLeakage: 32.5 },
  ];

  const [riskZones, setRiskZones] = useState([]);
  const [topNames, setTopNames] = useState("the top risk zones");

  React.useEffect(() => {
    fetch('http://localhost:5000/api/hotspots')
      .then(res => res.json())
      .then(data => {
         const top = data.hotspots.slice(0, 5).map((h, i) => ({
             rank: i + 1,
             name: h.locationName,
             score: Math.min(99, Math.round(h.impact_score / 50)),
             trend: `+${Math.round(h.total_violations / 80)}%`
         }));
         setRiskZones(top);
         if(top.length > 1) {
           setTopNames(`${top[0].name} and ${top[1].name}`);
         }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', padding: '32px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">
             Executive Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>High-level City Commissioner View: Q1-Q2 Analytics</p>
        </div>
        <button 
          onClick={handleExport}
          style={{ 
            background: isExporting ? 'var(--accent-blue)' : 'var(--card-bg)', 
            border: '1px solid var(--border-color)', 
            color: isExporting ? '#fff' : 'var(--text-primary)', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontWeight: 600, 
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
           {isExporting ? 'Generating...' : 'Export PDF Report'}
        </button>
      </div>

      {/* Top Stats */}
      <div className="cards-grid" style={{ marginBottom: '32px' }}>
        <div className="premium-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
             Total YTD Violations
          </div>
          <div className="metric-number">271K</div>
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>+12% vs last year</div>
        </div>
        <div className="premium-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
             Estimated Revenue Leakage
          </div>
          <div className="metric-number">₹13.5Cr</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>Uncollected fines</div>
        </div>
        <div className="premium-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
             Avg City Speed Drop
          </div>
          <div className="metric-number">-8.4<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>km/h</span></div>
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>Due to illegal parking</div>
        </div>
        <div className="premium-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
             AI Enforcement Success
          </div>
          <div className="metric-number">74%</div>
          <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>+18% efficiency gain</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Main Chart */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title" style={{ marginBottom: '24px' }}>Monthly Violation Trends (Jan-May)</h2>
          <div style={{ flex: 1, minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorVio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="violations" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorVio)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Risk Zones */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title" style={{ marginBottom: '8px' }}>Top Risk Zones</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Highest congestion probability</p>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {riskZones.map((zone) => (
              <div key={zone.rank} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#F8FAFC' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-primary)', marginRight: '16px', border: '1px solid var(--border-color)' }}>
                  {zone.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{zone.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Risk Score: {zone.score}</div>
                </div>
                <div style={{ fontWeight: 600, color: zone.trend.startsWith('+') ? 'var(--danger)' : 'var(--success)', fontSize: '0.9rem' }}>
                  {zone.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Recommendation Panel */}
      <div className="premium-card">
        <div className="ai-decision-block" style={{ margin: 0 }}>
          <div className="ai-decision-title">AI System Recommendation</div>
          <div className="ai-decision-text">
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Based on Executive Dashboard trends, AI recommends escalating enforcement in Top Risk Zones.</span><br/><br/>
            Recommended Action: <strong>Deploy 3 additional Tow Units to {topNames} during peak hours.</strong><br/>
            Expected revenue recovery: <strong>₹2.1Cr per month</strong><br/>
            Estimated congestion reduction: <strong>14%</strong>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExecutiveDashboard;
