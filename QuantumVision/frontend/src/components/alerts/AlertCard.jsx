import React from 'react';
import {
  AlertTriangle,
  CloudRain,
  ShieldAlert,
  Waves,
  Navigation,
  Compass,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  GitFork,
  Radio,
  FileText,
  AlertOctagon,
  Cpu,
} from 'lucide-react';
import { formatDateTimeIST } from '../../utils/formatters';

const SEVERITY_CONFIG = {
  Critical: {
    border: 'border-l-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-700',
  },
  High: {
    border: 'border-l-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
  },
  Moderate: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
  },
  Low: {
    border: 'border-l-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
  },
  Informational: {
    border: 'border-l-slate-400',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    text: 'text-slate-600',
  },
};

const CLASSIFICATION_CONFIG = {
  OFFICIAL: {
    label: 'OFFICIAL BULLETIN',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  OBSERVED: {
    label: 'OBSERVED EVENT',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  MODEL_ESTIMATED: {
    label: 'MODEL ESTIMATED',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  SIMULATED: {
    label: 'SIMULATED SCENARIO',
    badge: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
  },
};

function getCategoryIcon(category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('rain')) return CloudRain;
  if (cat.includes('river') || cat.includes('water')) return Waves;
  if (cat.includes('closure') || cat.includes('road')) return AlertOctagon;
  if (cat.includes('evacuation')) return Navigation;
  if (cat.includes('shelter')) return Building;
  if (cat.includes('simulation')) return Cpu;
  return ShieldAlert;
}

export default function AlertCard({
  alert,
  isSelected = false,
  onSelect = () => {},
  onOpenDossier = () => {},
  onPlanEvacuation = () => {},
  onAcknowledge = () => {},
}) {
  if (!alert) return null;

  const severityCfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.Moderate;
  const classificationCfg = CLASSIFICATION_CONFIG[alert.classification] || CLASSIFICATION_CONFIG.MODEL_ESTIMATED;
  const CategoryIcon = getCategoryIcon(alert.category);
  const isSimulated = alert.classification === 'SIMULATED';
  const isAcknowledged = alert.status === 'Acknowledged';
  const isResolved = alert.status === 'Resolved';

  return (
    <div
      onClick={() => onSelect(alert)}
      className={`relative bg-white rounded-xl border border-l-4 transition-all duration-150 p-4 shadow-2xs hover:shadow-sm cursor-pointer ${
        severityCfg.border
      } ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50/20'
          : 'border-slate-200 hover:border-slate-300'
      } ${isResolved ? 'opacity-65' : ''}`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Category Pill */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
            <CategoryIcon size={13} className="text-blue-600 flex-shrink-0" />
            <span>{alert.category}</span>
          </div>

          {/* Classification Tag */}
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${
              classificationCfg.badge
            }`}
          >
            {classificationCfg.label}
          </span>
        </div>

        {/* Severity Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
              severityCfg.badge
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${severityCfg.dot}`}></span>
            {alert.severity}
          </span>
        </div>
      </div>

      {/* Strict Simulated Warning Callout if SIMULATED */}
      {isSimulated && (
        <div className="mb-2.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
          <span>SIMULATED — NOT AN OFFICIAL WARNING (Scenario Planning Only)</span>
        </div>
      )}

      {/* Alert Title */}
      <h3 className="text-sm sm:text-[15px] font-bold text-[#0F265C] leading-snug mb-1">
        {alert.title}
      </h3>

      {/* Mandal & Geographic Location */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
        <MapPin size={13} className="text-blue-600 flex-shrink-0" />
        <span className="text-slate-800 font-semibold">{alert.location_name || alert.mandal}</span>
        {alert.mandal && <span className="text-slate-400">&bull; {alert.mandal} Mandal, Srikakulam</span>}
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
        {alert.description}
      </p>

      {/* Trigger Condition Highlight Box */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5 mb-3 text-xs">
        <div className="flex items-start gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 flex-shrink-0">
            Trigger:
          </span>
          <span className="font-mono text-[11px] text-[#0F265C] font-semibold">
            {alert.trigger_condition || 'Model threshold breach'}
          </span>
        </div>

        {alert.affected_road_segments && (
          <div className="flex items-start gap-1.5 mt-1.5 pt-1.5 border-t border-slate-200/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 mt-0.5 flex-shrink-0">
              Corridor:
            </span>
            <span className="text-[11px] text-slate-700 font-medium">
              {alert.affected_road_segments}
            </span>
          </div>
        )}
      </div>

      {/* Metadata & Actions Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
        {/* Source & Timestamp */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="truncate max-w-[170px]" title={alert.source}>
            {alert.source || 'Hydrological Telemetry'}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock size={11} className="text-slate-400" />
            {formatDateTimeIST(alert.observation_time)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
          {/* Acknowledge Toggle */}
          {!isResolved && (
            <button
              onClick={() => onAcknowledge(alert.alert_id)}
              disabled={isAcknowledged}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 cursor-pointer ${
                isAcknowledged
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={isAcknowledged ? 'Acknowledged by EOC Officer' : 'Mark as Acknowledged'}
            >
              <CheckCircle2 size={12} className={isAcknowledged ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{isAcknowledged ? 'Acked' : 'Ack'}</span>
            </button>
          )}

          {/* Plan Evacuation (if route/corridor available) */}
          {(alert.evacuation_route_id || alert.affected_road_segments || alert.category === 'Evacuation Advisory') && (
            <button
              onClick={() => onPlanEvacuation(alert)}
              className="text-[11px] font-semibold text-[#0F265C] bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="Open Evacuation & Routing module with this obstacle"
            >
              <GitFork size={12} className="text-blue-600" />
              <span>Route</span>
            </button>
          )}

          {/* Dossier Modal Button */}
          <button
            onClick={() => onOpenDossier(alert)}
            className="text-[11px] font-semibold text-white bg-[#2563EB] hover:bg-blue-700 px-3 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span>Dossier</span>
            <ExternalLink size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

