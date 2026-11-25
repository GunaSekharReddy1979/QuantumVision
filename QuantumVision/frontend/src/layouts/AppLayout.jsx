import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CloudRain,
  ShieldAlert,
  AlertTriangle,
  Waves,
  GitFork,
  BarChart2,
  Activity,
  Database,
  Settings,
  MapPin,
  Calendar,
  Bell,
  Menu,
  Sparkles,
  FileText,
  Compass,
  CheckCircle2,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateTimeIST } from '../utils/formatters';
import { fetchNotifications } from '../services/alertApi';
import NotificationSettingsModal from '../components/alerts/NotificationSettingsModal';

export default function AppLayout() {
  const { selectedLocation, systemStatus, lastUpdated } = useApp() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => formatDateTimeIST(new Date()));
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDateTimeIST(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mainRef = React.useRef(null);

  // Close mobile sidebar and reset scroll position to top upon navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Fetch active notifications for bell
  useEffect(() => {
    let mounted = true;
    const loadNotifs = async () => {
      try {
        const res = await fetchNotifications(6);
        if (mounted && res && res.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        // Fallback silently if offline
      }
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [notificationsOpen]);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rainfall', label: 'Rainfall Forecast', icon: CloudRain },
    { to: '/flood-risk', label: 'Flood Risk Assessment', icon: ShieldAlert },
    { to: '/alerts', label: 'Flood Alerts & Early Warning', icon: AlertTriangle },
    { to: '/simulation', label: 'Simulation', icon: Waves },
    { to: '/evacuation-routing', label: 'Evacuation & Routing', icon: GitFork },
    { to: '/comparisons', label: 'Comparisons & Graphs', icon: BarChart2 },
    { to: '/model-performance', label: 'Model Performance', icon: Activity },
    { to: '/data-management', label: 'Data Management', icon: Database },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full h-screen bg-[#F4F7FC] flex flex-col overflow-hidden font-sans text-slate-800">
      {/* 1. TOP HEADER */}
      <header className="w-full h-[70px] bg-white border-b border-[#E5EBF5] px-4 sm:px-6 flex items-center justify-between z-40 flex-shrink-0">
        {/* Left Section: Brand Logo & Subtitle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 mr-1 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Stylized Quantum Blue Logo Icon */}
          <div className="w-[38px] h-[38px] rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Sparkles size={19} className="text-white" />
          </div>

          <div className="flex flex-col whitespace-nowrap min-w-0">
            <span className="font-bold text-[17px] text-[#0F265C] tracking-tight leading-tight">
              QuantumVision
            </span>
            <span className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">
              AI + Quantum for a Safer Tomorrow
            </span>
          </div>

          <div className="hidden xl:flex items-center ml-4 pl-4 border-l border-slate-200 whitespace-nowrap flex-shrink-0">
            <span className="text-xs font-semibold text-slate-700">
              Srikakulam Flood Response EOC
            </span>
          </div>
        </div>

        {/* Right Section: Location | Date & Time | System Status | Notification Bell | User Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Location Badge */}
          <div className="flex items-center gap-1.5 text-xs text-[#2563EB] font-medium bg-[#F0F5FF] px-2.5 py-1 rounded-md border border-[#D6E4FF]">
            <MapPin size={13} className="text-[#2563EB] flex-shrink-0" />
            <span className="hidden lg:inline">
              {selectedLocation?.name?.replace(' (District-wide)', '') || 'Srikakulam District'}, AP
            </span>
            <span className="lg:hidden">
              {selectedLocation?.name?.replace(' (District-wide)', '') || 'Srikakulam'}
            </span>
          </div>

          {/* Separator */}
          <span className="hidden md:inline text-slate-200">|</span>

          {/* Date & Time */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 font-normal">
            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
            <span>{currentTime}</span>
          </div>

          {/* System Online Status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-normal pl-1">
            <span className={`w-2 h-2 rounded-full ${systemStatus === 'OFFLINE' ? 'bg-rose-500' : 'bg-[#10B981]'}`}></span>
            <span className="hidden lg:inline">
              {systemStatus === 'OFFLINE' ? 'System Offline' : 'System Live'}
            </span>
          </div>

          {/* Notification Bell Dropdown Container */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer flex-shrink-0 ml-1"
              title="Flood Alerts & Early Warning"
              aria-label="View notifications"
            >
              <Bell size={15} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {notificationsOpen && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-blue-600" />
                    <span className="font-bold text-xs text-[#0F265C]">
                      Early Warning Alerts ({notifications.length})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      setSettingsModalOpen(true);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Notification settings"
                  >
                    <Sliders size={13} />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No unacknowledged flood alerts at this time.
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isCrit = n.severity === 'Critical';
                      const isHigh = n.severity === 'High';
                      return (
                        <div
                          key={n.alert_id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/alerts');
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                isCrit
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : isHigh
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {n.severity}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {n.mandal || 'Srikakulam'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[#0F265C] line-clamp-1">
                            {n.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {n.trigger_condition || n.description}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Srikakulam EOC Operations
                  </span>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/alerts');
                    }}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Alerts</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Circular Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#0F265C] text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
            NV
          </div>
        </div>
      </header>

      {/* 2. BODY CONTAINER: SIDEBAR (LEFT) + MAIN WORKSPACE (RIGHT) */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-[70px] bg-slate-900/30 backdrop-blur-2xs z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar */}
        <aside
          style={{ width: '225px', minWidth: '225px', maxWidth: '225px' }}
          className={`fixed inset-y-0 left-0 top-[70px] z-30 w-[225px] bg-[#F7FAFF] border-r border-[#E5EBF5] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:top-0 lg:translate-x-0 flex-shrink-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
            }`}
        >
          {/* Navigation Links List */}
          <div className="px-3 py-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                location.pathname === tab.to ||
                (tab.to === '/dashboard' && (location.pathname === '/' || location.pathname === '/overview'));

              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={`flex items-center gap-2.5 px-3 h-10 rounded-lg text-[13px] transition-all ${isActive
                      ? 'bg-[#2563EB] text-white font-medium shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-normal'
                    }`}
                >
                  <Icon
                    size={17}
                    className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}
                  />
                  <span className="truncate leading-none">{tab.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Sidebar Branding Snippet */}
          <div className="p-3 pb-3.5 border-t border-[#E5EBF5] flex-shrink-0 bg-[#F7FAFF]">
            <div className="flex items-center gap-2.5 px-1 py-0.5">
              <div className="w-7 h-7 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0">
                <CloudRain size={15} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-[#0F265C] truncate leading-tight">QuantumVision</span>
                <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">Smarter Forecasts &bull; Safer Communities</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. MAIN WORKSPACE VIEWPORT (Background #F4F7FC) */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F4F7FC] p-4 sm:p-5 xl:p-6 min-w-0"
        >
          <Outlet />
        </main>
      </div>

      {/* Global Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
}
