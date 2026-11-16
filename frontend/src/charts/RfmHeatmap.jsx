import React from 'react';

export default function RfmHeatmap({ correlation = {} }) {
  const features = correlation.features || ['recency', 'frequency', 'monetary', 'aov', 'tenure'];
  const matrix = correlation.matrix || [];

  const featureLabels = {
    recency: 'Recency',
    frequency: 'Frequency',
    monetary: 'Monetary',
    aov: 'AOV',
    tenure: 'Tenure'
  };

  const getCellColor = (val) => {
    if (val === 1) return 'bg-blue-600 text-white font-bold';
    if (val > 0.6) return 'bg-blue-500 text-white';
    if (val > 0.3) return 'bg-blue-200 text-blue-900';
    if (val > 0.1) return 'bg-blue-50 text-blue-800';
    if (val > -0.1) return 'bg-slate-50 text-slate-700';
    if (val > -0.3) return 'bg-amber-50 text-amber-800';
    if (val > -0.6) return 'bg-rose-100 text-rose-900';
    return 'bg-rose-500 text-white';
  };

  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No correlation matrix available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-2 border border-slate-200 bg-slate-50 text-slate-500 font-medium text-left">
              Feature
            </th>
            {features.map((f) => (
              <th
                key={f}
                className="p-2 border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-center uppercase tracking-wider"
              >
                {featureLabels[f] || f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((rowName, rIdx) => (
            <tr key={rowName}>
              <td className="p-2 border border-slate-200 bg-slate-50 font-semibold text-slate-700">
                {featureLabels[rowName] || rowName}
              </td>
              {features.map((colName, cIdx) => {
                const val = matrix[rIdx] ? matrix[rIdx][cIdx] : 0;
                return (
                  <td
                    key={`${rowName}-${colName}`}
                    className={`p-2 border border-slate-200 text-center font-mono transition-colors ${getCellColor(
                      val
                    )}`}
                    title={`Correlation between ${featureLabels[rowName]} and ${featureLabels[colName]}: ${val}`}
                  >
                    {val !== undefined ? val.toFixed(2) : '0.00'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 px-1">
        <span>-1.0 (Strong Negative)</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-2 bg-rose-500 inline-block rounded-xs"></span>
          <span className="w-3 h-2 bg-slate-100 inline-block rounded-xs"></span>
          <span className="w-3 h-2 bg-blue-600 inline-block rounded-xs"></span>
        </div>
        <span>+1.0 (Strong Positive)</span>
      </div>
    </div>
  );
}
