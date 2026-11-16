import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Play,
  TrendingDown,
  Users,
  Activity,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import RocCurveChart from '../charts/RocCurveChart';
import ConfusionMatrix from '../charts/ConfusionMatrix';
import FeatureImportanceChart from '../charts/FeatureImportanceChart';
import { api } from '../services/api';

export default function ChurnAnalysisPage({ churnMeta, onChurnModelTrained }) {
  const [inactivityDays, setInactivityDays] = useState(90);
  const [training, setTraining] = useState(false);
  const [selectedModelKey, setSelectedModelKey] = useState(churnMeta?.best_model || 'gradient_boosting');

  const modelComparison = churnMeta?.model_comparison || [];
  const bestModelName = churnMeta?.best_model_name;
  const explanation = churnMeta?.explanation;
  const riskBreakdown = churnMeta?.risk_breakdown || {};
  const featureImportances = churnMeta?.feature_importances || [];
  const rocCurves = churnMeta?.roc_curves || {};
  const prepMeta = churnMeta?.prep_metadata || {};

  // Selected model confusion matrix
  const currentModelComp = modelComparison.find(m => m.model_key === selectedModelKey) || modelComparison[0] || {};
  const confusionMatrixData = currentModelComp.confusion_matrix || {};

  const handleRetrain = async () => {
    setTraining(true);
    try {
      await api.trainChurnModel({
        inactivity_threshold_days: Number(inactivityDays)
      });
      if (onChurnModelTrained) onChurnModelTrained();
    } catch (err) {
      console.error(err);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Supervised Churn Prediction & Risk Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-leakage-free chronological observation window evaluating customer departure probability within a future horizon.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs">
            <span className="text-slate-500 font-medium pl-1">Inactivity Window:</span>
            <select
              value={inactivityDays}
              onChange={(e) => setInactivityDays(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded px-2 py-0.5 font-bold text-slate-800 focus:outline-none"
            >
              <option value={60}>60 Days Inactivity</option>
              <option value={90}>90 Days (Standard)</option>
              <option value={120}>120 Days Inactivity</option>
            </select>
          </div>

          <button
            onClick={handleRetrain}
            disabled={training}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${training ? 'animate-spin' : ''}`} />
            <span>{training ? 'Training Classifiers...' : 'Re-train Churn Models'}</span>
          </button>
        </div>
      </div>

      {/* Leakage Prevention Methodology Notice */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block uppercase tracking-wider text-[11px] text-blue-800">
            Temporal Leakage-Prevention Protocol Enforced
          </span>
          <p className="leading-relaxed text-blue-800">
            Feature vectors (recency, frequency, spend cadence, SKU diversity) were computed strictly prior to chronological cutoff{' '}
            <span className="font-mono font-bold text-slate-900">{prepMeta.cutoff_date || 'Cutoff Date'}</span>. Future transactions were isolated solely to construct binary departure ground-truth labels.
          </p>
        </div>
      </div>

      {/* Risk Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              High Attrition Risk (&gt;65%)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-rose-900 font-mono">
              {riskBreakdown.high_risk || 0}
            </h3>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {riskBreakdown.high_risk_pct || 0}% of accounts
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Imminent probability of permanent customer abandonment; require immediate targeted win-back outreach.
          </p>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Medium Risk (35% - 65%)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-amber-900 font-mono">
              {riskBreakdown.medium_risk || 0}
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {riskBreakdown.medium_risk_pct || 0}% of accounts
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Decelerating order frequency or extending inter-purchase gaps; prime candidates for engagement vouchers.
          </p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Low Risk (&lt;35%)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-emerald-900 font-mono">
              {riskBreakdown.low_risk || 0}
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {riskBreakdown.low_risk_pct || 0}% of accounts
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Healthy purchasing cadence and strong ongoing brand affinity; candidates for loyalty milestone upsells.
          </p>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Supervised Classifier Benchmark Matrix
            </h2>
            <p className="text-xs text-slate-500">Held-out 25% stratified test evaluation</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Champion Model: {bestModelName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Classifier</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
                <th className="px-4 py-3 text-right">Precision</th>
                <th className="px-4 py-3 text-right">Recall (Sensitivity)</th>
                <th className="px-4 py-3 text-right">F1-Score</th>
                <th className="px-4 py-3 text-right">ROC-AUC</th>
                <th className="px-4 py-3 text-center">Select for Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {modelComparison.map((m) => {
                const isSelected = selectedModelKey === m.model_key;
                return (
                  <tr
                    key={m.model_key}
                    onClick={() => setSelectedModelKey(m.model_key)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{m.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800">
                      {m.accuracy !== undefined ? (m.accuracy * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800">
                      {m.precision !== undefined ? m.precision.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800">
                      {m.recall !== undefined ? m.recall.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                      {m.f1_score !== undefined ? m.f1_score.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                      {m.roc_auc !== undefined ? m.roc_auc.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name="selectedModelMatrix"
                        checked={isSelected}
                        onChange={() => setSelectedModelKey(m.model_key)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {explanation && (
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            <b>Model Selection Rationale:</b> {explanation}
          </p>
        )}
      </div>

      {/* Visualizations Grid: ROC Curve + Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Receiver Operating Characteristic (ROC) Curves
            </h2>
            <p className="text-xs text-slate-500">
              True Positive Rate vs False Positive Rate trade-offs across discrimination thresholds
            </p>
          </div>
          <RocCurveChart
            rocCurves={rocCurves}
            modelComparison={modelComparison}
          />
        </div>

        <div>
          <ConfusionMatrix
            matrix={confusionMatrixData}
            modelName={currentModelComp.name}
          />
        </div>
      </div>

      {/* Feature Importance Ranking */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900">
            Predictive Feature Importance Breakdown
          </h2>
          <p className="text-xs text-slate-500">
            Gini impurity reduction weights revealing key behavioral triggers preceding customer churn
          </p>
        </div>
        <FeatureImportanceChart data={featureImportances} />
      </div>
    </div>
  );
}
