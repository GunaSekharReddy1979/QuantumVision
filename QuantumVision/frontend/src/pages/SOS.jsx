import React, { useState } from 'react';
import { 
  AlertCircle, 
  PhoneCall, 
  MapPin, 
  Radio, 
  ShieldAlert, 
  Send,
  Waves,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useMap } from '../context/MapContext';

export default function SOS() {
  const { setCenter } = useMap();
  const [activeTab, setActiveTab] = useState('distress');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [customMsg, setCustomMsg] = useState(
    'FLASH FLOOD WARNING: Nagavali & Vamsadhara river gauge levels approaching danger mark. Evacuate low-lying riverbanks immediately. Report to designated SDRF shelters.'
  );

  const distressSignals = [
    {
      id: 'SOS-SKL-042',
      location: 'Narasannapeta Low Delta (18.4215, 84.0452)',
      time: '3 min ago',
      situation: 'Water entering ground floor, 4 family members trapped',
      lat: 18.4215,
      lon: 84.0452,
      status: 'CRITICAL'
    },
    {
      id: 'SOS-SKL-089',
      location: 'Tekkali Floodplain Culvert (18.6142, 84.2345)',
      time: '12 min ago',
      situation: 'Vehicle stalled in 0.8m fast-moving water',
      lat: 18.6142,
      lon: 84.2345,
      status: 'DISPATCHED'
    },
    {
      id: 'SOS-SKL-104',
      location: 'Palasa Coastal Lowland (18.7667, 84.4167)',
      time: '24 min ago',
      situation: 'Elderly care clinic requires evacuation transport',
      lat: 18.7667,
      lon: 84.4167,
      status: 'PENDING'
    }
  ];

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="flex flex-col space-y-4 text-white pb-6">
      {/* Title */}
      <div className="bg-rose-950/40 backdrop-blur-md p-4 rounded-lg border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)] flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={18} className="text-rose-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold tracking-widest text-rose-200 uppercase">
              Emergency SOS Dispatch
            </h2>
          </div>
          <span className="text-[9px] font-mono bg-rose-900/80 text-rose-200 border border-rose-500/40 px-2 py-0.5 rounded">
            SDRF LIVE UPLINK
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          Centralized distress intake and public warning broadcast for Srikakulam District Emergency Operations Center (DEOC).
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex space-x-1.5 text-[10px] font-mono">
        <button 
          onClick={() => setActiveTab('distress')}
          className={`flex-1 py-1.5 rounded border transition-all ${
            activeTab === 'distress' 
              ? 'bg-rose-500/20 text-rose-200 border-rose-400 font-bold' 
              : 'bg-black/60 text-slate-400 border-white/5'
          }`}
        >
          ACTIVE DISTRESS ({distressSignals.length})
        </button>
        <button 
          onClick={() => setActiveTab('broadcast')}
          className={`flex-1 py-1.5 rounded border transition-all ${
            activeTab === 'broadcast' 
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold' 
              : 'bg-black/60 text-slate-400 border-white/5'
          }`}
        >
          BROADCAST ALERT
        </button>
      </div>

      {/* Distress Signals Tab */}
      {activeTab === 'distress' && (
        <div className="space-y-2.5">
          {distressSignals.map((sig) => (
            <div 
              key={sig.id}
              className="bg-black/75 backdrop-blur-md p-3 rounded-lg border border-rose-500/30 hover:border-rose-400 transition-all space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-300 block">
                    {sig.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin size={10} className="text-rose-400" />
                    <span>{sig.location}</span>
                  </span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                  sig.status === 'CRITICAL' 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                    : sig.status === 'DISPATCHED' 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                }`}>
                  {sig.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-200 font-sans leading-tight bg-slate-900/60 p-2 rounded border border-white/5">
                {sig.situation}
              </p>

              <div className="flex items-center space-x-2 pt-1">
                <button 
                  onClick={() => setCenter({ lat: sig.lat, lon: sig.lon, zoom: 15 })}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono py-1 rounded border border-white/10"
                >
                  Locate
                </button>
                <button 
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold py-1 rounded transition-all shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                >
                  Dispatch SDRF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Alert Tab */}
      {activeTab === 'broadcast' && (
        <div className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-cyan-500/30 space-y-3">
          <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-2">
            <Bell size={15} className="text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-cyan-200 uppercase">
              Cell Broadcast Warning (CAP / NDMA)
            </h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">
              Alert Message Content
            </label>
            <textarea 
              rows={4}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 text-white rounded p-2 text-xs font-sans focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>Target: Srikakulam District Towers</span>
            <span>Channel: Severe Weather Level 3</span>
          </div>

          <button 
            onClick={handleBroadcast}
            className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all duration-200 shadow-[0_0_12px_rgba(244,63,94,0.4)] flex items-center justify-center space-x-1.5"
          >
            <Send size={13} />
            <span>Transmit Emergency Broadcast</span>
          </button>

          {broadcastSent && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded text-xs text-emerald-300 font-mono flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Broadcast dispatched to 14 telecom towers across Nagavali basin!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
