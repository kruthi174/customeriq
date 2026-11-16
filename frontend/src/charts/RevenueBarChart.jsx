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
import { formatCurrency } from '../utils/formatters';

export default function RevenueBarChart({ segments = [] }) {
  if (!segments || segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No revenue data available
      </div>
    );
  }

  const data = segments.map((s) => ({
    name: s.name,
    revenue: s.total_revenue,
    pct: s.revenue_contribution_pct,
    color: s.color || '#2563EB',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-0.5">
          <p className="font-semibold text-slate-200">{item.name}</p>
          <p className="text-emerald-400 font-mono">
            {formatCurrency(item.revenue)} ({item.pct}% of total)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="name"
            stroke="#CBD5E1"
            tick={{ fill: '#64748B', fontSize: 10 }}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            stroke="#CBD5E1"
            tick={{ fill: '#64748B', fontSize: 10 }}
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
