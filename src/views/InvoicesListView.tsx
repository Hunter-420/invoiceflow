import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, FileText, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Invoice, InvoiceStatus } from '../lib/types';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';

interface InvoicesListViewProps {
  onNavigate: (tab: string) => void;
  onSelectInvoice: (inv: Invoice) => void;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  onNavigate,
  onSelectInvoice,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const invoices = InvoiceFlowStore.getInvoices();

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesSearch =
        searchQuery === '' ||
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.clientCompany && inv.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
            Billing Ledger
          </span>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A] mt-1">
            Invoices
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage, dispatch, and track client invoice balances
          </p>
        </div>

        <button
          onClick={() => onNavigate('invoice-new')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-primary transition-colors self-start sm:self-center"
        >
          <Plus className="size-4" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'sent', label: 'Sent' },
            { id: 'paid', label: 'Paid' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'draft', label: 'Draft' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === st.id
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="size-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice # or client..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                <th className="pb-3">Invoice</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Issue Date</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {filtered.map((inv) => {
                const subtotal = calculateSubtotalCents(inv.items);
                const tax = calculateTaxCents(subtotal, inv.taxPercent);
                const total = calculateTotalCents(subtotal, tax);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-[#4F46E5]" />
                        <span>{inv.number}</span>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-[#0F172A]">
                      <div>{inv.clientCompany || inv.clientName}</div>
                      <div className="text-[11px] text-[#64748B] font-normal">{inv.clientEmail}</div>
                    </td>
                    <td className="py-4 text-[#64748B]">{inv.issueDate}</td>
                    <td className="py-4 text-[#64748B]">{inv.dueDate}</td>
                    <td className="py-4 font-extrabold text-[#0F172A]">
                      {formatCurrency(total)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          inv.status === 'paid'
                            ? 'bg-[#DDF3E4] text-[#14532D]'
                            : inv.status === 'overdue'
                            ? 'bg-[#FEE2E2] text-[#7F1D1D]'
                            : inv.status === 'sent'
                            ? 'bg-[#EEF2FF] text-[#4F46E5]'
                            : 'bg-slate-100 text-[#475569]'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="px-3 py-1 rounded-lg border border-[#CBD5E1] text-[#0F172A] font-bold text-[11px] hover:bg-slate-100 transition-colors"
                      >
                        View & Pay
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No invoices match the chosen filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
