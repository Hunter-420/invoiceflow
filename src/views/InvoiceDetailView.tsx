import React, { useState } from 'react';
import { ArrowLeft, Printer, ExternalLink, Send, CheckCircle2, DollarSign, Download, Eye } from 'lucide-react';
import { Invoice } from '../lib/types';
import { InvoiceFlowStore } from '../lib/store';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';
import { downloadInvoicePdf, openInvoicePdfPreview } from '../lib/pdfGenerator';

interface InvoiceDetailViewProps {
  invoice: Invoice;
  onBack: () => void;
  onOpenPublicPay: (inv: Invoice) => void;
}

export const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  invoice,
  onBack,
  onOpenPublicPay,
}) => {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(invoice);
  const [remindSuccess, setRemindSuccess] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const subtotalCents = calculateSubtotalCents(currentInvoice.items);
  const taxCents = calculateTaxCents(subtotalCents, currentInvoice.taxPercent);
  const totalCents = calculateTotalCents(subtotalCents, taxCents);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadInvoicePdf(currentInvoice);
    setDownloadNotice(`Generated Tax-Invoice-${currentInvoice.number}.pdf (Standard A4)`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handlePreviewPdf = () => {
    openInvoicePdfPreview(currentInvoice);
  };

  const handleSendReminder = () => {
    setRemindSuccess(true);
    setTimeout(() => setRemindSuccess(false), 3000);
  };

  const handleMarkAsPaid = () => {
    InvoiceFlowStore.updateInvoiceStatus(currentInvoice.id, 'paid');
    setCurrentInvoice({ ...currentInvoice, status: 'paid' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden border-b border-[#E2E8F0] pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentInvoice.status !== 'paid' && (
            <button
              onClick={handleMarkAsPaid}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DDF3E4] text-[#14532D] text-xs font-bold hover:bg-[#BBF7D0] transition-colors"
            >
              <CheckCircle2 className="size-4" />
              <span>Mark as Paid</span>
            </button>
          )}

          <button
            onClick={() => onOpenPublicPay(currentInvoice)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold hover:bg-[#E0E7FF] transition-colors"
          >
            <ExternalLink className="size-4" />
            <span>Client Pay Link</span>
          </button>

          <button
            onClick={handleSendReminder}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <Send className="size-4 text-[#64748B]" />
            <span>Remind</span>
          </button>

          <button
            onClick={handlePreviewPdf}
            title="Preview vector PDF in browser tab"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <Eye className="size-4 text-[#64748B]" />
            <span>PDF Preview</span>
          </button>

          <button
            onClick={handlePrint}
            title="Open browser print dialog"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <Printer className="size-4 text-[#64748B]" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="size-4" />
            <span>Download Tax PDF</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-[#DDF3E4] text-[#14532D] text-xs font-bold border border-[#BBF7D0] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-[#14532D]" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {remindSuccess && (
        <div className="p-3.5 rounded-xl bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold border border-[#C7D2FE] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4" />
          <span>Payment reminder email queued for {currentInvoice.clientEmail}</span>
        </div>
      )}

      {/* Printable Invoice Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E2E8F0] shadow-sm space-y-10 print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#E2E8F0] pb-8">
          <div>
            <span className="text-xs font-extrabold text-[#4F46E5] uppercase tracking-wider block">
              TAX INVOICE
            </span>
            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#0F172A] mt-1 tabular-nums">
              {currentInvoice.number}
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Issued: {currentInvoice.issueDate} · Due: {currentInvoice.dueDate}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                currentInvoice.status === 'paid'
                  ? 'bg-[#DDF3E4] text-[#14532D]'
                  : currentInvoice.status === 'overdue'
                  ? 'bg-[#FEE2E2] text-[#7F1D1D]'
                  : currentInvoice.status === 'sent'
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'bg-slate-100 text-[#475569]'
              }`}
            >
              {currentInvoice.status}
            </span>
            <div className="font-extrabold text-sm text-[#0F172A]">
              {InvoiceFlowStore.getProfile().companyName}
            </div>
            <div className="text-xs text-[#64748B]">
              {InvoiceFlowStore.getProfile().email}
            </div>
          </div>
        </div>

        {/* Client Address Block */}
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Billed To:
            </span>
            <p className="font-bold text-sm text-[#0F172A]">{currentInvoice.clientCompany || currentInvoice.clientName}</p>
            <p className="text-[#475569]">Attn: {currentInvoice.clientName}</p>
            <p className="text-[#64748B]">{currentInvoice.clientEmail}</p>
          </div>

          <div className="text-right tabular-nums space-y-1">
            <span className="font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Payment Terms:
            </span>
            <p className="font-semibold text-[#0F172A]">Direct Card or Bank Transfer</p>
            <p className="text-[#64748B]">Net 14 Calendar Days</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {currentInvoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-semibold text-[#0F172A]">{item.description}</td>
                  <td className="py-4 text-center text-[#64748B]">{item.quantity}</td>
                  <td className="py-4 text-right text-[#64748B]">
                    {formatCurrency(item.unitPriceCents)}
                  </td>
                  <td className="py-4 text-right font-bold text-[#0F172A]">
                    {formatCurrency(Math.round(item.quantity * item.unitPriceCents))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subtotal & Tax Breakdown */}
          <div className="border-t border-[#E2E8F0] pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs tabular-nums">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span>
                <span className="font-bold text-[#0F172A]">{formatCurrency(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Tax ({currentInvoice.taxPercent}%)</span>
                <span className="font-bold text-[#0F172A]">{formatCurrency(taxCents)}</span>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-baseline font-extrabold text-sm text-[#0F172A]">
                <span>Total Due</span>
                <span className="text-xl text-[#4F46E5]">{formatCurrency(totalCents)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {currentInvoice.notes && (
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
            <span className="font-bold text-[#0F172A] block uppercase tracking-wider text-[11px]">
              Notes / Instructions
            </span>
            <p>{currentInvoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
