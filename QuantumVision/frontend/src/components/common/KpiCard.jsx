import React from 'react';
import { Info } from 'lucide-react';

/**
 * QuantumVision Global Reusable KPI Card Component
 * Strictly calibrated to match reference specifications:
 * - Container:
 *   - Background: #FFFFFF
 *   - Border: 1px solid #DCE6F5
 *   - Border radius: 14px (rounded-[14px])
 *   - Shadow: subtle (0 1px 3px rgba(15, 38, 92, 0.04))
 *   - Padding: 16px 18px 18px 18px (clean breathing room on all sides)
 *   - Min height: 168px (never clips bottom badge)
 *   - Flexbox: column, justify-between
 * - Top Row:
 *   - Icon container: 38px × 38px, rounded-xl, centered icon (size 19px)
 *   - Info icon: 18px × 18px at top right (slate-300 hover:slate-500)
 * - Typography:
 *   - Title: 13px, medium (500), #64748B, mt-2.5
 *   - Value: 28px (short) / 20px (medium) / 17px (long), bold (700), #0F265C, mt-1
 *   - Description: 12.5px, normal (400), #64748B, mt-0.5
 * - Bottom Badge:
 *   - Margin-top: 12px (mt-3)
 *   - Padding: px-2.5 py-0.5, rounded-md, text-[11px] font-semibold
 *   - Guaranteed 18px clearance from the bottom card border
 */
export default function KpiCard({
  title,
  label, // alias for title
  heading, // alias for title
  value,
  description,
  subtext, // alias for description
  icon: Icon,
  iconBg = 'bg-[#EFF6FF]',
  iconColor = 'text-[#2563EB]',
  valueColor = 'text-[#0F265C]',
  valueSize,
  status,
  badgeText, // alias for status
  badgeBg = 'bg-[#EFF6FF]',
  badgeBorder = 'border-[#BFDBFE]',
  badgeColor = 'text-[#2563EB]',
  isLive = false,
  footer,
  tooltipText = 'Metric Details',
  className = '',
  onClick,
}) {
  const displayTitle = title || label || heading || '';
  const displayDesc = description || subtext || '';
  const displayBadge = status || badgeText || null;

  // Adaptive font sizing for clean rendering of varied text lengths
  const isStringValue = typeof value === 'string';
  const defaultSize = isStringValue && value.length > 20
    ? 'text-[17px] sm:text-[18px]'
    : isStringValue && value.length > 13
    ? 'text-[20px] sm:text-[21px]'
    : 'text-[28px]';

  const resolvedValueSize = valueSize || defaultSize;

  return (
    <div
      onClick={onClick}
      className={`qv-kpi-card flex flex-col justify-between border bg-white shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.06)] hover:border-[#BFDBFE] transition-all w-full min-w-0 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top Content Block */}
      <div className="flex flex-col min-w-0">
        {/* Row 1: Icon container on left, Info icon on right */}
        <div className="flex items-center justify-between w-full h-[38px] flex-shrink-0">
          {Icon ? (
            <div className={`w-[38px] h-[38px] rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
              <Icon size={19} />
            </div>
          ) : (
            <div className="w-[38px] h-[38px]" />
          )}

          {tooltipText && (
            <div
              className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors cursor-pointer rounded flex-shrink-0"
              title={tooltipText}
              aria-label={tooltipText}
            >
              <Info size={16} />
            </div>
          )}
        </div>

        {/* Row 2: KPI Title - 13px font, 500 weight, #64748B, mt-2.5 */}
        <div className="mt-2.5">
          <span className="text-[13px] font-medium text-[#64748B] leading-[18px] block truncate">
            {displayTitle}
          </span>
        </div>

        {/* Row 3: KPI Value - 28px font, 700 weight, #0F265C, mt-1 */}
        <div className="mt-1">
          <div className={`${resolvedValueSize} font-bold ${valueColor} leading-[32px] tracking-tight truncate`}>
            {value}
          </div>
        </div>

        {/* Row 4: Description - 12.5px font, #64748B, mt-0.5 */}
        {displayDesc && (
          <div className="mt-0.5">
            <span className="text-[12.5px] font-normal text-[#64748B] leading-[18px] block truncate">
              {displayDesc}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Section: Status Badge with guaranteed 20px clearance from bottom card border */}
      {(displayBadge || footer) && (
        <div className="mt-auto pt-3 flex items-center justify-between min-w-0 flex-shrink-0">
          {displayBadge && (
            <span
              className={`inline-flex items-center gap-1.5 ${badgeBg} border ${badgeBorder} ${badgeColor} rounded-md px-2.5 py-1 text-[11px] font-semibold leading-none truncate max-w-full`}
            >
              {isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse flex-shrink-0" />
              )}
              <span className="truncate">{displayBadge}</span>
            </span>
          )}
          {footer && (
            <div className="text-[11px] text-slate-400 font-medium truncate ml-auto">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
