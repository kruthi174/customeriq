import React from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Layers,
  Cpu,
  BarChart3,
  AlertOctagon,
  Lightbulb,
  FileDown,
  Settings,
  CircleDot
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'rfm-analysis', label: 'RFM Analysis', icon: Activity },
  { id: 'customer-segments', label: 'Customer Segments', icon: Layers },
  { id: 'clustering-models', label: 'Clustering Models', icon: Cpu },
  { id: 'model-evaluation', label: 'Model Evaluation', icon: BarChart3 },
  { id: 'churn-analysis', label: 'Churn Analysis', icon: AlertOctagon },
  { id: 'business-insights', label: 'Business Insights', icon: Lightbulb },
  { id: 'reports-exports', label: 'Reports & Exports', icon: FileDown },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center gap-3">
        {/* Minimal geometric customer-data logo symbol */}
        <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="7" r="3.5" fill="currentColor"/>
            <path d="M5 19C5 15.6863 8.134 13 12 13C15.866 13 19 15.6863 19 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="19" cy="5" r="1.8" fill="#93C5FD"/>
            <circle cx="5" cy="5" r="1.5" fill="#60A5FA"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Customer<span className="text-blue-600">IQ</span>
            </h1>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
              SaaS
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[155px]">
            Enterprise Behavioral Platform
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Analytics & Intelligence
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tagline & System Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
          "Understand Customers. Discover Patterns. Drive Growth."
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">ML Engine Active</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
