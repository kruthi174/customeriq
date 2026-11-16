import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const CLUSTER_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export default function PcaScatterChart({ data = [], pcaMeta = {} }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 text-sm">
        No PCA projection data available
      </div>
    );
  }

  // Group data by cluster for legend and colors
  const clusters = Array.from(new Set(data.map(d => d.cluster))).sort((a, b) => a - b);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 z-50 pointer-events-none">
          <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
            Customer ID: {item.customer_id}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1 text-slate-300">
            <span>Cluster:</span>
            <span className="font-medium text-blue-400">#{item.cluster}</span>
            <span>Recency:</span>
            <span>{item.recency} days</span>
            <span>Frequency:</span>
            <span>{item.frequency} orders</span>
            <span>Monetary:</span>
            <span>{formatCurrency(item.monetary)}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            PC1: {item.pc1} | PC2: {item.pc2}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              type="number"
              dataKey="pc1"
              name="PC1"
              tick={{ fontSize: 11, fill: '#64748B' }}
              stroke="#CBD5E1"
              label={{
                value: `Principal Component 1 (${pcaMeta.pca_variance_ratio ? pcaMeta.pca_variance_ratio[0] : 0}% var)`,
                position: 'insideBottom',
                offset: -10,
                fontSize: 11,
                fill: '#64748B'
              }}
            />
            <YAxis
              type="number"
              dataKey="pc2"
              name="PC2"
              tick={{ fontSize: 11, fill: '#64748B' }}
              stroke="#CBD5E1"
              label={{
                value: `Principal Component 2 (${pcaMeta.pca_variance_ratio ? pcaMeta.pca_variance_ratio[1] : 0}% var)`,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fontSize: 11,
                fill: '#64748B'
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {clusters.map((cId) => {
              const clusterPoints = data.filter(d => d.cluster === cId);
              return (
                <Scatter
                  key={cId}
                  name={`Cluster ${cId}`}
                  data={clusterPoints}
                  fill={CLUSTER_COLORS[cId % CLUSTER_COLORS.length]}
                />
              );
            })}
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
        Methodology Note: PCA dimensionality reduction is applied solely to project high-dimensional customer vectors onto a 2D coordinate plane for visualization. All segmentation metrics and cluster boundaries were computed in full standardized 3D RFM space.
      </p>
    </div>
  );
}
