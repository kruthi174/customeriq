import React from 'react';
import { Activity, Calendar, Download, BarChart2, Info } from 'lucide-react';
import DistributionBarChart from '../charts/DistributionBarChart';
import RfmHeatmap from '../charts/RfmHeatmap';
import { api } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function RfmAnalysisPage({ rfmMeta }) {
  const stats = rfmMeta?.statistics || {};
  const correlation = rfmMeta?.correlation || {};
  const tiers = rfmMeta?.spending_tiers || [];
  const refDate = rfmMeta?.reference_date || 'N/A';

  const handleExportRfm = () => {
    window.location.href = api.getExportCsvUrl('rfm');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            RFM Feature Engineering & Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical decomposition of customer behavior into Recency, Frequency, and Monetary dimensions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Ref Date: {refDate}</span>
          </div>
          <button
            onClick={handleExportRfm}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export RFM CSV</span>
          </button>
        </div>
      </div>

      {/* Methodology Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            R - Recency Metric
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Reference Date - Last Purchase
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Measures engagement recency. Lower days indicate high brand recall and active buying intent; high recency signals dormancy risk.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            F - Frequency Metric
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Count of Unique Invoices
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quantifies habitual loyalty. Computed by grouping distinct Invoice numbers to eliminate basket-line duplication bias.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
            M - Monetary Metric
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Sum(Quantity × UnitPrice)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Measures cumulative commercial volume. Filtered for cancelled invoices ('C') and non-commercial zero-price samples.
          </p>
        </div>
      </div>

      {/* Summary Statistical Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-blue-600" />
          Descriptive Statistics of Feature Vectors
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5 text-left">Dimension</th>
                <th className="px-4 py-2.5 text-right">Mean</th>
                <th className="px-4 py-2.5 text-right">Median</th>
                <th className="px-4 py-2.5 text-right">Std Dev</th>
                <th className="px-4 py-2.5 text-right">Min</th>
                <th className="px-4 py-2.5 text-right">25th Pct</th>
                <th className="px-4 py-2.5 text-right">75th Pct</th>
                <th className="px-4 py-2.5 text-right">Max</th>
                <th className="px-4 py-2.5 text-right">Skewness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {['recency', 'frequency', 'monetary', 'aov'].map((dim) => {
                const s = stats[dim] || {};
                const label = dim === 'aov' ? 'Average Order Value ($)' : dim.toUpperCase();
                return (
                  <tr key={dim} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-800 capitalize">
                      {label}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {dim === 'monetary' || dim === 'aov' ? formatCurrency(s.mean) : s.mean}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {dim === 'monetary' || dim === 'aov' ? formatCurrency(s.median) : s.median}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {s.std}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {dim === 'monetary' || dim === 'aov' ? formatCurrency(s.min) : s.min}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {dim === 'monetary' || dim === 'aov' ? formatCurrency(s.p25) : s.p25}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {dim === 'monetary' || dim === 'aov' ? formatCurrency(s.p75) : s.p75}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {dim === 'monetary' || dim === 'aov' ? formatCurrency(s.max) : s.max}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {s.skewness}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualizations Grid: Correlation Heatmap + Spending Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              RFM Correlation Heatmap
            </h2>
            <p className="text-xs text-slate-500">
              Bivariate Pearson correlation coefficients among behavioral dimensions
            </p>
          </div>
          <RfmHeatmap correlation={correlation} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Customer Spending Distribution Tiers
            </h2>
            <p className="text-xs text-slate-500">
              Stratification of customer base across lifetime revenue brackets
            </p>
          </div>
          <div className="space-y-2 pt-2">
            {tiers.map((t) => (
              <div key={t.tier} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">{t.tier}</span>
                <span className="font-mono font-bold text-slate-900">{t.count} accounts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
