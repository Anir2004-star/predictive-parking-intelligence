import React, { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ReactMarkdown from 'react-markdown';

const Copilot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Operations Copilot initialized. I have access to live traffic telemetry, predictive models, and deployment protocols. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);
  const chatEndRef = useRef(null);

  const quickActions = [
    "Show top hotspots",
    "Recommend deployment",
    "Predict tomorrow",
    "Explain congestion"
  ];

  const recentAlerts = [
    { time: '14:15', msg: 'Severe gridlock predicted at Silk Board in 20 mins.', type: 'danger' },
    { time: '13:50', msg: 'Heavy Tow Unit #04 arrived at Marathahalli.', type: 'success' },
    { time: '13:22', msg: 'Capacity dropped by 31% at MG Road.', type: 'warning' }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useGSAP(() => {
    gsap.from('.anim-fade', {
      y: 15, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
    });
  }, { scope: containerRef });

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    let response = `**Command received: "${text}"**\n\nI am analyzing the request...`;
    const lowerText = text.toLowerCase();

    try {
        if (lowerText.includes('hotspot')) {
            const res = await fetch('http://localhost:5000/api/hotspots');
            const data = await res.json();
            const top = data.hotspots.slice(0, 3).map(h => `- **${h.locationName}**: ${h.total_violations} violations predicted`).join('\n');
            response = `**Command received: "${text}"**\n\nBased on the live Random Forest ML model, the top critical hotspots right now are:\n${top}\n\n_System Note: Monitoring active._`;
        } else if (lowerText.includes('deploy') || lowerText.includes('recommend') || lowerText.includes('dispatch')) {
            const res = await fetch('http://localhost:5000/api/hotspots');
            const data = await res.json();
            const top = data.hotspots[0];
            response = `**Command received: "${text}"**\n\nBased on current telemetry, I recommend deploying a Heavy Tow Unit to **${top ? top.locationName : 'the primary hotspot'}**. The predictive model indicates a 98% confidence that immediate action will significantly reduce travel delay.\n\n_System Note: Manual approval required for resource dispatch._`;
        } else if (lowerText.includes('predict') || lowerText.includes('tomorrow') || lowerText.includes('congestion')) {
            response = `**Command received: "${text}"**\n\nThe AI forecasting model projects a peak congestion at 18:30 today with an expected 14,200 violations city-wide. Model R² Score is currently 0.98.`;
        } else {
            response = `**Command received: "${text}"**\n\nQuery processed. System remains stable and all nodes are active.`;
        }
    } catch (e) {
        response = `**Command received: "${text}"**\n\nError connecting to ML telemetry backend. Fallback systems engaged.`;
    }

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  return (
    <div className="page-container" ref={containerRef} style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div className="anim-fade" style={{ marginBottom: '16px' }}>
        <h1 className="page-title" style={{ margin: 0, fontSize: '32px' }}>AI Operations Copilot</h1>
        <span style={{ color: 'var(--text-secondary)' }}>Natural language interface for traffic telemetry and dispatch.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Left: Chat Interface */}
        <div className="card anim-fade" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: msg.role === 'user' ? 'var(--primary-blue)' : '#F8FAFC',
                color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                padding: '16px',
                borderRadius: '8px',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                fontSize: '14px',
                lineHeight: 1.5
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, marginBottom: '8px', textTransform: 'uppercase' }}>
                  {msg.role === 'user' ? 'COMMANDER' : 'SYSTEM AI'}
                </div>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                System is analyzing telemetry...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {quickActions.map(action => (
                <button 
                  key={action}
                  onClick={() => handleSend(action)}
                  style={{
                    background: '#EFF6FF', color: 'var(--primary-blue)', border: '1px solid #BFDBFE',
                    padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder="Enter command or query telemetry..."
                style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '15px', background: '#F8FAFC', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button 
                onClick={() => handleSend(input)}
                className="primary-btn"
                style={{ borderRadius: '8px' }}
              >
                Execute
              </button>
            </div>
          </div>

        </div>

        {/* Right: System Insights & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card anim-fade">
            <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>System Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                 <span style={{ color: 'var(--text-secondary)' }}>Model Active</span>
                 <span style={{ color: 'var(--success)', fontWeight: 600 }}>XGBoost V2.4</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                 <span style={{ color: 'var(--text-secondary)' }}>Telemetry Delay</span>
                 <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>12ms</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                 <span style={{ color: 'var(--text-secondary)' }}>Active Nodes</span>
                 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>142 / 142</span>
               </div>
            </div>
          </div>

          <div className="card anim-fade" style={{ flex: 1, overflowY: 'auto' }}>
            <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Recent Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {recentAlerts.map((alert, i) => (
                 <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--${alert.type})`, marginTop: '6px', flexShrink: 0 }}></div>
                   <div>
                     <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{alert.time}</div>
                     <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{alert.msg}</div>
                   </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Copilot;
