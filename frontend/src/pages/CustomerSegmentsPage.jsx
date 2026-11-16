import React, { useState } from 'react';
import { Layers, Users, DollarSign, Clock, ShoppingBag, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import CustomerModal from '../components/CustomerModal';
import { api } from '../services/api';

export default function CustomerSegmentsPage({ segmentMeta, onSelectCustomer }) {
  const segments = segmentMeta?.segments || [];
  const [activeSegmentDetail, setActiveSegmentDetail] = useState(null);
  const [segmentCustomers, setSegmentCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const handleInspectSegment = async (seg) => {
    setActiveSegmentDetail(seg);
    setLoadingCustomers(true);
    try {
      const res = await api.getCustomers({ segment: seg.name, page: 1, page_size: 50 });
      setSegmentCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Customer Behaviour Segmentation & Profiling
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirically assigned lifecycle segments derived from standardized 3D RFM cluster centroids.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
            {segments.length} Distinct Archetypes Profiled
          </span>
        </div>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map((s) => (
          <div
            key={s.name}
            onClick={() => handleInspectSegment(s)}
            className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
              activeSegmentDetail?.name === s.name ? 'ring-2 ring-blue-600 border-blue-500' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: s.color }}
                ></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cluster #{s.cluster_id}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">
                {s.name}
              </h3>

              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.badge_bg, color: s.badge_text }}>
                {s.importance}
              </span>

              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                {s.behavior}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Account Share:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {s.customer_count} ({s.customer_pct}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Revenue:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatCurrency(s.total_revenue)} ({s.revenue_contribution_pct}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Avg Recency:</span>
                <span className="font-mono text-slate-800">{s.avg_recency_days} days</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Avg Frequency:</span>
                <span className="font-mono text-slate-800">{s.avg_frequency_orders} orders</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Avg Spend:</span>
                <span className="font-mono text-slate-800">{formatCurrency(s.avg_monetary_spend)}</span>
              </div>

              <button
                className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                Inspect Accounts <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Drill-down Segment Accounts View */}
      {activeSegmentDetail && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {activeSegmentDetail.name} — Customer Roster
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: activeSegmentDetail.badge_bg, color: activeSegmentDetail.badge_text }}>
                  {activeSegmentDetail.customer_count} Accounts
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Action Playbook: <span className="font-medium text-slate-700">{activeSegmentDetail.strategy}</span>
              </p>
            </div>

            <button
              onClick={() => setActiveSegmentDetail(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Close Drill-down
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Customer ID</th>
                  <th className="px-4 py-2.5 text-right">Recency</th>
                  <th className="px-4 py-2.5 text-right">Frequency</th>
                  <th className="px-4 py-2.5 text-right">Monetary</th>
                  <th className="px-4 py-2.5 text-right">AOV</th>
                  <th className="px-4 py-2.5 text-center">RFM Score</th>
                  <th className="px-4 py-2.5 text-center">Churn Risk</th>
                  <th className="px-4 py-2.5 text-center">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingCustomers ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      Loading segment accounts...
                    </td>
                  </tr>
                ) : (
                  segmentCustomers.map((c) => (
                    <tr
                      key={c.customer_id}
                      onClick={() => setSelectedCustomerId(c.customer_id)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-900">
                        #{c.customer_id}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                        {c.recency} d
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                        {c.frequency} orders
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(c.monetary)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                        {formatCurrency(c.aov)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-[11px] text-slate-600">
                        {c.rfm_score}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.risk_tier === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {c.risk_tier}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 inline" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCustomerId && (
        <CustomerModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}
