import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Database,
  UploadCloud,
  Bell,
  ChevronDown,
  Check,
  ShieldCheck,
  User
} from 'lucide-react';
import { api } from '../services/api';

export default function Header({
  activeDataset = 'Online Retail Sample (UCI)',
  dateRange = '2025-01-01 to 2025-12-31',
  onOpenUpload,
  onGlobalSearch
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatasetMenu, setShowDatasetMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onGlobalSearch && searchQuery.trim()) {
      onGlobalSearch(searchQuery.trim());
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer ID, segment, or metrics (Press Enter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dataset Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDatasetMenu(!showDatasetMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="max-w-[150px] truncate">{activeDataset}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDatasetMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-40 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                Active Dataset
              </span>
              <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{activeDataset}</p>
                  <p className="text-[10px] text-slate-500">Validated Transaction Records</p>
                </div>
                <Check className="w-4 h-4 text-blue-600" />
              </div>

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  onClick={() => {
                    setShowDatasetMenu(false);
                    onOpenUpload();
                  }}
                  className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 text-blue-600 font-medium flex items-center gap-2"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload Custom CSV...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date Range Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{dateRange}</span>
        </div>

        {/* Upload Dataset CTA */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload CSV</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-1.5 right-1.5"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-40 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">System Telemetry</span>
                <span className="text-[10px] text-blue-600 font-medium">Real-time</span>
              </div>
              <div className="space-y-2 pt-2">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <p className="font-medium text-slate-800">Unsupervised Model Retrained</p>
                  <p className="text-[10px] text-slate-500">K-Means (k=4) evaluated with Silhouette 0.369.</p>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <p className="font-medium text-slate-800">Retention Alert</p>
                  <p className="text-[10px] text-slate-500">High churn risk identified in core customer accounts.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
            JD
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              Enterprise Admin
            </span>
            <span className="text-[10px] text-slate-500 block leading-tight">
              Customer Analytics Team
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
