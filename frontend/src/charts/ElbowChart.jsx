import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';

export default function ElbowChart({ data = [], recommendedK = 4 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No elbow evaluation curve data available
      </div>
    );
  }

  const optimalPoint = data.find(d => d.k === recommendedK);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
            Number of Clusters (K): {label}
          </p>
          <p className="text-blue-400">
            Inertia (WCSS): <span className="font-mono text-white">{payload[0]?.value?.toLocaleString()}</span>
          </p>
          {payload[1] && (
            <p className="text-emerald-400">
              Silhouette Score: <span className="font-mono text-white">{payload[1]?.value}</span>
            </p>
          )}
          {label === recommendedK && (
            <p className="text-amber-300 font-medium text-[10px] pt-1">
              ★ Algorithm Recommended K
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="k"
            stroke="#CBD5E1"
            tick={{ fill: '#64748B', fontSize: 11 }}
            label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }}
          />
          <YAxis
            yAxisId="left"
            stroke="#2563EB"
            tick={{ fill: '#64748B', fontSize: 11 }}
            label={{ value: 'Inertia (Within-Cluster Sum of Squares)', angle: -90, position: 'insideLeft', offset: 0, fill: '#2563EB', fontSize: 10 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1]}
            stroke="#10B981"
            tick={{ fill: '#64748B', fontSize: 11 }}
            label={{ value: 'Silhouette Score', angle: 90, position: 'insideRight', offset: 5, fill: '#10B981', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="inertia"
            name="Inertia (WCSS)"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 4, stroke: '#2563EB', strokeWidth: 1.5, fill: '#EFF6FF' }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="silhouette"
            name="Silhouette Cohesion"
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 4, stroke: '#10B981', strokeWidth: 1.5, fill: '#ECFDF5' }}
            activeDot={{ r: 6 }}
          />
          {optimalPoint && (
            <ReferenceDot
              yAxisId="right"
              x={optimalPoint.k}
              y={optimalPoint.silhouette}
              r={7}
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
