import React from 'react';
import { BarChart3, CheckCircle2, ShieldAlert, Zap, Award, HelpCircle } from 'lucide-react';

export default function ModelEvaluationPage({ clusteringMeta }) {
  const comparisonTable = clusteringMeta?.comparison_table || [];
  const selectedModel = clusteringMeta?.selected_model;
  const rationale = clusteringMeta?.selection_rationale;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Clustering Algorithm Evaluation & Benchmarking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Objective evaluation metrics measuring cluster compactness, separation distance, and computational efficiency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Empirical Validation Active
          </span>
        </div>
      </div>

      {/* Model Selection Strategy Banner */}
      <div className="bg-white border-2 border-blue-600 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Award className="w-4 h-4 text-blue-600" />
          Production Model Selection Rationale
        </div>
        <h2 className="text-base font-bold text-slate-900 capitalize">
          Selected Architecture: {selectedModel}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {rationale}
        </p>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-3 p-5">
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Unsupervised Algorithm Comparison Table
          </h2>
          <span className="text-xs text-slate-500">N = 3 Algorithms Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3 text-right">
                  Silhouette Score
                  <span className="block text-[9px] font-normal text-slate-400 lowercase">(higher is better)</span>
                </th>
                <th className="px-4 py-3 text-right">
                  Davies-Bouldin
                  <span className="block text-[9px] font-normal text-slate-400 lowercase">(lower is better)</span>
                </th>
                <th className="px-4 py-3 text-right">
                  Calinski-Harabasz
                  <span className="block text-[9px] font-normal text-slate-400 lowercase">(higher is better)</span>
                </th>
                <th className="px-4 py-3 text-center">Clusters</th>
                <th className="px-4 py-3 text-right">Noise %</th>
                <th className="px-4 py-3 text-right">Exec Time</th>
                <th className="px-4 py-3 text-center">Selection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {comparisonTable.map((row) => {
                const isSelected = row.model_id === selectedModel;
                return (
                  <tr
                    key={row.model_id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/40 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{row.strengths}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {row.silhouette_score !== null ? row.silhouette_score.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {row.davies_bouldin_index !== null ? row.davies_bouldin_index.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {row.calinski_harabasz_score !== null ? row.calinski_harabasz_score.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-800">
                      {row.n_clusters}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {row.noise_pct}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {row.execution_time_ms} ms
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Selected Model
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Benchmark Alternative</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metric Interpretability Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Metric 1
          </span>
          <h3 className="font-bold text-slate-900 text-sm">Silhouette Coefficient</h3>
          <p className="text-slate-500 leading-relaxed">
            Measures how similar an account is to its own cluster compared to other clusters. Values range from -1 to +1, where values &gt; 0.35 indicate robust cohort cohesion.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Metric 2
          </span>
          <h3 className="font-bold text-slate-900 text-sm">Davies-Bouldin Index</h3>
          <p className="text-slate-500 leading-relaxed">
            Evaluates the average similarity between each cluster and its most similar peer. Lower scores signify tighter cluster cohesion and greater inter-cluster distance.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
            Metric 3
          </span>
          <h3 className="font-bold text-slate-900 text-sm">Calinski-Harabasz Score</h3>
          <p className="text-slate-500 leading-relaxed">
            Also known as the Variance Ratio Criterion. Computes the ratio of between-cluster dispersion to within-cluster dispersion. Higher values denote superior partition quality.
          </p>
        </div>
      </div>
    </div>
  );
}
