import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Waves,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Bell,
  Settings,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useApp, VERIFIED_LOCATIONS } from '../context/AppContext';
import {
  fetchAlerts,
  fetchAlertSummary,
  acknowledgeAlertApi,
  resolveAlertApi,
  refreshAlertsApi,
} from '../services/alertApi';
import AlertCard from '../components/alerts/AlertCard';
import AlertMap from '../components/alerts/AlertMap';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';
import NotificationSettingsModal from '../components/alerts/NotificationSettingsModal';

export default function Alerts() {
  const navigate = useNavigate();
  const { selectedLocation, setSelectedLocation } = useApp() || {};

  // Data states
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    critical_count: 0,
    high_risk_count: 0,
    active_warnings_count: 0,
    areas_requiring_attention_count: 0,
    total_active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [classificationFilter, setClassificationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [sortBy, setSortBy] = useState('newest');
  const [timeHorizon, setTimeHorizon] = useState('all');

  // Selected item & Modals
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dossierAlert, setDossierAlert] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load alerts and summary from API
  const loadAlertsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const locationId = selectedLocation?.id || 'all';

      const [alertsRes, summaryRes] = await Promise.all([
        fetchAlerts({
          location_id: locationId === 'all' ? undefined : locationId,
          sort_by: sortBy,
          include_simulated: true,
        }),
        fetchAlertSummary(locationId === 'all' ? undefined : locationId),
      ]);

      if (alertsRes && alertsRes.data) {
        setAlerts(alertsRes.data);
      }
      if (summaryRes && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Unable to load real-time alerts. Showing verified baseline hazards.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocation?.id, sortBy]);

  // Initial load and on location/sort changes
  useEffect(() => {
    loadAlertsData();
  }, [loadAlertsData]);

  // Trigger server-side dynamic alert evaluation & seed
  const handleServerRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshAlertsApi(selectedLocation?.id);
      await loadAlertsData(true);
    } catch (e) {
      console.warn('Refresh note:', e);
      await loadAlertsData(true);
    }
  };

  // Handle acknowledge
  const handleAcknowledge = async (alertId) => {
    try {
      const res = await acknowledgeAlertApi(alertId, 'EOC Duty Officer');
      if (res && res.data) {
        setAlerts((prev) =>
          prev.map((a) => (a.alert_id === alertId ? { ...a, status: 'Acknowledged' } : a))
        );
        if (dossierAlert && dossierAlert.alert_id === alertId) {
          setDossierAlert((prev) => ({ ...prev, status: 'Acknowledged' }));
        }
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  // Handle resolve
  const handleResolve = async (alertId, resolutionNote) => {
    try {
      const res = await resolveAlertApi(alertId, 'EOC Commander', resolutionNote);
      if (res && res.data) {
        setAlerts((prev) =>
          prev.map((a) => (a.alert_id === alertId ? { ...a, status: 'Resolved' } : a))
        );
        if (dossierAlert && dossierAlert.alert_id === alertId) {
          setDossierAlert((prev) => ({ ...prev, status: 'Resolved' }));
        }
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  // Plan evacuation route handler
  const handlePlanEvacuation = (alert) => {
    navigate('/evacuation-routing', {
      state: {
        targetLocationId: alert.location_id,
        obstacleSegment: alert.affected_road_segments,
        routeId: alert.evacuation_route_id,
      },
    });
  };

  // Client-side filtering
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = alert.title?.toLowerCase().includes(q);
        const matchesMandal = alert.mandal?.toLowerCase().includes(q);
        const matchesDesc = alert.description?.toLowerCase().includes(q);
        const matchesCat = alert.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMandal && !matchesDesc && !matchesCat) return false;
      }

      // Severity
      if (severityFilter !== 'ALL' && alert.severity !== severityFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && alert.category !== categoryFilter) {
        return false;
      }

      // Classification
      if (classificationFilter !== 'ALL' && alert.classification !== classificationFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL' && alert.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [alerts, searchQuery, severityFilter, categoryFilter, classificationFilter, statusFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSeverityFilter('ALL');
    setCategoryFilter('ALL');
    setClassificationFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('newest');
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-8 font-sans">
      {/* 1. MASTER HEADER & CONTROLS */}
      <div className="bg-white rounded-xl border border-[#DCE6F5] p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <h1 className="text-xl font-bold text-[#0F265C] tracking-tight">
              Flood Alerts & Early Warning
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Live Hydro-Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Real-time multi-source hydrological hazards, telemetry breaches, and spatial evacuation advisories for Srikakulam District, Andhra Pradesh.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto">
          {/* Location Selector (Sync with AppContext) */}
          <div className="relative min-w-[210px] flex-1 sm:flex-initial">
            <select
              value={selectedLocation?.id || 'all'}
              onChange={(e) => {
                const loc = VERIFIED_LOCATIONS.find((l) => l.id === e.target.value);
                if (loc && setSelectedLocation) setSelectedLocation(loc);
              }}
              className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-[#0F265C] rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {VERIFIED_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleServerRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Refresh alerts from sensors and models"
          >
            <RefreshCw size={13} className={`text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Notification Settings Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Bell size={13} />
            <span>Alert Settings</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Critical Alerts */}
        <div className="bg-white rounded-xl border border-red-200/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              Critical Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F265C] mb-1">
              {summary.critical_count}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
              <span>Immediate threat to life & lowlands</span>
            </div>
          </div>
        </div>

        {/* Card 2: High-Risk Alerts */}
        <div className="bg-white rounded-xl border border-orange-200/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              High-Risk Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F265C] mb-1">
              {summary.high_risk_count}
            </div>
            <div className="text-[11px] text-slate-500">
              Escalating inundation watch
            </div>
          </div>
        </div>

        {/* Card 3: Active Flood Warnings */}
        <div className="bg-white rounded-xl border border-blue-200/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Active Flood Warnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Waves size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F265C] mb-1">
              {summary.active_warnings_count}
            </div>
            <div className="text-[11px] text-slate-500">
              River & heavy rainfall bulletins
            </div>
          </div>
        </div>

        {/* Card 4: Areas Requiring Attention */}
        <div className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Areas Requiring Attention
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MapPin size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F265C] mb-1">
              {summary.areas_requiring_attention_count}
            </div>
            <div className="text-[11px] text-slate-500">
              Impacted mandals in Srikakulam
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-xl border border-[#DCE6F5] p-3 sm:p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts, mandals, roads..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
              <option value="Informational">Informational</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Heavy Rainfall Alert">Heavy Rainfall</option>
              <option value="River Water-Level Alert">River Water-Level</option>
              <option value="Flood Risk Alert">Flood Risk</option>
              <option value="Observed Flood Inundation Alert">Observed Inundation</option>
              <option value="Road Closure Alert">Road Closure</option>
              <option value="Evacuation Advisory">Evacuation Advisory</option>
              <option value="Shelter Accessibility Alert">Shelter Alert</option>
              <option value="Simulation Scenario Alert">Simulation Scenario</option>
            </select>

            {/* Classification Filter */}
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Classifications</option>
              <option value="OFFICIAL">Official Bulletin</option>
              <option value="OBSERVED">Observed Telemetry</option>
              <option value="MODEL_ESTIMATED">Model Estimated</option>
              <option value="SIMULATED">Simulated Scenario</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Status Count Summary Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 flex-wrap gap-2">
          <div>
            Showing <span className="font-bold text-[#0F265C]">{filteredAlerts.length}</span> of{' '}
            <span className="font-bold text-[#0F265C]">{alerts.length}</span> alerts in Srikakulam
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>{filteredAlerts.filter((a) => a.severity === 'Critical').length} Critical</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>{filteredAlerts.filter((a) => a.severity === 'High').length} High</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{filteredAlerts.filter((a) => a.severity === 'Moderate').length} Moderate</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. SPLIT WORKSPACE: ALERTS FEED (LEFT) + INTERACTIVE GIS MAP (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Alert Cards Feed (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Loading live alerts & river telemetry...
              </p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#0F265C] mb-1">
                No active alerts match current criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                No active alerts are available for the selected location based on the currently accessible data.
              </p>
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.alert_id}
                alert={alert}
                isSelected={selectedAlert?.alert_id === alert.alert_id}
                onSelect={(a) => setSelectedAlert(a)}
                onOpenDossier={(a) => setDossierAlert(a)}
                onPlanEvacuation={handlePlanEvacuation}
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </div>

        {/* Right Column: Interactive Alert GIS Map (5 cols on lg, sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 flex flex-col gap-3">
          <div className="h-[460px] xl:h-[520px]">
            <AlertMap
              alerts={filteredAlerts}
              selectedAlert={selectedAlert}
              onSelectAlert={(alert) => setSelectedAlert(alert)}
              onOpenDossier={(alert) => setDossierAlert(alert)}
              onPlanEvacuation={handlePlanEvacuation}
            />
          </div>

          {/* Quick Context Tip */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-xs text-slate-500 flex items-start gap-2 shadow-2xs">
            <AlertCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700">Map Interaction: </span>
              Click any alert marker on the GIS map to zoom and inspect the localized hydrological hazard. Use "Route" to feed blocked corridors into the evacuation solver.
            </div>
          </div>
        </div>
      </div>

      {/* 5. DOSSIER MODAL */}
      <AlertDetailsModal
        alert={dossierAlert}
        isOpen={Boolean(dossierAlert)}
        onClose={() => setDossierAlert(null)}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        onFocusMap={(alert) => {
          setSelectedAlert(alert);
        }}
      />

      {/* 6. NOTIFICATION SETTINGS MODAL */}
      <NotificationSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

