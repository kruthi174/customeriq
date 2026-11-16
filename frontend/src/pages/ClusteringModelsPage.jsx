import React, { useState } from 'react';
import { Cpu, Play, Settings2, BarChart2, Layers, CheckCircle2 } from 'lucide-react';
import PcaScatterChart from '../charts/PcaScatterChart';
import ElbowChart from '../charts/ElbowChart';
import { api } from '../services/api';

export default function ClusteringModelsPage({ clusteringMeta, onModelUpdated }) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('kmeans');
  const [kValue, setKValue] = useState(clusteringMeta?.n_clusters || 4);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('pca');

  const pcaScatter = clusteringMeta?.pca_scatter || [];
  const pcaMeta = clusteringMeta?.pca_meta || {};
  const kmeansEval = clusteringMeta?.kmeans_evaluation || {};
  const hierarchicalEval = clusteringMeta?.hierarchical_evaluation || {};
  const dbscanEval = clusteringMeta?.dbscan_evaluation || {};

  const handleRetrain = async () => {
    setRunning(true);
    try {
      await api.runClustering({
        algorithm: selectedAlgorithm,
        n_clusters: Number(kValue)
      });
      if (onModelUpdated) onModelUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Unsupervised Clustering Models Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Systematic benchmarking across K-Means++, Hierarchical Agglomerative Clustering, and Density-Based Spatial Clustering (DBSCAN).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs">
            <span className="text-slate-500 font-medium pl-1">Clusters (K):</span>
            <select
              value={kValue}
              onChange={(e) => setKValue(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded px-2 py-0.5 font-bold text-slate-800 focus:outline-none"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((k) => (
                <option key={k} value={k}>
                  {k} Clusters
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRetrain}
            disabled={running}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Executing Model...' : 'Re-fit Clusters'}</span>
          </button>
        </div>
      </div>

      {/* Selected Model Status Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
              Selected Production Configuration
            </span>
            <h3 className="text-sm font-bold text-white capitalize">
              {clusteringMeta?.selected_model} (k={clusteringMeta?.n_clusters || 4})
            </h3>
          </div>
        </div>
        <p className="text-slate-300 max-w-xl text-[11px] leading-relaxed">
          {clusteringMeta?.selection_rationale}
        </p>
      </div>

      {/* Tab Navigation for Visualizations */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pca')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'pca'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          PCA 2D Cluster Space
        </button>
        <button
          onClick={() => setActiveTab('elbow')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'elbow'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Elbow Method & Silhouette Curve
        </button>
        <button
          onClick={() => setActiveTab('hierarchical')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'hierarchical'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hierarchical Linkages & Dendrogram
        </button>
        <button
          onClick={() => setActiveTab('dbscan')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'dbscan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          DBSCAN Density Parameter Grid
        </button>
      </div>

      {/* View Content */}
      {activeTab === 'pca' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Principal Component Analysis (PCA) Cluster Scatter
            </h2>
            <p className="text-xs text-slate-500">
              Interactive 2D projection of customer accounts colored by assigned cluster ID.
            </p>
          </div>
          <PcaScatterChart data={pcaScatter} pcaMeta={pcaMeta} />
        </div>
      )}

      {activeTab === 'elbow' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              K-Means Elbow Method & Silhouette Cohesion Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Evaluates inertia drop-off (within-cluster sum of squares) and silhouette score across K=2 through K=8.
            </p>
          </div>
          <ElbowChart
            data={kmeansEval?.elbow_curve}
            recommendedK={kmeansEval?.recommended_k}
          />
        </div>
      )}

      {activeTab === 'hierarchical' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Agglomerative Hierarchical Clustering Linkages
            </h2>
            <p className="text-xs text-slate-500">
              Comparison between Ward, Average, and Complete variance minimization linkages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {Object.entries(hierarchicalEval?.linkage_comparison || {}).map(([link, data]) => (
              <div key={link} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <span className="font-bold text-slate-800 capitalize block">
                  Linkage: {link}
                </span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Silhouette Score:</span>
                    <span className="font-mono font-bold text-slate-900">{data.metrics?.silhouette ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Davies-Bouldin:</span>
                    <span className="font-mono text-slate-900">{data.metrics?.davies_bouldin ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calinski-Harabasz:</span>
                    <span className="font-mono text-slate-900">{data.metrics?.calinski_harabasz ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Execution Time:</span>
                    <span className="font-mono text-slate-500">{data.execution_time_ms} ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dendrogram merges preview */}
          <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
            <div className="bg-slate-50 px-4 py-2 font-semibold text-xs text-slate-700">
              Representative Ward Dendrogram Merges (Top Clustering Iterations)
            </div>
            <div className="p-3 text-xs max-h-48 overflow-y-auto font-mono text-slate-600 space-y-1">
              {(hierarchicalEval?.dendrogram_data || []).slice(0, 15).map((node) => (
                <div key={node.step} className="flex justify-between border-b border-slate-100 py-0.5">
                  <span>Step {node.step}: Merged Node {node.node_1} + Node {node.node_2}</span>
                  <span className="text-slate-500">Distance: {node.distance} | Cluster Size: {node.cluster_size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dbscan' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              DBSCAN Parameter Exploration Grid (Epsilon × Min Samples)
            </h2>
            <p className="text-xs text-slate-500">
              Identifies core, border, and unclassified noise points across density thresholds.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Epsilon (ε)</th>
                  <th className="px-3 py-2 text-left">Min Samples</th>
                  <th className="px-3 py-2 text-right">Valid Clusters</th>
                  <th className="px-3 py-2 text-right">Core Points</th>
                  <th className="px-3 py-2 text-right">Border Points</th>
                  <th className="px-3 py-2 text-right">Noise Points</th>
                  <th className="px-3 py-2 text-right">Noise %</th>
                  <th className="px-3 py-2 text-right">Silhouette</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(dbscanEval?.grid_results || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-semibold text-slate-800">{row.eps}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{row.min_samples}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-900">{row.n_clusters}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-600">{row.core_points}</td>
                    <td className="px-3 py-2 text-right font-mono text-blue-600">{row.border_points}</td>
                    <td className="px-3 py-2 text-right font-mono text-rose-600">{row.noise_points}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-500">{row.noise_pct}%</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                      {row.silhouette !== null ? row.silhouette : 'N/A (invalid)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
