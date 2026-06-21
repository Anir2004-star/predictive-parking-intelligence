import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Navigation from './components/Layout/Navigation';
import CommandCenter from './pages/CommandCenter';
import HotspotIntelligence from './pages/HotspotIntelligence';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import IncidentResponse from './pages/IncidentResponse';
import Copilot from './pages/Copilot';
import Home from './pages/Home';

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) {
    return (
      <div style={{ backgroundColor: 'var(--bg-color)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navigation />
      <main className="page-content" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ minWidth: '1200px', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Routes>
            <Route path="/dashboard" element={<CommandCenter />} />
            <Route path="/hotspots" element={<HotspotIntelligence />} />
            <Route path="/predictive" element={<PredictiveAnalytics />} />
            <Route path="/incident-response" element={<IncidentResponse />} />
            <Route path="/copilot" element={<Copilot />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
