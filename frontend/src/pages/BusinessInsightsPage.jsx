import React, { useState } from 'react';
import {
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  Target,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import CustomerModal from '../components/CustomerModal';

export default function BusinessInsightsPage({ combinedInsights, recommendations = [] }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeTab, setActiveTab] = useState('cross-matrix');

  const comparisonMatrix = combinedInsights?.comparison_matrix || [];
  const crossTab = combinedInsights?.cross_tabulation || [];
  const priorityQueue = combinedInsights?.priority_retention_queue || [];
  const totalRevenueAtStake = combinedInsights?.total_revenue_at_stake || 0;
  const strategicTakeaway = combinedInsights?.strategic_takeaway;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Strategic Insights & Recommendation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bridging unsupervised customer segmentation with supervised churn risk to drive prescriptive business decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            ${totalRevenueAtStake.toLocaleString()} VIP Revenue At Risk
          </span>
        </div>
      </div>

      {/* Strategic Takeaway Callout */}
      {strategicTakeaway && (
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            Executive Retention Intelligence
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {strategicTakeaway}
          </p>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('cross-matrix')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'cross-matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cross-Matrix: Segment vs Churn Risk
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'recommendations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Prescriptive Action Recommendations ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('paradigm-comparison')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'paradigm-comparison'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Segmentation vs Churn Paradigm Comparison
        </button>
      </div>

      {/* Tab 1: Cross-Matrix & Priority Queue */}
      {activeTab === 'cross-matrix' && (
        <div className="space-y-6">
          {/* Cross-tabulation table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Cross-Tabulation Matrix: Segment × Churn Risk
              </h2>
              <p className="text-xs text-slate-500">
                Identifies high-value customers at immediate statistical risk of attrition.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Customer Segment</th>
                    <th className="px-4 py-3 text-right text-rose-700">High Risk (&gt;65%)</th>
                    <th className="px-4 py-3 text-right text-amber-700">Medium Risk (35-65%)</th>
                    <th className="px-4 py-3 text-right text-emerald-700">Low Risk (&lt;35%)</th>
                    <th className="px-4 py-3 text-right">Total Accounts</th>
                    <th className="px-4 py-3 text-right">High Risk Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {crossTab.map((row) => (
                    <tr key={row.segment} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {row.segment}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 bg-rose-50/30">
                        {row.high_risk}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-600">
                        {row.medium_risk}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">
                        {row.low_risk}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800">
                        {row.total}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                        {row.high_risk_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Priority VIP Retention Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Priority VIP Retention Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Champions, Loyal Customers, & Big Spenders flagged with elevated departure risk
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                {priorityQueue.length} Priority Targets
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Customer ID</th>
                    <th className="px-4 py-2.5">Segment</th>
                    <th className="px-4 py-2.5 text-right">Lifetime Spend</th>
                    <th className="px-4 py-2.5 text-right">Order Count</th>
                    <th className="px-4 py-2.5 text-right">Recency</th>
                    <th className="px-4 py-2.5 text-center">Departure Probability</th>
                    <th className="px-4 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {priorityQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        No VIP accounts currently flagged with critical departure risk.
                      </td>
                    </tr>
                  ) : (
                    priorityQueue.map((c) => (
                      <tr
                        key={c.customer_id}
                        onClick={() => setSelectedCustomerId(c.customer_id)}
                        className="hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="px-4 py-2.5 font-mono font-medium text-slate-900">
                          #{c.customer_id}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-semibold text-slate-800">{c.segment}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(c.monetary)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                          {c.frequency} orders
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                          {c.recency} d
                        </td>
                        <td className="px-4 py-2.5 text-center font-mono font-bold text-rose-600">
                          {(c.churn_probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomerId(c.customer_id);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Deploy Intervention &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prescriptive Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: rec.badge_bg, color: rec.badge_text }}
                  >
                    {rec.segment_name}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Priority: {rec.priority}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {rec.title}
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider mb-1">
                      Action To Take
                    </span>
                    <p className="text-slate-800 leading-relaxed">{rec.action}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                      Target Audience
                    </span>
                    <p className="text-slate-700 mt-0.5">{rec.target}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                      Empirical Rationale
                    </span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{rec.rationale}</p>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider block">
                      Expected Business Benefit
                    </span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{rec.expected_benefit}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Paradigm Comparison Table */}
      {activeTab === 'paradigm-comparison' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Analytical Comparison: Customer Segmentation vs Churn Prediction
            </h2>
            <p className="text-xs text-slate-500">
              Contrasting Unsupervised Pattern Discovery with Supervised Risk Classification
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left w-1/5">Dimension</th>
                  <th className="px-4 py-3 text-left w-2/5 text-blue-700 bg-blue-50/40">
                    Customer Segmentation (Unsupervised)
                  </th>
                  <th className="px-4 py-3 text-left w-2/5 text-emerald-700 bg-emerald-50/40">
                    Churn Prediction (Supervised)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {comparisonMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {item.dimension}
                    </td>
                    <td className="px-4 py-3 text-slate-700 leading-relaxed bg-blue-50/10">
                      {item.segmentation}
                    </td>
                    <td className="px-4 py-3 text-slate-700 leading-relaxed bg-emerald-50/10">
                      {item.churn}
                    </td>
                  </tr>
                ))}
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
