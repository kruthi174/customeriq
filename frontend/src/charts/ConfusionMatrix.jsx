import React from 'react';

export default function ConfusionMatrix({ matrix = {}, modelName = "Gradient Boosting Classifier" }) {
  const tn = matrix.true_negative ?? 0;
  const fp = matrix.false_positive ?? 0;
  const fn = matrix.false_negative ?? 0;
  const tp = matrix.true_positive ?? 0;
  const total = tn + fp + fn + tp;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Confusion Matrix
          </h4>
          <p className="text-[11px] text-slate-500">Evaluated on held-out test split for {modelName}</p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          N = {total} accounts
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {/* True Negative */}
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-center space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 tracking-wide block uppercase">
            True Negative (TN)
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700 block">
            {tn}
          </span>
          <span className="text-[10px] text-emerald-600 block">
            Correctly Classified Retained
          </span>
        </div>

        {/* False Positive */}
        <div className="bg-rose-50 border border-rose-200 rounded p-3 text-center space-y-1">
          <span className="text-[10px] font-bold text-rose-800 tracking-wide block uppercase">
            False Positive (FP)
          </span>
          <span className="text-2xl font-bold font-mono text-rose-700 block">
            {fp}
          </span>
          <span className="text-[10px] text-rose-600 block">
            Type I Error (False Alarm)
          </span>
        </div>

        {/* False Negative */}
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center space-y-1">
          <span className="text-[10px] font-bold text-amber-800 tracking-wide block uppercase">
            False Negative (FN)
          </span>
          <span className="text-2xl font-bold font-mono text-amber-700 block">
            {fn}
          </span>
          <span className="text-[10px] text-amber-600 block">
            Type II Error (Missed Churn)
          </span>
        </div>

        {/* True Positive */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center space-y-1">
          <span className="text-[10px] font-bold text-blue-800 tracking-wide block uppercase">
            True Positive (TP)
          </span>
          <span className="text-2xl font-bold font-mono text-blue-700 block">
            {tp}
          </span>
          <span className="text-[10px] text-blue-600 block">
            Correctly Predicted Churn
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">Specificity</span>
          <span className="font-semibold text-slate-800 font-mono">
            {total > 0 ? ((tn / (tn + fp || 1)) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Sensitivity (Recall)</span>
          <span className="font-semibold text-slate-800 font-mono">
            {total > 0 ? ((tp / (tp + fn || 1)) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Precision</span>
          <span className="font-semibold text-slate-800 font-mono">
            {total > 0 ? ((tp / (tp + fp || 1)) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
