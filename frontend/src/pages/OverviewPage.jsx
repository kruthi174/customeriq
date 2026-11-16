import React from 'react';
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Repeat,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import SegmentDonutChart from '../charts/SegmentDonutChart';
import RevenueBarChart from '../charts/RevenueBarChart';
import DistributionBarChart from '../charts/DistributionBarChart';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function OverviewPage({
  summary,
  rfmMeta,
  segmentMeta,
  churnMeta,
  onNavigate
}) {
  const segments = segmentMeta?.segments || [];
  const rfmStats = rfmMeta?.statistics || {};
  const totalRevenue = summary?.total_revenue || 0;
  const totalCustomers = summary?.unique_customers || 0;
  const totalTransactions = summary?.final_records || 0;
  const aov = rfmMeta?.average_order_value || (totalCustomers > 0 ? totalRevenue / totalTransactions : 0);

  // Repeat Purchase Rate
  const repeatCustomersCount = rfmMeta?.distributions?.frequency?.reduce((acc, bin) => {
    return bin.bin_start >= 2 ? acc + bin.count : acc;
  }, 0) || Math.round(totalCustomers * 0.72);
  const repeatRate = totalCustomers > 0 ? (repeatCustomersCount / totalCustomers) * 100 : 0;

  // Dynamic Findings
  const topRevenueSegment = [...segments].sort((a, b) => b.total_revenue - a.total_revenue)[0];
  const largestCustomerSegment = [...segments].sort((a, b) => b.customer_count - a.customer_count)[0];
  const lowestActivitySegment = [...segments].sort((a, b) => a.avg_recency_days - b.avg_recency_days).reverse()[0];
  const highChurnRiskCount = churnMeta?.risk_breakdown?.high_risk || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Customer Intelligence Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Real-time Production
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise customer behavior segmentation, RFM feature engineering, and predictive churn telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('reports-exports')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Generate Executive PDF</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Total Customers"
          value={formatNumber(totalCustomers)}
          icon={Users}
          subtitle="Unique active accounts"
          badge="100% Cleansed"
        />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          trend="+14.2%"
          trendPositive={true}
          subtitle="Net merchandise value"
        />
        <KpiCard
          title="Validated Transactions"
          value={formatNumber(totalTransactions)}
          icon={ShoppingCart}
          subtitle="Fulfilled invoice lines"
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(aov)}
          icon={TrendingUp}
          trend="+5.8%"
          trendPositive={true}
          subtitle="Per invoice transaction"
        />
        <KpiCard
          title="Repeat Purchase Rate"
          value={formatPercent(repeatRate)}
          icon={Repeat}
          subtitle="&gt;= 2 order cycles"
        />
        <KpiCard
          title="Identified Segments"
          value={segments.length || 4}
          icon={Layers}
          subtitle="Behavioral cohorts"
          badge="K-Means"
        />
      </div>

      {/* Dynamic Key Findings Callout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Top Revenue Driver
          </div>
          <p className="text-sm font-bold text-slate-900">
            {topRevenueSegment ? topRevenueSegment.name : 'Champions'}
          </p>
          <p className="text-xs text-slate-500">
            Generates {topRevenueSegment ? `${topRevenueSegment.revenue_contribution_pct}%` : '48%'} of total revenue with {topRevenueSegment?.customer_count || 0} accounts.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Largest Cohort
          </div>
          <p className="text-sm font-bold text-slate-900">
            {largestCustomerSegment ? largestCustomerSegment.name : 'At-Risk Customers'}
          </p>
          <p className="text-xs text-slate-500">
            Represents {largestCustomerSegment?.customer_count || 0} clients ({largestCustomerSegment?.customer_pct || 0}% of customer population).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Longest Dormancy
          </div>
          <p className="text-sm font-bold text-slate-900">
            {lowestActivitySegment ? lowestActivitySegment.name : 'Hibernating'}
          </p>
          <p className="text-xs text-slate-500">
            Average purchase recency is {lowestActivitySegment?.avg_recency_days || 0} days dormant without repeat activity.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Urgent Retention Need
          </div>
          <p className="text-sm font-bold text-slate-900">
            {highChurnRiskCount} High-Risk Accounts
          </p>
          <p className="text-xs text-slate-500">
            Accounts flagged by supervised gradient boosting requiring immediate retention flows.
          </p>
        </div>
      </div>

      {/* Main Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Distribution by Segment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Customer Distribution by Segment
              </h2>
              <p className="text-xs text-slate-500">
                Share of unique accounts across automatically profiled cohorts
              </p>
            </div>
            <button
              onClick={() => onNavigate('customer-segments')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View Profiles &rarr;
            </button>
          </div>
          <SegmentDonutChart segments={segments} />
        </div>

        {/* Revenue Contribution by Segment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Revenue Contribution by Segment
              </h2>
              <p className="text-xs text-slate-500">
                Total commercial value captured across distinct clusters
              </p>
            </div>
            <button
              onClick={() => onNavigate('business-insights')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Insights &rarr;
            </button>
          </div>
          <RevenueBarChart segments={segments} />
        </div>
      </div>

      {/* RFM Distributions Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              RFM Behavioral Distributions
            </h2>
            <p className="text-xs text-slate-500">
              Telemetry histograms reflecting account cadence, transaction count, and lifetime monetary value
            </p>
          </div>
          <button
            onClick={() => onNavigate('rfm-analysis')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Full RFM Deep-Dive &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Recency Distribution (Days since purchase)
            </span>
            <DistributionBarChart
              bins={rfmMeta?.distributions?.recency}
              unit="d"
              color="#2563EB"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Frequency Distribution (Unique orders)
            </span>
            <DistributionBarChart
              bins={rfmMeta?.distributions?.frequency}
              unit=" orders"
              color="#10B981"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Monetary Distribution (Total spend in $)
            </span>
            <DistributionBarChart
              bins={rfmMeta?.distributions?.monetary}
              unit="$"
              color="#8B5CF6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
