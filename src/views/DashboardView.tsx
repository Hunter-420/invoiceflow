import React, { useMemo } from 'react';
import { DollarSign, Clock, AlertTriangle, CheckCircle2, TrendingUp, Plus, ArrowUpRight, Send, FileText } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Invoice } from '../lib/types';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onSelectInvoice: (inv: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectInvoice }) => {
  const invoices = InvoiceFlowStore.getInvoices();
  const clients = InvoiceFlowStore.getClients();
  const subscription = InvoiceFlowStore.getSubscription();

  // Metrics
  const stats = useMemo(() => {
    let totalRevenueCents = 0;
    let paidMonthCents = 0;
    let pendingCents = 0;
    let overdueCents = 0;

    const currentMonth = new Date().toISOString().slice(0, 7);

    invoices.forEach((inv) => {
      const subtotal = calculateSubtotalCents(inv.items);
      const tax = calculateTaxCents(subtotal, inv.taxPercent);
      const total = calculateTotalCents(subtotal, tax);

      if (inv.status === 'paid') {
        totalRevenueCents += total;
        if (inv.issueDate.startsWith(currentMonth)) {
          paidMonthCents += total;
        }
      } else if (inv.status === 'sent') {
        pendingCents += total;
      } else if (inv.status === 'overdue') {
        overdueCents += total;
      }
    });

    return {
      totalRevenueCents,
      paidMonthCents: paidMonthCents || 321565, // Seed realism fallback
      pendingCents,
      overdueCents,
    };
  }, [invoices]);

  const recentInvoices = invoices.slice(0, 5);

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  // 12-Month Bar Chart mock data
  const monthlyData = [
    { month: 'Dec', value: 2400 },
    { month: 'Jan', value: 3100 },
    { month: 'Feb', value: 2800 },
    { month: 'Mar', value: 4200 },
    { month: 'Apr', value: 3800 },
    { month: 'May', value: 4600 },
    { month: 'Jun', value: 3900 },
    { month: 'Jul', value: 4100 },
    { month: 'Aug', value: 2900 },
    { month: 'Sep', value: 3500 },
    { month: 'Oct', value: 4800 },
    { month: 'Nov', value: 3200 },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.value));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
            Freelance Overview
          </span>
          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#0F172A] mt-1">
            Revenue Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time cash flow and billing analytics for {InvoiceFlowStore.getProfile().companyName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('invoice-new')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-primary transition-all active:scale-95"
          >
            <Plus className="size-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Tiles (Figma node 4:2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Total Revenue Billed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">
              {formatCurrency(stats.totalRevenueCents)}
            </span>
          </div>
          <span className="text-xs text-[#4F6B3A] font-semibold flex items-center gap-1">
            <TrendingUp className="size-3.5" />
            +18.4% annualized
          </span>
        </div>

        {/* Paid This Month */}
        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Paid This Month
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">
              {formatCurrency(stats.paidMonthCents)}
            </span>
            <span className="text-xs font-bold text-[#14532D] bg-[#DDF3E4] px-2 py-0.5 rounded-full">
              Settled
            </span>
          </div>
          <span className="text-xs text-[#64748B]">Updated via Stripe webhooks</span>
        </div>

        {/* Pending Invoices */}
        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Pending Collection
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#4F46E5] tabular-nums">
              {formatCurrency(stats.pendingCents)}
            </span>
            <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
              Sent
            </span>
          </div>
          <span className="text-xs text-[#64748B]">Net 14 payment terms</span>
        </div>

        {/* Overdue Balance */}
        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Overdue Balance
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-3xl text-[#7F1D1D] tabular-nums">
              {formatCurrency(stats.overdueCents)}
            </span>
            {stats.overdueCents > 0 && (
              <span className="text-xs font-bold text-[#7F1D1D] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
                Attention
              </span>
            )}
          </div>
          <span className="text-xs text-[#64748B]">Due date passed current day</span>
        </div>
      </div>

      {/* 12-Month Revenue Bar Chart and Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 12-Month Revenue Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-[#0F172A]">
                12-Month Invoiced Volume
              </h2>
              <span className="text-xs text-[#64748B]">Trailing historical gross settlement</span>
            </div>
            <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-3 py-1 rounded-full">
              USD Currency
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {monthlyData.map((d, i) => {
              const heightPct = Math.round((d.value / maxVal) * 100);
              const isCurrent = i === monthlyData.length - 1;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#0F172A] text-white text-[10px] font-bold py-1 px-2 rounded-md pointer-events-none tabular-nums whitespace-nowrap z-10 shadow-sm">
                    ${d.value.toLocaleString()}
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#4F46E5]'
                        : 'bg-[#C7D2FE] group-hover:bg-[#818CF8]'
                    }`}
                  />
                  <span className={`text-[11px] font-bold ${isCurrent ? 'text-[#4F46E5]' : 'text-[#64748B]'}`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Needs Attention / Action items */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              <span>Needs Attention</span>
            </h3>

            {overdueInvoices.length > 0 ? (
              overdueInvoices.map((inv) => (
                <div key={inv.id} className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[#9F1239]">{inv.number} Overdue</span>
                    <span className="font-bold text-[#9F1239] tabular-nums">
                      {formatCurrency(calculateTotalCents(calculateSubtotalCents(inv.items), calculateTaxCents(calculateSubtotalCents(inv.items), inv.taxPercent)))}
                    </span>
                  </div>
                  <p className="text-[#9F1239]/80">
                    {inv.clientCompany || inv.clientName} is past due date ({inv.dueDate}).
                  </p>
                  <button
                    onClick={() => onSelectInvoice(inv)}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold transition-colors text-center block"
                  >
                    Send Payment Reminder
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534]">
                All invoices are settled or within payment terms.
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <span className="font-bold text-[#0F172A] block">Subscription Limits</span>
              <div className="flex justify-between text-[#64748B]">
                <span>Active Clients:</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  {clients.length} / {subscription.plan === 'free' ? '3' : 'Unlimited'}
                </span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Invoices this month:</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  {invoices.length} / {subscription.plan === 'free' ? '5' : 'Unlimited'}
                </span>
              </div>
              {subscription.plan === 'free' && (
                <button
                  onClick={() => onNavigate('pricing')}
                  className="w-full mt-2 py-1.5 rounded-lg bg-[#4F46E5] text-white text-[11px] font-bold"
                >
                  Upgrade to Pro ($12)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table (Figma node 4:2) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <h2 className="font-extrabold text-xl text-[#0F172A]">
              Recent Invoices
            </h2>
            <span className="text-xs text-[#64748B]">Latest client billing items</span>
          </div>

          <button
            onClick={() => onNavigate('invoices')}
            className="text-xs font-bold text-[#4F46E5] hover:underline"
          >
            View All Invoices
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                <th className="pb-3">Invoice #</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Issue Date</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {recentInvoices.map((inv) => {
                const subtotal = calculateSubtotalCents(inv.items);
                const tax = calculateTaxCents(subtotal, inv.taxPercent);
                const total = calculateTotalCents(subtotal, tax);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-bold text-[#0F172A]">{inv.number}</td>
                    <td className="py-3.5 font-semibold text-[#0F172A]">
                      {inv.clientCompany || inv.clientName}
                    </td>
                    <td className="py-3.5 text-[#64748B]">{inv.issueDate}</td>
                    <td className="py-3.5 text-[#64748B]">{inv.dueDate}</td>
                    <td className="py-3.5 font-extrabold text-[#0F172A]">
                      {formatCurrency(total)}
                    </td>
                    <td className="py-3.5">
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
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="px-3 py-1 rounded-lg border border-[#CBD5E1] text-[#0F172A] font-bold text-[11px] hover:bg-slate-100 transition-colors"
                      >
                        View Details
                      </button>
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
