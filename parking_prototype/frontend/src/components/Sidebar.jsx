import React from 'react';
import { motion } from 'framer-motion';


const Sidebar = ({ hotspots, onHotspotClick }) => {
  // Take top 50 hotspots for the sidebar
  const topHotspots = hotspots.slice(0, 50);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Targeted Enforcement</h2>
        <p className="sidebar-subtitle">Priority zones ranked by congestion impact and violation volume.</p>
      </div>

      <div className="hotspot-list">
        {topHotspots.map((hotspot, index) => (
          <motion.div
            key={hotspot.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`hotspot-card ${hotspot.impact_score > 50 ? 'critical' : 'warning'}`}
            onClick={() => onHotspotClick(hotspot)}
          >
            <div className="card-header">
              <span className="card-rank">#{index + 1}</span>
              <div className="card-score">
                {hotspot.impact_score} <span>Impact</span>
              </div>
            </div>

            <div className="card-body">
              <div className="stat-row">
                <span className="stat-label">
                  
                  Primary Offence
                </span>
                <span className="stat-value">{hotspot.primary_offence}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">
                  
                  Total Violations
                </span>
                <span className="stat-value">{hotspot.total_violations}</span>
              </div>
              
              <div className="mt-2 text-xs text-secondary flex justify-between border-t border-white/10 pt-2">
                <span>Morning: {hotspot.breakdown['Morning Peak']}</span>
                <span>Evening: {hotspot.breakdown['Evening Peak']}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
