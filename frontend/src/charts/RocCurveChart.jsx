import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function RocCurveChart({ rocCurves = {}, modelComparison = [] }) {
  // Merge the points into a unified series by FPR
  const models = [
    { key: 'gradient_boosting', name: 'Gradient Boosting', color: '#10B981' },
    { key: 'random_forest', name: 'Random Forest', color: '#2563EB' },
    { key: 'logistic_regression', name: 'Logistic Regression', color: '#F59E0B' }
  ];

  // Base diagonal line for random guess
  const sampleSteps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  
  // Interpolate or build chart rows
  const chartData = sampleSteps.map(step => {
    const row = { fpr: step, random_guess: step };
    models.forEach(m => {
      const curve = rocCurves[m.key] || [];
      if (curve.length > 0) {
        // find closest fpr
        const match = curve.reduce((prev, curr) => 
          Math.abs(curr.fpr - step) < Math.abs(prev.fpr - step) ? curr : prev
        );
        row[m.key] = match ? match.tpr : step;
      }
    });
    return row;
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="fpr"
            type="number"
            domain={[0, 1]}
            stroke="#CBD5E1"
            tick={{ fill: '#64748B', fontSize: 11 }}
            label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={[0, 1]}
            stroke="#CBD5E1"
            tick={{ fill: '#64748B', fontSize: 11 }}
            label={{ value: 'True Positive Rate (Sensitivity / Recall)', angle: -90, position: 'insideLeft', offset: 5, fill: '#64748B', fontSize: 11 }}
          />
          <Tooltip
            formatter={(value, name) => [Number(value).toFixed(3), name]}
            labelFormatter={(label) => `FPR: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="random_guess"
            name="Random Guess (AUC = 0.50)"
            stroke="#94A3B8"
            strokeDasharray="4 4"
            dot={false}
          />
          {models.map(m => {
            const comp = modelComparison.find(c => c.model_key === m.key);
            const aucText = comp ? ` (AUC: ${comp.roc_auc})` : '';
            return (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={`${m.name}${aucText}`}
                stroke={m.color}
                strokeWidth={2.2}
                dot={{ r: 3 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
