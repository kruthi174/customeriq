import React, { useEffect, useState } from 'react';
import { X, Calendar, ShoppingBag, DollarSign, Clock, ShieldAlert, Award } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function CustomerModal({ customerId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    api.getCustomerProfile(customerId)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [customerId]);

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Customer #{customerId}
              </h2>
              {profile && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {profile.segment}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive Behavioral & Lifecycle Profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-500 font-medium">Loading customer telemetry...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm">
              {error}
            </div>
          ) : profile ? (
            <>
              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recency</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {profile.recency} <span className="text-xs font-normal text-slate-500">days</span>
                  </p>
                  <span className="text-[10px] text-slate-500">R-Score: {profile.r_score}/5</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Frequency</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {profile.frequency} <span className="text-xs font-normal text-slate-500">orders</span>
                  </p>
                  <span className="text-[10px] text-slate-500">F-Score: {profile.f_score}/5</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Monetary</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(profile.monetary)}
                  </p>
                  <span className="text-[10px] text-slate-500">M-Score: {profile.m_score}/5</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>AOV</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(profile.aov)}
                  </p>
                  <span className="text-[10px] text-slate-500">Tenure: {profile.tenure_days}d</span>
                </div>
              </div>

              {/* Churn Risk Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                profile.risk_tier === 'High'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : profile.risk_tier === 'Medium'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Predicted Churn Risk: {profile.risk_tier}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      Supervised departure probability: {profile.churn_probability !== null ? `${(profile.churn_probability * 100).toFixed(1)}%` : 'Model Pending'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-white/80 rounded border shadow-2xs">
                  RFM: {profile.rfm_score}
                </span>
              </div>

              {/* Purchase History Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Transaction History ({profile.transactions_count} line items)
                  </h3>
                  <span className="text-[11px] text-slate-500">Showing latest records</span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Invoice</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Product</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-600">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-600">Price</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {profile.transaction_history && profile.transaction_history.length > 0 ? (
                        profile.transaction_history.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono text-slate-800 font-medium">{tx.invoice_no}</td>
                            <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{formatDate(tx.invoice_date)}</td>
                            <td className="px-3 py-2 text-slate-700 max-w-xs truncate" title={tx.description}>
                              {tx.description}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-700">{tx.quantity}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-700">${tx.unit_price?.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-mono font-medium text-slate-900">${tx.total_spend?.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400">
                            No transaction lines recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
