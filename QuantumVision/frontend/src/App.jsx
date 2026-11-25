import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';

// Code-split route components via dynamic imports
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RainfallForecast = lazy(() => import('./pages/RainfallForecast'));
const FloodRiskAssessment = lazy(() => import('./pages/FloodRiskAssessment'));
const Alerts = lazy(() => import('./pages/Alerts'));
const EvacuationRouting = lazy(() => import('./pages/EvacuationRouting'));
const Comparisons = lazy(() => import('./pages/Comparisons'));
const ModelPerformance = lazy(() => import('./pages/ModelPerformance'));
const Simulation = lazy(() => import('./pages/Simulation'));
const Reports = lazy(() => import('./pages/Reports'));
const DataManagement = lazy(() => import('./pages/DataManagement'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
      <div className="w-9 h-9 border-3 border-blue-200 border-t-[#2167F3] rounded-full animate-spin" />
      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Loading module...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Page 1: Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/overview" element={<Navigate to="/dashboard" replace />} />

          {/* Page 2: Rainfall Forecast */}
          <Route path="/rainfall" element={<RainfallForecast />} />
          <Route path="/rainfall-forecast" element={<Navigate to="/rainfall" replace />} />

          {/* Page 3: Flood Risk Assessment */}
          <Route path="/flood-risk" element={<FloodRiskAssessment />} />
          <Route path="/risk-prediction" element={<Navigate to="/flood-risk" replace />} />
          <Route path="/risk" element={<Navigate to="/flood-risk" replace />} />

          {/* Page 4: Flood Alerts & Early Warning */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/early-warning" element={<Navigate to="/alerts" replace />} />
          <Route path="/flood-alerts" element={<Navigate to="/alerts" replace />} />

          {/* Page 5: Evacuation & Routing */}
          <Route path="/evacuation-routing" element={<EvacuationRouting />} />
          <Route path="/navigation" element={<Navigate to="/evacuation-routing" replace />} />
          <Route path="/routing" element={<Navigate to="/evacuation-routing" replace />} />

          {/* Page 6: Comparisons & Graphs */}
          <Route path="/comparisons" element={<Comparisons />} />
          <Route path="/analytics" element={<Navigate to="/comparisons" replace />} />
          <Route path="/graphs" element={<Navigate to="/comparisons" replace />} />

          {/* Page 7: Model Performance */}
          <Route path="/model-performance" element={<ModelPerformance />} />
          <Route path="/models" element={<Navigate to="/model-performance" replace />} />

          {/* Page 8: Simulation */}
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/disaster-simulation" element={<Navigate to="/simulation" replace />} />

          {/* Page: Reports & Analysis */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/analysis" element={<Navigate to="/reports" replace />} />

          {/* Page 9: Data Management */}
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/datasets" element={<Navigate to="/data-management" replace />} />

          {/* Page 10: Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Legacy redirects */}
          <Route path="/map-layers" element={<Navigate to="/dashboard" replace />} />
          <Route path="/map" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
