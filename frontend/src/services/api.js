// Resolve API Base URL from Vite environment variable with safe normalization
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return '/api';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_BASE = getApiBase();

export const api = {
  // Health & Summary
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Health check failed with status ${res.status}`);
    }
    return res.json();
  },

  getDatasetSummary: async () => {
    const res = await fetch(`${API_BASE}/dataset-summary`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch dataset summary (HTTP ${res.status})`);
    }
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
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return res.json();
  },

  loadSampleDataset: async () => {
    const res = await fetch(`${API_BASE}/load-sample`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to load sample dataset');
    }
    return res.json();
  },

  preprocessDataset: async (options) => {
    const res = await fetch(`${API_BASE}/preprocess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(options),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Preprocessing failed');
    }
    return res.json();
  },

  // RFM Analysis
  getRfmAnalysis: async () => {
    const res = await fetch(`${API_BASE}/rfm-analysis`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch RFM analysis');
    }
    return res.json();
  },

  // Clustering
  runClustering: async (params) => {
    const res = await fetch(`${API_BASE}/run-clustering`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to run clustering');
    }
    return res.json();
  },

  getModelComparison: async () => {
    const res = await fetch(`${API_BASE}/model-comparison`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch model comparison');
    }
    return res.json();
  },

  // Customer Segments
  getCustomerSegments: async () => {
    const res = await fetch(`${API_BASE}/customer-segments`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch customer segments');
    }
    return res.json();
  },

  getSingleSegment: async (segmentName) => {
    const res = await fetch(`${API_BASE}/customer-segments/${encodeURIComponent(segmentName)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch segment details');
    }
    return res.json();
  },

  // Customers Directory
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const url = `${API_BASE}/customers${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch customers');
    }
    return res.json();
  },

  getCustomerProfile: async (customerId) => {
    const res = await fetch(`${API_BASE}/customers/${customerId}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch customer profile');
    }
    return res.json();
  },

  // Recommendations
  getBusinessRecommendations: async () => {
    const res = await fetch(`${API_BASE}/business-recommendations`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch business recommendations');
    }
    return res.json();
  },

  // Churn Modeling
  trainChurnModel: async (params = {}) => {
    const res = await fetch(`${API_BASE}/train-churn-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to train churn model');
    }
    return res.json();
  },

  getChurnResults: async () => {
    const res = await fetch(`${API_BASE}/churn-results`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch churn results');
    }
    return res.json();
  },

  // Combined Insights
  getCombinedInsights: async () => {
    const res = await fetch(`${API_BASE}/combined-insights`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch combined insights');
    }
    return res.json();
  },

  // Exports
  getExportPdfUrl: () => `${API_BASE}/export-report`,
  getExportCsvUrl: (type) => `${API_BASE}/export-csv/${type}`,
};
