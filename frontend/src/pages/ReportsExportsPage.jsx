import React, { useState } from 'react';
import { FileDown, FileText, Table, CheckCircle2, Download, Printer, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function ReportsExportsPage({ summary, rfmMeta, clusteringMeta, segmentMeta, churnMeta }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    window.location.href = api.getExportPdfUrl();
    setTimeout(() => setDownloadingPdf(false), 2000);
  };

  const handleDownloadCsv = (type) => {
    window.location.href = api.getExportCsvUrl(type);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Enterprise Reports & Data Exports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download certified audit reports and raw analytical outputs for downstream CRM ingestion and executive presentations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PDF & CSV Generators Ready
          </span>
        </div>
      </div>

      {/* Featured Executive PDF Report Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wider">
              Formal Academic & Executive Deliverable
            </span>
            <span className="text-xs text-slate-400">Publication Grade</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            CustomerIQ Executive Intelligence & Segmentation Audit
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-page academic PDF report encompassing source dataset audits, mathematical RFM formulas, 3-model clustering comparison matrices, customer segment profiles, supervised churn ROC evaluations, and prioritized commercial action plans.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>• ReportLab Engine</span>
            <span>• Formatted Metric Tables</span>
            <span>• Academic Citations</span>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 shrink-0 transition-transform hover:scale-102 disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          <span>{downloadingPdf ? 'Generating PDF...' : 'Download Full PDF Report'}</span>
        </button>
      </div>

      {/* CSV Data Exports Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Structured Data File Exports (CSV)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Customer Directory */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg w-fit">
                <Table className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Customer Segments Directory
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customer-level table containing CustomerID, assigned segment, R/F/M scores, total spend, revenue contribution %, and churn departure probability.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('customers')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* RFM Metrics */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
                <Table className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                RFM Feature Vectors Table
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Raw customer-level Recency in days, unique invoice Frequency, Monetary spend, Average Order Value (AOV), and customer account tenure.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('rfm')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Cleaned Dataset */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                <Table className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Preprocessed Transactions
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cleaned transactional records post-duplicate removal, cancellation filtering, non-positive price filtering, and line total derivation.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('cleaned')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
