import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIST, toBackendDateStr } from '../../utils/formatters';

/**
 * Reusable Global Date Range Filter Component
 * Supports:
 * - Presets: Today, Last 7 Days, Last 30 Days, Historical Period
 * - Custom Date Range with strict max=today validation to prevent future date selection
 * - Formats dates in uniform DD-MM-YYYY format
 */
export default function DateRangeFilter({ className = '', onDateChange = null }) {
  const { datePreset, setDatePreset, dateRange, setCustomDateRange } = useApp();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempStart, setTempStart] = useState(() => dateRange.startDate || toBackendDateStr(new Date()));
  const [tempEnd, setTempEnd] = useState(() => dateRange.endDate || toBackendDateStr(new Date()));

  const todayStr = toBackendDateStr(new Date());

  const handleSelectPreset = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setShowCustomModal(true);
    } else {
      setDatePreset(val);
      if (onDateChange) {
        onDateChange(val);
      }
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (tempStart && tempEnd) {
      if (tempStart > tempEnd) {
        alert('Start date cannot be after end date.');
        return;
      }
      if (tempStart > todayStr || tempEnd > todayStr) {
        alert('Historical observation dates cannot be set in the future.');
        return;
      }
      setCustomDateRange(tempStart, tempEnd);
      setShowCustomModal(false);
      if (onDateChange) {
        onDateChange('custom', { startDate: tempStart, endDate: tempEnd });
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 bg-white border border-[#DCE7F6] rounded-lg px-2.5 h-[36px] shadow-2xs hover:border-[#BFDBFE] transition-colors">
        <Calendar size={13} className="text-[#2563EB] flex-shrink-0" />
        <span className="text-slate-500 font-medium text-xs hidden sm:inline">Period:</span>
        <select
          value={datePreset}
          onChange={handleSelectPreset}
          className="appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="historical">Historical Period (2020-2026)</option>
          <option value="custom">Custom Range...</option>
        </select>
        <ChevronDown size={13} className="text-slate-400 pointer-events-none flex-shrink-0 -ml-3" />
      </div>

      {/* Current Range Label Badge */}
      <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        {formatDateIST(dateRange.startDate)} to {formatDateIST(dateRange.endDate)}
      </span>

      {/* Custom Date Range Modal Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#DCE6F5] p-5 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-sm font-bold text-[#0F265C] mb-1">Select Custom Observation Range</h3>
            <p className="text-xs text-slate-500 mb-4">Dates must be within verified telemetry records (max: Today).</p>

            <form onSubmit={handleApplyCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempStart}
                  max={todayStr}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={tempEnd}
                  max={todayStr}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
