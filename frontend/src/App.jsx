import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import OverviewPage from './pages/OverviewPage';
import CustomersPage from './pages/CustomersPage';
import RfmAnalysisPage from './pages/RfmAnalysisPage';
import CustomerSegmentsPage from './pages/CustomerSegmentsPage';
import ClusteringModelsPage from './pages/ClusteringModelsPage';
import ModelEvaluationPage from './pages/ModelEvaluationPage';
import ChurnAnalysisPage from './pages/ChurnAnalysisPage';
import BusinessInsightsPage from './pages/BusinessInsightsPage';
import ReportsExportsPage from './pages/ReportsExportsPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Analytical States
  const [datasetSummary, setDatasetSummary] = useState(null);
  const [rfmMeta, setRfmMeta] = useState(null);
  const [clusteringMeta, setClusteringMeta] = useState(null);
  const [segmentMeta, setSegmentMeta] = useState(null);
  const [churnMeta, setChurnMeta] = useState(null);
  const [combinedInsights, setCombinedInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const loadAllAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Dataset summary
      const dSummary = await api.getDatasetSummary();
      setDatasetSummary(dSummary);

      // 2. RFM
      const rfm = await api.getRfmAnalysis();
      setRfmMeta(rfm);

      // 3. Clustering
      const clustering = await api.getModelComparison();
      setClusteringMeta(clustering);

      // 4. Segments
      const segments = await api.getCustomerSegments();
      setSegmentMeta(segments);

      // 5. Churn
      const churn = await api.getChurnResults();
      setChurnMeta(churn);

      // 6. Combined
      const combined = await api.getCombinedInsights();
      setCombinedInsights(combined);

      // 7. Recommendations
      const recs = await api.getBusinessRecommendations();
      setRecommendations(recs.recommendations || []);
    } catch (err) {
      console.error('Error fetching analytics telemetry:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalyticsData();
  }, []);

  const handleGlobalSearch = (query) => {
    // Navigate to customers tab with search
    setActiveTab('customers');
  };

  const handleResetSample = async () => {
    try {
      await api.loadSampleDataset();
      await loadAllAnalyticsData();
    } catch (err) {
      console.error(err);
    }
  };

  // Date Range Display
  const dateRangeStr = datasetSummary?.preprocessing_summary?.date_range
    ? `${datasetSummary.preprocessing_summary.date_range.start_date} to ${datasetSummary.preprocessing_summary.date_range.end_date}`
    : '2025-01-01 to 2025-12-31';

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      activeDataset={datasetSummary?.dataset_name || 'Online Retail Sample'}
      dateRange={dateRangeStr}
      onDatasetUpdated={loadAllAnalyticsData}
      onGlobalSearch={handleGlobalSearch}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-800">
              Synchronizing CustomerIQ Intelligence Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Loading RFM feature distributions, clustering centroids, and churn models...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-12 space-y-3">
          <h3 className="text-sm font-bold text-rose-900">
            Backend Connection Notice
          </h3>
          <p className="text-xs text-rose-700">
            {error}
          </p>
          <button
            onClick={loadAllAnalyticsData}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <OverviewPage
              summary={datasetSummary?.preprocessing_summary}
              rfmMeta={rfmMeta}
              segmentMeta={segmentMeta}
              churnMeta={churnMeta}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage segments={segmentMeta?.segments || []} />
          )}

          {activeTab === 'rfm-analysis' && (
            <RfmAnalysisPage rfmMeta={rfmMeta} />
          )}

          {activeTab === 'customer-segments' && (
            <CustomerSegmentsPage segmentMeta={segmentMeta} />
          )}

          {activeTab === 'clustering-models' && (
            <ClusteringModelsPage
              clusteringMeta={clusteringMeta}
              onModelUpdated={loadAllAnalyticsData}
            />
          )}

          {activeTab === 'model-evaluation' && (
            <ModelEvaluationPage clusteringMeta={clusteringMeta} />
          )}

          {activeTab === 'churn-analysis' && (
            <ChurnAnalysisPage
              churnMeta={churnMeta}
              onChurnModelTrained={loadAllAnalyticsData}
            />
          )}

          {activeTab === 'business-insights' && (
            <BusinessInsightsPage
              combinedInsights={combinedInsights}
              recommendations={recommendations}
            />
          )}

          {activeTab === 'reports-exports' && (
            <ReportsExportsPage
              summary={datasetSummary?.preprocessing_summary}
              rfmMeta={rfmMeta}
              clusteringMeta={clusteringMeta}
              segmentMeta={segmentMeta}
              churnMeta={churnMeta}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage onResetSample={handleResetSample} />
          )}
        </>
      )}
    </MainLayout>
  );
}
