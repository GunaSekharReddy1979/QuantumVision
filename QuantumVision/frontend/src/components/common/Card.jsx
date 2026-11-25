import React from 'react';

/**
 * QuantumVision Standard Card Component Suite
 * Conforms to Master UI/UX Design System:
 * - Background: #FFFFFF
 * - Border: 1px solid #DCE6F5
 * - Border-radius: 14px (rounded-[14px])
 * - Subtle shadow: 0 1px 3px rgba(15, 38, 92, 0.04)
 * - Standard internal padding: 16px (p-4) or 20px (p-5)
 * - Header divider: border-b border-[#F1F5F9] pb-2.5 mb-3
 * - Title typography: 14px, semibold (600), #0F265C
 */

export function Card({
  children,
  className = '',
  padding = 'p-5',
  hover = true,
  onClick,
  style,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white border border-[#DCE6F5] rounded-[14px] shadow-[0_1px_3px_rgba(15,38,92,0.04)] ${
        hover ? 'hover:border-[#BFDBFE] hover:shadow-[0_4px_12px_rgba(37,99,235,0.06)] transition-all' : ''
      } ${padding} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  icon: Icon,
  iconColor = 'text-[#2563EB]',
  title,
  subtitle,
  rightElement,
  className = '',
  divider = true,
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        divider ? 'border-b border-[#F1F5F9] pb-2.5 mb-3' : 'mb-2'
      } ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={16} className={`${iconColor} flex-shrink-0`} />}
        <div className="flex flex-col min-w-0">
          <h2 className="text-[14px] font-semibold text-[#0F265C] truncate tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {rightElement && (
        <div className="flex-shrink-0 ml-3 flex items-center gap-2">
          {rightElement}
        </div>
      )}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={`text-[14px] font-semibold text-[#0F265C] tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`min-w-0 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '', divider = true }) {
  return (
    <div
      className={`flex items-center justify-between ${
        divider ? 'border-t border-[#F1F5F9] pt-2.5 mt-3' : 'mt-2'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  children,
  variant = 'info', // 'info' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral'
  isLive = false,
  className = '',
}) {
  const variantStyles = {
    info: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]',
    success: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]',
    warning: 'bg-[#FFF7ED] border-[#FFEDD5] text-[#EA580C]',
    danger: 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]',
    purple: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]',
    neutral: 'bg-slate-100 border-slate-200 text-slate-600',
  };

  const styleClass = variantStyles[variant] || variantStyles.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${styleClass} ${className}`}
    >
      {isLive && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse flex-shrink-0" />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
}

export default Card;

