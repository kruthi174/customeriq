import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function FeatureImportanceChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No feature importance data available
      </div>
    );
  }

  // Format feature names to clean readable labels
  const formattedData = data.map(d => {
    const labelMap = {
      recency: 'Recency at Cutoff (days)',
      frequency: 'Order Frequency',
      monetary: 'Monetary Spend ($)',
      tenure: 'Account Tenure (days)',
      aov: 'Average Order Value (AOV)',
      total_items: 'Total Units Purchased',
      unique_skus: 'Product Breadth (SKUs)',
      avg_interval: 'Avg Days Between Orders'
    };
    return {
      ...d,
      displayName: labelMap[d.feature] || d.feature,
    };
  }).reverse(); // Reverse so highest importance is on top

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={formattedData}
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
          <XAxis
            type="number"
            stroke="#CBD5E1"
            tick={{ fill: '#64748B', fontSize: 10 }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#CBD5E1"
            tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
            width={160}
          />
          <Tooltip
            formatter={(value) => [`${(value * 100).toFixed(1)}% Relative Weight`, 'Importance']}
            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
          />
          <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]}>
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index >= formattedData.length - 2 ? '#1D4ED8' : '#3B82F6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
