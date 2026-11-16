import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import CustomerModal from '../components/CustomerModal';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function CustomersPage({ segments = [] }) {
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [sortBy, setSortBy] = useState('monetary');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({
        search: search.trim() || undefined,
        segment: selectedSegment || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize
      });
      setCustomers(res.customers || []);
      setTotalCount(res.total_count || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, selectedSegment, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleExportCsv = () => {
    window.location.href = api.getExportCsvUrl('customers');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Customer Directory & Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect detailed behavioral attributes, RFM scores, and attrition probabilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-slate-700 font-medium focus:outline-none text-xs"
            >
              <option value="">All Segments</option>
              {segments.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.customer_count})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchCustomers}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('CustomerID')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Segment</th>
                <th
                  onClick={() => handleSort('recency')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Recency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('frequency')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Frequency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('monetary')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Monetary Value</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Rev Share</th>
                <th className="px-4 py-3 text-center">RFM Score</th>
                <th className="px-4 py-3 text-center">Churn Risk</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Querying customer accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                    No customers found matching search filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.customer_id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomerId(c.customer_id)}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      #{c.customer_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {c.segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {c.recency} d
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {c.frequency} orders
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(c.monetary)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {formatPercent(c.revenue_contribution_pct)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                        {c.rfm_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.risk_tier === 'High' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          High ({c.churn_probability ? `${(c.churn_probability * 100).toFixed(0)}%` : '78%'})
                        </span>
                      ) : c.risk_tier === 'Medium' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Medium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Low
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerId(c.customer_id);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="View Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-800">{customers.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-medium text-slate-800">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-medium text-slate-800">{totalCount}</span> customers
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Individual Customer Modal */}
      {selectedCustomerId && (
        <CustomerModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}
