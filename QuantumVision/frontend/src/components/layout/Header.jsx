import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { systemStatus, hazardAlert } = useApp() || {};
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel" style={{ margin: '8px 12px', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.04em', color: '#e6f1ff' }}>
            QUANTUM<span style={{ color: '#00f0ff' }}>VISION</span>
          </h1>
          <p style={{ fontSize: '0.68rem', color: '#8ba2c4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Andhra Pradesh Disaster Command Hub
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="badge-status badge-simulated">
          ALERT: {hazardAlert?.level || 'MODERATE'} ({hazardAlert?.status || 'SIMULATED'})
        </div>
        <div className="badge-status badge-live">
          SYS: {systemStatus || 'ONLINE'}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#00f0ff' }}>
          IST {time}
        </div>
      </div>
    </header>
  );
}