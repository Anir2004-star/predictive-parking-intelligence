import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(true);

  const links = [
    { path: '/', label: 'Home Entrance' },
    { path: '/dashboard', label: 'AI Traffic Command Center' },
    { path: '/hotspots', label: 'Hotspot Intelligence' },
    { path: '/predictive', label: 'Predictive Analytics' },
    { path: '/incident-response', label: 'Traffic Incident Command Center' },
    { path: '/copilot', label: 'Parking Intelligence Copilot' },
  ];

  return (
    <>
      {/* Floating Hamburger Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
             position: 'fixed', 
             top: '50%', 
             left: '0px', 
             transform: 'translateY(-50%)',
             zIndex: 3000, 
             background: 'var(--card-bg)', 
             border: '1px solid var(--border-color)',
             borderLeft: 'none',
             color: 'var(--text-primary)', 
             padding: '24px 8px', 
             borderRadius: '0 8px 8px 0', 
             cursor: 'pointer', 
             boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontWeight: 'bold',
             fontSize: '1.2rem'
          }}
          title="Open Menu"
        >
          ❯
        </button>
      )}

      <nav className="nav-sidebar" style={{ 
        marginLeft: isOpen ? '0px' : '-300px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
      }}>
        
        <div className="nav-header">
          <div style={{ flex: 1 }}>
            <h2 className="brand-title" style={{ margin: 0 }}>Bengaluru Traffic</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginTop: '4px' }}>Command Center</div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
            ✕
          </button>
        </div>

      <div className="nav-menu">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      </nav>
    </>
  );
};

export default Navigation;
