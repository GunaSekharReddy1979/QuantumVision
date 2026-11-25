import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMap } from '../../context/MapContext';
import { api } from '../../services/apiClient';
import { AlertTriangle } from 'lucide-react';

export default function TopNavbar() {
  const { activeNavTab, setActiveNavTab, setLayers } = useMap();
  const location = useLocation();
  const navigate = useNavigate();
  const [systemTime, setSystemTime] = useState('2025-09-22 15:32:18 UTC');
  const [systemOnline, setSystemOnline] = useState(true);
  const [dataConnected, setDataConnected] = useState(true);

  const navItems = [
    { id: 'OVERVIEW', label: 'OVERVIEW', path: '/overview' },
    { id: 'HAZARD MAP', label: 'HAZARD MAP', path: '/hazard-map' },
    { id: 'RISK ANALYSIS', label: 'RISK ANALYSIS', path: '/risk-analysis' },
    { id: 'FLOOD PREDICTION', label: 'FLOOD PREDICTION', path: '/flood-prediction' },
    { id: 'NAVIGATION', label: 'NAVIGATION', path: '/navigation' },
    { id: 'SIMULATION', label: 'SIMULATION', path: '/simulation' },
    { id: 'REPORTS', label: 'REPORTS', path: '/reports' }
  ];

  // Sync activeNavTab with URL route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/flood' || path === '/flood-prediction') {
      setActiveNavTab('FLOOD PREDICTION');
    } else {
      const match = navItems.find(item => item.path === path);
      if (match && match.id !== activeNavTab) {
        setActiveNavTab(match.id);
      }
    }
  }, [location.pathname]);

  // Live IST/UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setSystemTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Backend Health Status Check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res?.data?.status === 'healthy' || res?.status === 'success') {
          setSystemOnline(true);
          setDataConnected(true);
        } else {
          setSystemOnline(true);
          setDataConnected(false);
        }
      } catch (err) {
        setSystemOnline(true);
        setDataConnected(false);
      }
    };
    checkHealth();
    const healthInterval = setInterval(checkHealth, 30000);
    return () => clearInterval(healthInterval);
  }, []);

  const handleTabClick = (item) => {
    setActiveNavTab(item.id);
    navigate(item.path);
    if (item.id === 'HAZARD MAP') {
      setLayers(prev => ({ ...prev, floodInundation: true, riskZones: true, terrain: true }));
    } else if (item.id === 'NAVIGATION') {
      setLayers(prev => ({ ...prev, roads: true, evacuationRoutes: true, shelters: true, hospitals: true }));
    } else if (item.id === 'FLOOD PREDICTION' || item.id === 'FLOOD') {
      setLayers(prev => ({ ...prev, floodInundation: true, waterways: true }));
    }
  };

  return (
    <header className="relative w-full z-50 pointer-events-auto px-4 py-2 flex items-center justify-between bg-gradient-to-b from-[#030814] via-[#050D1E] to-[#040A17]/95 border-b border-[#143257] shadow-[0_4px_30px_rgba(0,0,0,0.85)] select-none">
      {/* LEFT: QuantumVision Brand + Subtitle */}
      <div className="flex items-center space-x-3 min-w-[340px]">
        {/* Sleek Glowing Q Logo Mark */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#081C38] border border-[#19D3FF]/60 shadow-[0_0_15px_rgba(25,211,255,0.45)]">
          <div className="w-5 h-5 rounded-full border-2 border-[#19D3FF] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#19D3FF] shadow-[0_0_8px_#19D3FF]" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-1 bg-[#19D3FF] rounded-full rotate-45" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-base lg:text-lg font-black tracking-[0.16em] text-white font-sans leading-none">
              QUANTUMVISION
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider bg-[#0C2B54] text-[#19D3FF] border border-[#19D3FF]/50 shadow-[0_0_8px_rgba(25,211,255,0.25)]">
              EOC
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#7B92B2] tracking-wider uppercase mt-0.5">
            INTELLIGENT DISASTER NAVIGATION &bull; EMERGENCY OPERATIONS CENTER
          </span>
        </div>
      </div>

      {/* CENTER: Navigation Tabs (Matching exact reference capsule bar) */}
      <nav className="flex items-center space-x-2 bg-[#061326]/90 px-2.5 py-1 rounded-lg border border-[#14335C]/80 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
        {navItems.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`px-2.5 py-1 text-[10.5px] font-mono font-bold tracking-wider transition-all duration-150 rounded cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#0C376A] to-[#124E96] text-white border border-[#19D3FF] shadow-[0_0_14px_rgba(25,211,255,0.5),inset_0_0_10px_rgba(25,211,255,0.2)]'
                  : 'text-[#8EA5C4] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Live Status Telemetry & Red Warning Pill */}
      <div className="flex items-center space-x-4 min-w-[340px] justify-end text-[10px] font-mono">
        {/* System Online & Data Connected */}
        <div className="flex flex-col items-end space-y-0.5">
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1.5 text-[#32E875]">
              <span className={`inline-block w-2 h-2 rounded-full ${systemOnline ? 'bg-[#32E875] shadow-[0_0_8px_#32E875]' : 'bg-[#FF4D5E] shadow-[0_0_8px_#FF4D5E]'} animate-pulse`} />
              <strong className="font-bold">SYSTEM ONLINE</strong>
            </span>

            <span className="flex items-center space-x-1.5 text-[#19D3FF]">
              <span className={`inline-block w-2 h-2 rounded-full ${dataConnected ? 'bg-[#19D3FF] shadow-[0_0_8px_#19D3FF]' : 'bg-[#FFD54A] shadow-[0_0_8px_#FFD54A]'}`} />
              <strong className="font-bold">DATA CONNECTED</strong>
            </span>
          </div>

          <div className="text-[9px] text-[#7B92B2]">
            Last Updated: <span className="text-[#A4B8D1]">{systemTime}</span>
          </div>
        </div>

        {/* High-Contrast Red Alert Badge: FLOOD EVENT ACTIVE (Exact Match to Reference Top Right) */}
        <div className="flex items-center space-x-2 bg-[#2D0A11]/90 hover:bg-[#3D0D17] px-3 py-1.5 rounded-lg border-2 border-[#FF4D5E] text-[#FF4D5E] shadow-[0_0_20px_rgba(255,77,94,0.45)] cursor-pointer transition-all animate-pulse">
          <AlertTriangle size={15} className="text-[#FF4D5E]" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-black tracking-wider uppercase text-white">
              FLOOD EVENT
            </span>
            <span className="text-[9px] font-black tracking-widest text-[#FF4D5E]">
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
