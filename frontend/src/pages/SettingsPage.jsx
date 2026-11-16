import React, { useState } from 'react';
import { Settings, Database, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage({ onResetSample }) {
  const [inactivityDays, setInactivityDays] = useState(90);
  const [outlierMethod, setOutlierMethod] = useState('iqr');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Platform Settings & Analytical Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global ML hyperparameters, data cleaning rules, and system telemetry parameters.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Platform settings updated successfully.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* ML & Modeling Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Machine Learning Hyperparameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Churn Inactivity Threshold (Days)
              </label>
              <input
                type="number"
                value={inactivityDays}
                onChange={(e) => setInactivityDays(Number(e.target.value))}
                min={30}
                max={365}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Defines account dormancy duration required to trigger a binary churn departure event.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Outlier Detection Strategy
              </label>
              <select
                value={outlierMethod}
                onChange={(e) => setOutlierMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="iqr">Interquartile Range (IQR &gt; 99th Pct + 3×IQR)</option>
                <option value="none">No Outlier Filtering (Raw Transactions)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Prevents wholesale B2B purchases from skewing retail consumer cluster boundaries.
              </span>
            </div>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-slate-600" />
            System Architecture Information
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 text-[10px] block">Backend API Framework</span>
              <span className="font-bold text-slate-800 font-mono text-xs">FastAPI / Uvicorn (ASGI)</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 text-[10px] block">ML Runtime Stack</span>
              <span className="font-bold text-slate-800 font-mono text-xs">Scikit-learn / SciPy / NumPy / Pandas</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 text-[10px] block">Database Engine</span>
              <span className="font-bold text-slate-800 font-mono text-xs">SQLite Embedded</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 text-[10px] block">Frontend Client</span>
              <span className="font-bold text-slate-800 font-mono text-xs">React 18 / Vite / Tailwind CSS / Recharts</span>
            </div>
          </div>
        </div>

        {/* Demonstration Reset Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Restore Demonstration State
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reset active dataset to the standard UCI Online Retail sample baseline.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetSample}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
