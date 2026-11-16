import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight, Settings2 } from 'lucide-react';
import { api } from '../services/api';
import { formatNumber, formatCurrency } from '../utils/formatters';

export default function UploadModal({ isOpen, onClose, onDatasetUpdated }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [inspection, setInspection] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Preprocessing config toggles
  const [config, setConfig] = useState({
    remove_duplicates: true,
    remove_cancellations: true,
    remove_negative_qty: true,
    remove_missing_customers: true,
    remove_zero_price: true,
    handle_outliers: true,
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadDataset(file);
      setInspection(res.raw_inspection);
      setSummary(res.preprocessing_summary);
      if (onDatasetUpdated) onDatasetUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRunCustomCleaning = async () => {
    setUploading(true);
    setError(null);
    try {
      const res = await api.preprocessDataset(config);
      setSummary(res.summary);
      if (onDatasetUpdated) onDatasetUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setUploading(true);
    setError(null);
    try {
      const res = await api.loadSampleDataset();
      setSummary(res.preprocessing_summary);
      if (onDatasetUpdated) onDatasetUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              Dataset Management & Preprocessing Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload e-commerce transaction data (UCI Online Retail standard)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/50 transition-colors">
            <input
              type="file"
              id="csvFileInput"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer block space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {file ? file.name : 'Click to select or drag and drop CSV file'}
              </p>
              <p className="text-[11px] text-slate-500">
                Expected schema: InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country
              </p>
            </label>

            {file && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading ? 'Processing Data...' : 'Upload & Run Preprocessing Pipeline'}
                </button>
              </div>
            )}
          </div>

          {/* Quick Load Sample Banner */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-blue-900">
                Need immediate demonstration data?
              </h4>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Load the pre-configured UCI Online Retail dataset with 4,500+ clean transactions & 250 customer profiles.
              </p>
            </div>
            <button
              onClick={handleLoadSample}
              disabled={uploading}
              className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold shadow-2xs whitespace-nowrap"
            >
              Load Sample Dataset
            </button>
          </div>

          {/* Preprocessing Toggles & Explanations */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Settings2 className="w-4 h-4 text-slate-500" />
                Data Cleaning & Validation Rules
              </h3>
              <span className="text-[11px] text-slate-500">Explicit Preprocessing Governance</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.remove_missing_customers}
                  onChange={(e) => setConfig({ ...config, remove_missing_customers: e.target.checked })}
                  className="rounded text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Remove Missing CustomerIDs</span>
                  <span className="text-[11px] text-slate-500 block">Unassigned guest purchases cannot be segmented.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.remove_cancellations}
                  onChange={(e) => setConfig({ ...config, remove_cancellations: e.target.checked })}
                  className="rounded text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Filter Cancellations ('C' Invoices)</span>
                  <span className="text-[11px] text-slate-500 block">Invoices starting with 'C' indicate unfulfilled orders.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.remove_negative_qty}
                  onChange={(e) => setConfig({ ...config, remove_negative_qty: e.target.checked })}
                  className="rounded text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Filter Negative Quantities</span>
                  <span className="text-[11px] text-slate-500 block">Negative values reflect returns and warehouse adjustments.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.remove_duplicates}
                  onChange={(e) => setConfig({ ...config, remove_duplicates: e.target.checked })}
                  className="rounded text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Deduplicate Identical Rows</span>
                  <span className="text-[11px] text-slate-500 block">Exact duplicates distort transaction frequency.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.remove_zero_price}
                  onChange={(e) => setConfig({ ...config, remove_zero_price: e.target.checked })}
                  className="rounded text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Remove $0 or Negative Price</span>
                  <span className="text-[11px] text-slate-500 block">Free test items or non-commercial ledger lines.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.handle_outliers}
                  onChange={(e) => setConfig({ ...config, handle_outliers: e.target.checked })}
                  className="rounded text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Trim Extreme Bulk Outliers</span>
                  <span className="text-[11px] text-slate-500 block">Removes &gt;99th percentile extreme wholesale transactions.</span>
                </div>
              </label>
            </div>

            <button
              onClick={handleRunCustomCleaning}
              disabled={uploading}
              className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Re-apply Cleaning Parameters <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audit Results Summary */}
          {summary && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Data Quality Audit Summary
              </h4>

              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Raw Records</span>
                  <span className="text-base font-bold text-slate-800 font-mono">
                    {formatNumber(summary.initial_records)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Clean Records</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    {formatNumber(summary.final_records)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Unique Customers</span>
                  <span className="text-base font-bold text-blue-600 font-mono">
                    {formatNumber(summary.unique_customers)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Total Revenue</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {formatCurrency(summary.total_revenue)}
                  </span>
                </div>
              </div>

              {/* Audit Trail Breakdown */}
              {summary.audit_trail && (
                <div className="space-y-1 pt-1 text-[11px] text-slate-600">
                  {Object.entries(summary.audit_trail).map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between bg-white px-2 py-1 rounded border border-slate-100">
                      <span className="font-medium text-slate-700 capitalize">{k.replace(/_/g, ' ')}:</span>
                      <span className="text-slate-500">{v.count} rows removed ({v.reason})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
