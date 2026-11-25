import React, { useState, useEffect } from 'react';
import { X, Bell, Volume2, Smartphone, Mail, Shield, Check, Info } from 'lucide-react';

export default function NotificationSettingsModal({ isOpen = false, onClose = () => {} }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('qv_notification_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      inAppDesktop: true,
      audioChimeCritical: true,
      minSeverity: 'all',
      smsGovGateway: false,
      whatsappDispatch: false,
      emailDigest: true,
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (savedSuccess) {
      const timer = setTimeout(() => setSavedSuccess(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [savedSuccess]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('qv_notification_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell size={17} />
            </div>
            <div>
              <h3 className="font-bold text-[#0F265C] text-base">Alert & Early Warning Settings</h3>
              <p className="text-xs text-slate-500">Configure alert channels, audio triggers, and thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Minimum Severity Filter */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[11px]">
              Minimum Alert Severity Threshold
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Alerts', sub: 'Low to Critical' },
                { id: 'moderate', label: 'Moderate +', sub: 'Moderate, High, Critical' },
                { id: 'critical', label: 'Critical Only', sub: 'Immediate life threat' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSettings({ ...settings, minSeverity: opt.id })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.minSeverity === opt.id
                      ? 'border-blue-600 bg-blue-50/50 text-[#0F265C] ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Channels List */}
          <div className="space-y-2.5 pt-2">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
              Dispatch Channels & Notifications
            </span>

            {/* In-app desktop */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-blue-600" />
                <div>
                  <div className="font-bold text-slate-800">In-App Dashboard Alerts</div>
                  <div className="text-[11px] text-slate-500">Live banner and top-nav notification badge</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active
              </span>
            </div>

            {/* Audio chime on critical */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-amber-600" />
                <div>
                  <div className="font-bold text-slate-800">Audio Alarm on Critical Breaches</div>
                  <div className="text-[11px] text-slate-500">Play alert sound for river danger & flood flash warnings</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.audioChimeCritical}
                onChange={(e) => setSettings({ ...settings, audioChimeCritical: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Email Digest */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-600" />
                <div>
                  <div className="font-bold text-slate-800">EOC Operations Email Digest</div>
                  <div className="text-[11px] text-slate-500">Hourly summary dispatch to registered response team</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailDigest}
                onChange={(e) => setSettings({ ...settings, emailDigest: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* WhatsApp / SMS Gateway notice */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Smartphone size={15} className="text-slate-500" />
                <span>External SMS / WhatsApp Telemetry Gateway</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Live cellular broadcast to citizens requires authorized credentials for the AP State Disaster Management Authority (APSDMA) SMS Gateway or Twilio API. In-app alerts remain active.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check size={14} /> Saved successfully!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

