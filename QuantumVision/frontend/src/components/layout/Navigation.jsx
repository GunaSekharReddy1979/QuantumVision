import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Navigation() {
  const { activeTab, setActiveTab } = useApp() || {};

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'detection', label: 'Hazards' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'routing', label: 'Routing' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'quantum', label: 'Quantum' },
    { id: 'explainability', label: 'Explainability' },
  ];

  return (
    <nav style={{ display: 'flex', gap: '8px', padding: '0 12px 8px 12px' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab && setActiveTab(tab.id)}
            className="btn-cyber"
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem',
              background: isActive
                ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.35), rgba(0, 136, 255, 0.45))'
                : 'rgba(12, 20, 32, 0.6)',
              borderColor: isActive ? '#00f0ff' : 'rgba(0, 240, 255, 0.2)',
              boxShadow: isActive ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}