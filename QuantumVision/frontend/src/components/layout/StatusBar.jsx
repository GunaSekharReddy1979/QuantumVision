import React from 'react';
import { useApp } from '../../context/AppContext';

export default function StatusBar() {
  const { activeDistrict } = useApp() || {};

  return (
    <footer className="glass-panel" style={{ margin: '0 12px 8px 12px', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#8ba2c4', zIndex: 40 }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <span>Active District: <strong style={{ color: '#00f0ff' }}>{activeDistrict?.name || 'NTR (Vijayawada)'}</strong></span>
        <span>Center: [{activeDistrict?.latitude || 16.5062}, {activeDistrict?.longitude || 80.6480}]</span>
        <span>Spatial Focus: Andhra Pradesh Corridor</span>
      </div>
      <div>
        <span style={{ color: '#ffaa00' }}>Disclaimer:</span> Safest practical navigation based on available data.
      </div>
    </footer>
  );
}