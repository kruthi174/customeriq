import React from 'react';

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  badge
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
          {value}
        </h3>
        {badge && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center text-xs space-x-1.5">
          {trend && (
            <span
              className={`font-semibold ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
