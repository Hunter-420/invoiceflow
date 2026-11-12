import React, { useState } from 'react';
import { DollarSign, Clock, AlertTriangle, CheckCircle2, TrendingUp, Plus, ArrowUpRight, Send, FileText, Search, Bell } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Invoice } from '../lib/types';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onSelectInvoice: (inv: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectInvoice }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [remindedList, setRemindedList] = useState<string[]>([]);
  const invoices = InvoiceFlowStore.getInvoices();
  const profile = InvoiceFlowStore.getProfile();

  const handleRemind = (invoiceId: string) => {
    setRemindedList((prev) => [...prev, invoiceId]);
  };

  // 12-Month Bar Chart data (Page 2 of PDF)
  const monthlyData = [
    { label: 'J', month: 'Jan', value: 3100, height: '48%' },
    { label: 'F', month: 'Feb', value: 2800, height: '42%' },
    { label: 'M', month: 'Mar', value: 4200, height: '65%' },
    { label: 'A', month: 'Apr', value: 3800, height: '58%' },
    { label: 'M', month: 'May', value: 4600, height: '72%' },
    { label: 'J', month: 'Jun', value: 3900, height: '60%' },
    { label: 'J', month: 'Jul', value: 4100, height: '64%' },
    { label: 'A', month: 'Aug', value: 2900, height: '44%' },
    { label: 'S', month: 'Sep', value: 3500, height: '54%' },
    { label: 'O', month: 'Oct', value: 4800, height: '75%' },
    { label: 'N', month: 'Nov', value: 5800, height: '90%' },
    { label: 'D', month: 'Dec', value: 6400, height: '100%' },
  ];

  // Needs Attention items matching PDF Page 2
  const needsAttention = [
    { id: 'att-1', client: 'Bloom & Co.', invNumber: 'INV-0139', issue: '6 days overdue', overdue: true },
    { id: 'att-2', client: 'Delta Goods', invNumber: 'INV-0152', issue: 'Due tomorrow', overdue: false },
    { id: 'att-3', client: 'Atlas Labs', invNumber: 'INV-0141', issue: '12 days overdue', overdue: true },
  ];

  // Filtered recent invoices
  const filteredInvoices = invoices.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.number.toLowerCase().includes(q) ||
      i.clientName.toLowerCase().includes(q) ||
      (i.clientCompany && i.clientCompany.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Header (Figma node 4:2 / PDF Page 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
            Good morning, {profile.fullName.split(' ')[0] || 'Nischal'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Here is what is happening with your invoices today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="size-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:outline-none w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => onNavigate('invoice-new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-primary transition-all active:scale-95 shrink-0"
          >
            <Plus className="size-4" />
            <span>New invoice</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Tiles (Figma node 4:2 / PDF Page 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total revenue */}
        <div className="rounded-2xl bg-white p-5 border border-[#E2E8F0] shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-[#64748B] block">Total revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">$48,920</span>
            <span className="text-xs font-bold text-[#14532D] bg-[#DDF3E4] px-2 py-0.5 rounded-full">
              +12.4%
            </span>
          </div>
        </div>

        {/* Paid this month */}
        <div className="rounded-2xl bg-white p-5 border border-[#E2E8F0] shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-[#64748B] block">Paid this month</span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">$12,480</span>
            <span className="text-xs font-bold text-[#14532D] bg-[#DDF3E4] px-2 py-0.5 rounded-full">
              +18%
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl bg-white p-5 border border-[#E2E8F0] shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-[#64748B] block">Pending</span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">$3,260</span>
            <span className="text-xs font-medium text-[#64748B]">7 invoices</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-2xl bg-white p-5 border border-[#E2E8F0] shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-[#64748B] block">Overdue</span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#B91C1C] tabular-nums">$840</span>
            <span className="text-xs font-bold text-[#B91C1C] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
              2 invoices
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Revenue Chart & Needs Attention (PDF Page 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Revenue Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-[#0F172A]">Revenue</h2>
              <span className="text-xs text-[#64748B]">Last 12 months</span>
            </div>
            <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-full">
              Average $4,120 / mo
            </span>
          </div>

          {/* 12 Bars */}
          <div className="pt-4 h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {monthlyData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div
                  style={{ height: d.height }}
                  className="w-full max-w-[36px] bg-[#EEF2FF] group-hover:bg-[#4F46E5] rounded-t-lg transition-colors relative"
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#0F172A] text-white text-[10px] font-bold py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                    ${d.value.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#64748B] group-hover:text-[#0F172A]">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Needs attention */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h2 className="font-extrabold text-lg text-[#0F172A]">Needs attention</h2>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-around">
            {needsAttention.map((item) => {
              const isReminded = remindedList.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] block">{item.client}</span>
                    <span
                      className={`text-[11px] font-medium ${
                        item.overdue ? 'text-[#B91C1C]' : 'text-[#D97706]'
                      }`}
                    >
                      {item.invNumber} · {item.issue}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemind(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isReminded
                        ? 'bg-[#DDF3E4] text-[#14532D]'
                        : 'bg-white hover:bg-slate-100 text-[#0F172A] border border-[#CBD5E1]'
                    }`}
                  >
                    {isReminded ? 'Sent' : 'Remind'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Invoices Table (PDF Page 2) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <h2 className="font-extrabold text-lg text-[#0F172A]">Recent invoices</h2>
          <button
            onClick={() => onNavigate('invoices')}
            className="text-xs font-bold text-[#4F46E5] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Due date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredInvoices.slice(0, 5).map((inv) => {
                const subtotal = calculateSubtotalCents(inv.items);
                const tax = calculateTaxCents(subtotal, inv.taxPercent);
                const total = calculateTotalCents(subtotal, tax);

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#0F172A]">
                      {inv.clientCompany || inv.clientName}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] font-mono">{inv.number}</td>
                    <td className="py-3 px-4 text-[#475569]">{inv.dueDate}</td>
                    <td className="py-3 px-4 font-bold text-[#0F172A] tabular-nums">
                      {formatCurrency(total)}
                    </td>
                    <td className="py-3 px-4">
                      {inv.status === 'paid' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-xs font-bold">
                          Paid
                        </span>
                      )}
                      {inv.status === 'sent' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
                          Pending
                        </span>
                      )}
                      {inv.status === 'overdue' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-xs font-bold">
                          Overdue
                        </span>
                      )}
                      {inv.status === 'draft' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#475569] text-xs font-bold">
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
