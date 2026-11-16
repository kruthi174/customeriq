import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DistributionBarChart({
  bins = [],
  title = 'Distribution',
  unit = '',
  color = '#2563EB'
}) {
  if (!bins || bins.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No distribution data
      </div>
    );
  }

  const chartData = bins.map((b) => ({
    range: `${b.bin_start} - ${b.bin_end}${unit}`,
    count: b.count,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="range"
            stroke="#CBD5E1"
            tick={{ fill: '#64748B', fontSize: 9 }}
            angle={-30}
            textAnchor="end"
          />
          <YAxis stroke="#CBD5E1" tick={{ fill: '#64748B', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#1E293B',
              color: '#FFF',
              borderRadius: '6px',
              fontSize: '11px',
            }}
            formatter={(value) => [`${value} Customers`, 'Frequency Count']}
          />
          <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
