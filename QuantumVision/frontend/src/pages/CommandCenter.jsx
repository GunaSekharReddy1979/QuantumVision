import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNavbar from '../components/layout/TopNavbar';
import DisasterMap from '../components/map/DisasterMap';
import LayerControlPanel from '../components/map/LayerControlPanel';
import LowerContextualPanel from '../components/layout/LowerContextualPanel';

// Page & Panel components
import Dashboard from './Dashboard';
import RightInformationPanel from '../components/dashboard/RightInformationPanel';
import HazardMapLeftPanel from '../components/dashboard/HazardMapLeftPanel';
import HazardMapRightPanel from '../components/dashboard/HazardMapRightPanel';
import FloodIntelligencePanel from '../components/dashboard/FloodIntelligencePanel';
import FloodImpactRightPanel from '../components/dashboard/FloodImpactRightPanel';
import Navigation from './Navigation';
import NavigationRightPanel from '../components/dashboard/NavigationRightPanel';
import DisasterSimulation from './DisasterSimulation';
import RiskPrediction from './RiskPrediction';
import Reports from './Reports';
import FloodPrediction from './FloodPrediction';

import { useMap } from '../context/MapContext';
import { X, Sparkles } from 'lucide-react';

export default function CommandCenter() {
  const { activeNavTab, setActiveNavTab, setLayers } = useMap();
  const location = useLocation();
  const navigate = useNavigate();

  // Route synchronization
  useEffect(() => {
    const path = location.pathname;
    if (path === '/overview' || path === '/') setActiveNavTab('OVERVIEW');
    else if (path === '/hazard-map') setActiveNavTab('HAZARD MAP');
    else if (path === '/risk-analysis') setActiveNavTab('RISK ANALYSIS');
    else if (path === '/flood' || path === '/flood-prediction') setActiveNavTab('FLOOD PREDICTION');
    else if (path === '/navigation') setActiveNavTab('NAVIGATION');
    else if (path === '/simulation') setActiveNavTab('SIMULATION');
    else if (path === '/reports') setActiveNavTab('REPORTS');
  }, [location.pathname]);

  const isMapHeroTab = ['OVERVIEW', 'HAZARD MAP', 'NAVIGATION', 'SIMULATION'].includes(activeNavTab);

  return (
    <div className="w-screen h-screen bg-[#02050D] p-1.5 flex flex-col overflow-hidden font-sans select-none">
      {/* Outer Cockpit Bezel Enclosure */}
      <div className="relative flex-1 w-full h-full rounded-xl border border-[#143257] shadow-[0_0_50px_rgba(0,0,0,0.95),inset_0_0_20px_rgba(25,211,255,0.05)] bg-[#030814] overflow-hidden flex flex-col">
        {/* 1. TOP COMMAND-CENTER HEADER (Section 3) */}
        <TopNavbar />

        {/* 2. MAIN 3-ZONE COMMAND-CENTER VIEWPORT (Section 5 & 27) */}
        <main className="flex-1 flex overflow-hidden p-2.5 gap-3 min-h-0 relative">
          {/* THREE-ZONE HERO MAP LAYOUT FOR EOC OPERATIONS */}
          {isMapHeroTab && (
            <>
              {/* LEFT ZONE: 20-23% Width (Information / Controls) */}
              <aside className="w-[22%] min-w-[280px] max-w-[350px] flex-shrink-0 h-full overflow-y-auto custom-scrollbar z-20">
                {activeNavTab === 'OVERVIEW' && <Dashboard />}
                {activeNavTab === 'HAZARD MAP' && <HazardMapLeftPanel />}
                {activeNavTab === 'FLOOD' && <FloodIntelligencePanel />}
                {activeNavTab === 'NAVIGATION' && <Navigation />}
                {activeNavTab === 'SIMULATION' && <DisasterSimulation />}
              </aside>

              {/* CENTER ZONE: 55-65% Width (The HERO Digital Twin Map) */}
              <section className="flex-1 min-w-0 h-full relative rounded-lg border border-[#143257] bg-[#030814] overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] z-10">
                {/* Floating GIS Layer Control Bar (Section 9) */}
                <LayerControlPanel />

                {/* Digital Twin Map of Srikakulam (Section 7, 8, 10) */}
                <DisasterMap />

                {/* Simulation Watermark Overlay */}
                {activeNavTab === 'SIMULATION' && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1 rounded bg-[#A855F7]/20 border border-[#A855F7]/60 text-purple-200 font-mono text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse">
                    [SIMULATION MODE &bull; DYNAMIC WHAT-IF ANALYSIS]
                  </div>
                )}
              </section>

              {/* RIGHT ZONE: 20-23% Width (Current Event / Risk / Alerts / Telemetry) */}
              <aside className="w-[22%] min-w-[280px] max-w-[350px] flex-shrink-0 h-full overflow-y-auto custom-scrollbar z-20">
                {activeNavTab === 'OVERVIEW' && <RightInformationPanel />}
                {activeNavTab === 'HAZARD MAP' && <HazardMapRightPanel />}
                {activeNavTab === 'FLOOD' && <FloodImpactRightPanel />}
                {activeNavTab === 'NAVIGATION' && <NavigationRightPanel />}
                {activeNavTab === 'SIMULATION' && <FloodImpactRightPanel />}
              </aside>
            </>
          )}

          {/* DEDICATED ANALYTICAL RISK ANALYSIS PAGE (Section 15) */}
          {activeNavTab === 'RISK ANALYSIS' && (
            <section className="flex-1 h-full overflow-hidden z-20">
              <RiskPrediction />
            </section>
          )}

          {/* DEDICATED FLOOD PREDICTION INTELLIGENCE PAGE */}
          {activeNavTab === 'FLOOD PREDICTION' && (
            <section className="flex-1 h-full overflow-hidden z-20">
              <FloodPrediction />
            </section>
          )}

          {/* DEDICATED DISASTER INTELLIGENCE REPORTS PAGE (Section 18) */}
          {activeNavTab === 'REPORTS' && (
            <section className="flex-1 h-full overflow-hidden z-20">
              <Reports />
            </section>
          )}
        </main>

        {/* 3. LOWER MODEL STATUS STRIP (Section 19: RF, XGBoost, VQC, QNN, A*, Dijkstra) */}
        <LowerContextualPanel />
      </div>
    </div>
  );
}
