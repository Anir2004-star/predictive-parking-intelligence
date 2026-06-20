import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, YAxis } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const DEFAULT_MESSAGE = { 
  role: 'assistant', 
  content: 'Hello Commissioner. I am your Parking Intelligence Copilot. I have analyzed 300,000+ traffic violations. How can I assist you with congestion management today?' 
};

const Copilot = () => {
  const [messages, setMessages] = useState([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef(null);
  const navigate = useNavigate();

  const [top5Hotspots, setTop5Hotspots] = useState([]);
  const [primaryTarget, setPrimaryTarget] = useState('Primary Location');

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('copilotSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState(() => Date.now().toString());

  useEffect(() => {
    localStorage.setItem('copilotSessions', JSON.stringify(sessions));
  }, [sessions]);

  const updateSession = (id, newMsgs) => {
    setSessions(prev => {
      const existing = prev.find(s => s.id === id);
      if (existing) {
        return prev.map(s => s.id === id ? { ...s, messages: newMsgs, updatedAt: Date.now() } : s);
      } else {
        const title = newMsgs.find(m => m.role === 'user')?.content || 'New Chat';
        return [{ id, title, messages: newMsgs, updatedAt: Date.now() }, ...prev];
      }
    });
  };

  const handleNewChat = () => {
    setActiveSessionId(Date.now().toString());
    setMessages([DEFAULT_MESSAGE]);
  };

  const loadSession = (session) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
  };

  const categorizeSessions = () => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    const cat = { today: [], yesterday: [], previous: [] };
    sessions.forEach(s => {
       const date = new Date(s.updatedAt);
       if (date >= todayDate) cat.today.push(s);
       else if (date >= yesterdayDate) cat.yesterday.push(s);
       else cat.previous.push(s);
    });
    return cat;
  };
  const categorized = categorizeSessions();

  useEffect(() => {
    fetch('http://localhost:5000/api/hotspots')
      .then(res => res.json())
      .then(data => {
         const top = data.hotspots.slice(0, 5).map((h, i) => ({
             name: h.locationName,
             lat: h.lat,
             lng: h.lng,
             color: i === 0 ? 'var(--danger)' : i < 3 ? 'var(--warning)' : 'var(--success)'
         }));
         setTop5Hotspots(top);
         if(top.length > 0) setPrimaryTarget(top[0].name);
      });
  }, []);
  const systemInstruction = `You are the AI Parking Intelligence Copilot for the Bengaluru Traffic Police. 
You have ingested exactly 298,450 historical parking violation records.
The current worst congestion zone is ${primaryTarget}.
Your job is to answer the Commissioner's questions smartly.
If the user asks to see a map of hotspots or top 5, include exactly the tag [SHOW_HOTSPOTS_MAP] anywhere in your response.
If the user asks about deployment, tow trucks, or charts, include exactly the tag [SHOW_DEPLOYMENT_CHART] anywhere in your response.
If the user asks about the status or map of MG Road specifically, include exactly the tag [SHOW_MG_ROAD_MAP] anywhere in your response.
If the user asks for a map of ANY OTHER specific location (e.g. Whitefield Tech Park, Koramangala, etc.), include exactly the tag [SHOW_DYNAMIC_MAP: latitude, longitude, Location Name] anywhere in your response. Estimate coordinates if necessary. Example: [SHOW_DYNAMIC_MAP: 12.9698, 77.7499, Whitefield Tech Park].
Use bolding and markdown lists to make your responses look professional. Be concise and authoritative.`;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    
    // Add user message and update session
    setMessages(prev => {
      const newMsgs = [...prev, { role: 'user', content: userMsg }];
      updateSession(activeSessionId, newMsgs);
      return newMsgs;
    });
    
    setInput('');
    
    // Add loading state
    setMessages(prev => [...prev, { role: 'assistant', content: '...', isLoading: true }]);

    try {
      const payloadMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.content
      }));
      payloadMessages.push({ role: 'user', text: userMsg });

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: payloadMessages,
          systemInstruction: systemInstruction 
        })
      });
      const data = await response.json();
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'assistant', content: data.reply };
        updateSession(activeSessionId, newMessages);
        return newMessages;
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'assistant', content: "⚠️ Connection to GenAI server failed. Is the backend running?" };
        updateSession(activeSessionId, newMessages);
        return newMessages;
      });
    }
  };

  const renderAIContent = (content) => {
    let cleanContent = content;
    const showHotspots = content.includes('[SHOW_HOTSPOTS_MAP]');
    const showDeployment = content.includes('[SHOW_DEPLOYMENT_CHART]');
    const showMgRoad = content.includes('[SHOW_MG_ROAD_MAP]');
    
    const dynamicMapMatch = content.match(/\[SHOW_DYNAMIC_MAP:\s*([\d.-]+),\s*([\d.-]+),\s*([^\]]+)\]/);
    let dynamicLat = 12.9716, dynamicLng = 77.5946, dynamicName = "Location";
    if (dynamicMapMatch) {
      dynamicLat = parseFloat(dynamicMapMatch[1]);
      dynamicLng = parseFloat(dynamicMapMatch[2]);
      dynamicName = dynamicMapMatch[3];
      cleanContent = cleanContent.replace(dynamicMapMatch[0], '');
    }

    cleanContent = cleanContent.replace(/\[SHOW_HOTSPOTS_MAP\]/g, '')
                               .replace(/\[SHOW_DEPLOYMENT_CHART\]/g, '')
                               .replace(/\[SHOW_MG_ROAD_MAP\]/g, '');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%' }}>
        <div style={{ lineHeight: '1.6', fontSize: '0.95rem', overflowWrap: 'break-word' }}>
          <ReactMarkdown>{cleanContent}</ReactMarkdown>
        </div>
        
        {showHotspots && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ width: '100%', height: '400px', minHeight: '400px', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '18px', background: '#FFFFFF', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
              <MapContainer center={top5Hotspots.length > 0 ? [top5Hotspots[0].lat, top5Hotspots[0].lng] : [12.9716, 77.6200]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {top5Hotspots.map((h, i) => (
                  <CircleMarker key={i} center={[h.lat, h.lng]} pathOptions={{ color: h.color, fillColor: h.color, fillOpacity: 0.8 }} radius={10}>
                    <Popup>{h.name}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <button onClick={() => navigate('/hotspots')} style={{ width: '100%', padding: '10px', background: 'var(--card-bg)', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Open Full Intelligence Dashboard 
            </button>
          </div>
        )}

        {showDeployment && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ height: '120px', width: '100%', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Current Density', val: 142 }, { name: 'Post-Deployment', val: 45 }]}>
                  <YAxis hide />
                  <Bar dataKey="val" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '16px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expected Outcome</div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>-22% Congestion</div></div>
              <div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Confidence</div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>92%</div></div>
            </div>
          </div>
        )}

        {showMgRoad && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ width: '100%', height: '300px', minHeight: '300px', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '18px', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <MapContainer center={[12.9736, 77.6146]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <CircleMarker center={[12.9736, 77.6146]} pathOptions={{ color: 'var(--danger)', fillColor: 'var(--danger)', fillOpacity: 0.8 }} radius={12}>
                  <Popup>MG Road Critical Zone</Popup>
                </CircleMarker>
              </MapContainer>
            </div>
          </div>
        )}

        {dynamicMapMatch && (
          <div style={{ width: '100%', maxWidth: '600px', marginTop: '8px' }}>
            <div style={{ width: '100%', height: '300px', minHeight: '300px', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '18px', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <MapContainer center={[dynamicLat, dynamicLng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <CircleMarker center={[dynamicLat, dynamicLng]} pathOptions={{ color: 'var(--warning)', fillColor: 'var(--warning)', fillOpacity: 0.8 }} radius={12}>
                  <Popup>{dynamicName}</Popup>
                </CircleMarker>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ height: '100%', width: '100%', padding: '32px', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">
           Parking Intelligence Copilot
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Predictive Intelligence Engine.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Chat History Sidebar */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', overflowY: 'auto' }}>
          <button 
            onClick={handleNewChat}
            style={{ width: '100%', padding: '12px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}>
            + New Chat
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
            
            {categorized.today.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Today</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {categorized.today.map(s => (
                    <div key={s.id} onClick={() => loadSession(s)} style={{ padding: '10px 12px', background: activeSessionId === s.id ? '#F3F4F6' : 'transparent', borderRadius: '6px', fontSize: '0.9rem', color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeSessionId === s.id ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categorized.yesterday.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Yesterday</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {categorized.yesterday.map(s => (
                    <div key={s.id} onClick={() => loadSession(s)} style={{ padding: '10px 12px', background: activeSessionId === s.id ? '#F3F4F6' : 'transparent', borderRadius: '6px', fontSize: '0.9rem', color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeSessionId === s.id ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categorized.previous.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Previous 7 Days</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {categorized.previous.map(s => (
                    <div key={s.id} onClick={() => loadSession(s)} style={{ padding: '10px 12px', background: activeSessionId === s.id ? '#F3F4F6' : 'transparent', borderRadius: '6px', fontSize: '0.9rem', color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeSessionId === s.id ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sessions.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No recent chats.</div>
            )}

          </div>
        </div>

        {/* Middle Column: Chat UI */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Chat History */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: '16px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'assistant' ? 'var(--light-blue-bg)' : '#F3F4F6',
                  border: `1px solid ${msg.role === 'assistant' ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: msg.role === 'assistant' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.85rem'
                }}>
                  {msg.role === 'assistant' ? 'AI' : 'U'}
                </div>
                
                <div style={{ 
                  padding: '16px', borderRadius: '12px',
                  background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--card-bg)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  lineHeight: '1.5',
                  maxWidth: '80%',
                  boxShadow: msg.role === 'user' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {msg.role === 'user' ? msg.content : (msg.isLoading ? <span style={{ color: 'var(--text-secondary)' }}>Analyzing matrices...</span> : renderAIContent(msg.content))}
                </div>
              </motion.div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Chat Input */}
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <input 
                type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Copilot to perform actions, show data, or predict trends..."
                style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '16px', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}
              />
              <button onClick={handleSend} style={{ background: 'var(--accent-blue)', border: 'none', color: '#fff', padding: '0 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, transition: 'background 0.2s ease' }}>
                Send
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Suggested Prompts & Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="premium-card">
            <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: '16px' }}>Suggested Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => setInput("Show top 5 hotspots")} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Show top 5 hotspots</span> <span style={{ color: 'var(--accent-blue)' }}>→</span>
              </button>
              <button onClick={() => setInput("Which zone should receive enforcement first?")} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Where to deploy first?</span> <span style={{ color: 'var(--accent-blue)' }}>→</span>
              </button>
              <button onClick={() => setInput("Explain this recommendation")} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Explain AI recommendation</span> <span style={{ color: 'var(--accent-blue)' }}>→</span>
              </button>
            </div>
          </div>

          <div className="premium-card">
            <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: '16px' }}>Active AI Insights</h2>
            <div style={{ background: '#FEF2F2', borderLeft: '4px solid var(--danger)', padding: '12px', borderRadius: '0 8px 8px 0', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 700, marginBottom: '4px' }}>ALERT</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>MG Road congestion has exceeded critical thresholds.</div>
            </div>
            <div style={{ background: '#F0FDF4', borderLeft: '4px solid var(--success)', padding: '12px', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, marginBottom: '4px' }}>UPDATE</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Tow Unit #2 successfully cleared Silk Board block.</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Copilot;
