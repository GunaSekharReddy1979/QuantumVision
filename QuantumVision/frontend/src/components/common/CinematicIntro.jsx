import React, { useEffect, useState } from 'react';

export default function CinematicIntro({ onComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 600);
    const timer2 = setTimeout(() => setStage(2), 1200);
    const timer3 = setTimeout(() => setStage(3), 1800);
    const timer4 = setTimeout(() => onComplete(), 2400);

    const handleKeyDown = () => onComplete();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div 
      onClick={onComplete}
      className="fixed inset-0 bg-[#050B14] flex flex-col items-center justify-center z-50 overflow-hidden font-mono cursor-pointer"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-15 bg-[linear-gradient(to_right,#19D3FF_1px,transparent_1px),linear-gradient(to_bottom,#19D3FF_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Content */}
      <div className="z-10 text-center flex flex-col items-center px-4">
        <div className="text-xs text-[#19D3FF] font-bold tracking-[0.3em] uppercase mb-2">
          SYSTEM BOOT &bull; EMERGENCY OPERATIONS CENTER
        </div>

        <h1 
          className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2"
          style={{ textShadow: '0 0 25px rgba(25, 211, 255, 0.6)' }}
        >
          QUANTUM<span className="text-[#19D3FF]">VISION</span>
        </h1>

        <p className="text-[#94A3B8] uppercase tracking-widest text-xs md:text-sm mb-8 font-sans max-w-lg">
          INTELLIGENT DISASTER NAVIGATION & EMERGENCY EVACUATION MANAGEMENT
        </p>

        <div className="w-72 md:w-96 text-left bg-[#07111F]/80 p-4 rounded border border-[#19D3FF]/30 shadow-[0_0_20px_rgba(25,211,255,0.15)]">
          <div className="flex justify-between text-xs text-[#19D3FF] font-bold mb-2">
            <span>CALIBRATING SATELLITE & GIS ENGINE</span>
            <span>{Math.min(100, Math.round((stage / 3) * 100))}%</span>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#19D3FF] to-[#287BFF] transition-all duration-500 ease-out"
              style={{ width: `${(stage / 3) * 100}%` }}
            />
          </div>

          <div className="mt-3 space-y-1.5 text-[11px] text-[#94A3B8]">
            <div className={stage >= 0 ? 'text-[#19D3FF]' : 'opacity-30'}>
              &gt; Loading Sentinel-1 SAR dual-date inundation layers... OK
            </div>
            <div className={stage >= 1 ? 'text-[#19D3FF]' : 'opacity-30'}>
              &gt; Initializing Srikakulam 171k node road graph... OK
            </div>
            <div className={stage >= 2 ? 'text-[#19D3FF]' : 'opacity-30'}>
              &gt; Loading Random Forest, XGBoost & VQC quantum models... OK
            </div>
            <div className={stage >= 3 ? 'text-[#32E875] font-bold' : 'opacity-30'}>
              &gt; SYSTEM ONLINE. Entering Emergency Operations Center.
            </div>
          </div>
        </div>

        <button 
          onClick={onComplete}
          className="mt-6 text-[10px] text-[#94A3B8] hover:text-white uppercase tracking-wider border border-[#19D3FF]/30 hover:border-[#19D3FF] px-4 py-2 rounded bg-[#0A1626]/60 transition-all cursor-pointer shadow-[0_0_10px_rgba(25,211,255,0.2)]"
        >
          CLICK ANYWHERE OR PRESS ESC TO ENTER COMMAND CENTER
        </button>
      </div>
    </div>
  );
}
