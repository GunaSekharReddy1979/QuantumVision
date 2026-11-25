import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  Layers,
  Compass,
  GitFork,
  ExternalLink,
  CheckCircle2,
  Calendar,
  CloudRain,
  Activity,
  FileCheck,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateTimeIST } from '../../utils/formatters';

const SEVERITY_COLORS = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' },
  Moderate: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', bar: 'bg-amber-500' },
  Low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' },
  Informational: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', bar: 'bg-slate-400' },
};

export default function AlertDetailsModal({
  alert,
  isOpen = false,
  onClose = () => {},
  onAcknowledge = () => {},
  onResolve = () => {},
  onFocusMap = () => {},
}) {
  const navigate = useNavigate();
  const [resolutionNote, setResolutionNote] = useState('');
  const [showResolveInput, setShowResolveInput] = useState(false);

  if (!isOpen || !alert) return null;

  const sev = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.Moderate;
  const isSimulated = alert.classification === 'SIMULATED';
  const isAcknowledged = alert.status === 'Acknowledged';
  const isResolved = alert.status === 'Resolved';

  const handleResolveSubmit = () => {
    onResolve(alert.alert_id, resolutionNote || 'Resolved by EOC Operator after field verification.');
    setShowResolveInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {alert.alert_id}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${sev.bg} ${sev.text} ${sev.border}`}>
                {alert.severity} Severity
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {alert.classification}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  isResolved
                    ? 'bg-slate-100 text-slate-600'
                    : isAcknowledged
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                Status: {alert.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F265C] leading-snug">
              {alert.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close dossier"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* Simulation Disclaimer Callout if SIMULATED */}
          {isSimulated && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wide">
                  SIMULATED SCENARIO — NOT AN OFFICIAL EMERGENCY WARNING
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  This advisory was generated synthetically by the QuantumVision Flood Simulation engine for training, stress testing, and scenario planning. Do not treat as real-world operational bulletin.
                </p>
              </div>
            </div>
          )}

          {/* Narrative & Description */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Incident Narrative & Hydro-Spatial Summary
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {alert.description}
            </p>
          </div>

          {/* Key Metric Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Location & Mandal */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Target Geographic Area
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                <span>{alert.location_name || alert.mandal}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Coordinates: {alert.latitude?.toFixed(4)}°N, {alert.longitude?.toFixed(4)}°E
              </div>
              <div className="text-[11px] text-slate-500">
                Mandal: {alert.mandal || 'Srikakulam'}, Srikakulam District
              </div>
            </div>

            {/* Time Validity */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Advisory Window (IST)
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Clock size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-[11px]">Observed: {formatDateTimeIST(alert.observation_time)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium mt-1">
                <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-[11px]">Valid Until: {formatDateTimeIST(alert.valid_until)}</span>
              </div>
            </div>

            {/* Technical Trigger */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Trigger Criteria & Protocol
              </span>
              <div className="font-mono text-xs font-semibold text-[#0F265C] bg-slate-50 p-1.5 rounded border border-slate-200/80">
                {alert.trigger_condition || 'Standard anomaly detection'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Source: {alert.source || 'Hydrological Telemetry Network'}
              </div>
            </div>

            {/* Model & Verification Index */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Risk / Vulnerability Index
                </span>
                <span className="font-bold text-xs text-[#0F265C]">
                  {alert.risk_score ? (alert.risk_score * 100).toFixed(0) + '%' : 'N/A'}
                </span>
              </div>
              {alert.risk_score ? (
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${sev.bar}`}
                    style={{ width: `${Math.min(100, alert.risk_score * 100)}%` }}
                  />
                </div>
              ) : null}
              <div className="text-[11px] text-slate-500">
                Model: {alert.model_version || 'QuantumVision Hydro-DEM'}
              </div>
            </div>
          </div>

          {/* Road Impacts & Evacuation SOP */}
          {(alert.affected_road_segments || alert.recommended_action || alert.evacuation_route_id) && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 text-xs space-y-2">
              <h4 className="font-bold text-[#0F265C] text-xs uppercase tracking-wide flex items-center gap-1.5">
                <GitFork size={14} className="text-blue-600" />
                <span>Evacuation Protocol & Action Guidelines</span>
              </h4>

              {alert.affected_road_segments && (
                <div className="text-slate-700 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                  <span className="font-semibold text-rose-700">Restricted Corridors: </span>
                  <span>{alert.affected_road_segments}</span>
                </div>
              )}

              {alert.recommended_action && (
                <div className="text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-blue-100">
                  <span className="font-semibold text-slate-900">Standard Operating Protocol: </span>
                  <span>{alert.recommended_action}</span>
                </div>
              )}

              {alert.evacuation_route_id && (
                <div className="text-[11px] text-slate-600">
                  Pre-computed Corridors: <span className="font-mono font-bold text-blue-700">{alert.evacuation_route_id}</span>
                </div>
              )}
            </div>
          )}

          {/* Cross-Module Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Connected Operational Modules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  onFocusMap(alert);
                  onClose();
                }}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>View on Map</span>
                <Compass size={14} className="text-blue-600" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/flood-risk');
                }}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Flood Risk Page</span>
                <Shield size={14} className="text-blue-600" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/evacuation-routing');
                }}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Plan Evacuation</span>
                <GitFork size={14} className="text-blue-600" />
              </button>
            </div>
          </div>

          {/* Resolve Note Form */}
          {showResolveInput && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Resolution Officer Note / Verification Details
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="E.g., Field teams confirmed water levels receded below warning mark. Normal traffic restored."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowResolveInput(false)}
                  className="px-3 py-1 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveSubmit}
                  className="px-3 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {!isAcknowledged && !isResolved && (
              <button
                onClick={() => onAcknowledge(alert.alert_id)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} className="text-slate-500" />
                <span>Acknowledge</span>
              </button>
            )}

            {!isResolved && !showResolveInput && (
              <button
                onClick={() => setShowResolveInput(true)}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck size={14} className="text-emerald-600" />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

