const API_BASE = '/api';

export const api = {
  // Health & Summary
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  getDatasetSummary: async () => {
    const res = await fetch(`${API_BASE}/dataset-summary`);
    if (!res.ok) throw new Error('Failed to fetch dataset summary');
    return res.json();
  },

  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload-dataset`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  loadSampleDataset: async () => {
    const res = await fetch(`${API_BASE}/load-sample`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to load sample dataset');
    return res.json();
  },

  preprocessDataset: async (options) => {
    const res = await fetch(`${API_BASE}/preprocess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error('Preprocessing failed');
    return res.json();
  },

  // RFM Analysis
  getRfmAnalysis: async () => {
    const res = await fetch(`${API_BASE}/rfm-analysis`);
    if (!res.ok) throw new Error('Failed to fetch RFM analysis');
    return res.json();
  },

  // Clustering
  runClustering: async (params) => {
    const res = await fetch(`${API_BASE}/run-clustering`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to run clustering');
    return res.json();
  },

  getModelComparison: async () => {
    const res = await fetch(`${API_BASE}/model-comparison`);
    if (!res.ok) throw new Error('Failed to fetch model comparison');
    return res.json();
  },

  // Customer Segments
  getCustomerSegments: async () => {
    const res = await fetch(`${API_BASE}/customer-segments`);
    if (!res.ok) throw new Error('Failed to fetch customer segments');
    return res.json();
  },

  getSingleSegment: async (segmentName) => {
    const res = await fetch(`${API_BASE}/customer-segments/${encodeURIComponent(segmentName)}`);
    if (!res.ok) throw new Error('Failed to fetch segment details');
    return res.json();
  },

  // Customers Directory
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const res = await fetch(`${API_BASE}/customers?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  getCustomerProfile: async (customerId) => {
    const res = await fetch(`${API_BASE}/customers/${customerId}`);
    if (!res.ok) throw new Error('Failed to fetch customer profile');
    return res.json();
  },

  // Recommendations
  getBusinessRecommendations: async () => {
    const res = await fetch(`${API_BASE}/business-recommendations`);
    if (!res.ok) throw new Error('Failed to fetch business recommendations');
    return res.json();
  },

  // Churn Modeling
  trainChurnModel: async (params = {}) => {
    const res = await fetch(`${API_BASE}/train-churn-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to train churn model');
    return res.json();
  },

  getChurnResults: async () => {
    const res = await fetch(`${API_BASE}/churn-results`);
    if (!res.ok) throw new Error('Failed to fetch churn results');
    return res.json();
  },

  // Combined Insights
  getCombinedInsights: async () => {
    const res = await fetch(`${API_BASE}/combined-insights`);
    if (!res.ok) throw new Error('Failed to fetch combined insights');
    return res.json();
  },

  // Exports
  getExportPdfUrl: () => `${API_BASE}/export-report`,
  getExportCsvUrl: (type) => `${API_BASE}/export-csv/${type}`,
};
