import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Lock, ArrowLeft, Shield } from 'lucide-react';
import { Invoice } from '../lib/types';
import { InvoiceFlowStore } from '../lib/store';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';

interface PublicPayViewProps {
  invoice: Invoice;
  onBack: () => void;
}

export const PublicPayView: React.FC<PublicPayViewProps> = ({ invoice, onBack }) => {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(invoice);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(invoice.status === 'paid');

  const subtotalCents = calculateSubtotalCents(currentInvoice.items);
  const taxCents = calculateTaxCents(subtotalCents, currentInvoice.taxPercent);
  const totalCents = calculateTotalCents(subtotalCents, taxCents);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      InvoiceFlowStore.updateInvoiceStatus(currentInvoice.id, 'paid');
      setCurrentInvoice({ ...currentInvoice, status: 'paid' });
      setIsProcessing(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
      >
        <ArrowLeft className="size-4" />
        <span>Return to application</span>
      </button>

      <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl space-y-8">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-6">
          <div>
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider block">
              Secure Checkout
            </span>
            <h1 className="font-extrabold text-2xl text-[#0F172A]">
              Pay {currentInvoice.number}
            </h1>
          </div>
          <span className="text-xs text-[#64748B] font-semibold">
            {InvoiceFlowStore.getProfile().companyName}
          </span>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4 animate-in fade-in">
            <div className="size-16 rounded-full bg-[#DDF3E4] text-[#14532D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-extrabold text-2xl text-[#0F172A]">Payment Succeeded</h2>
              <p className="text-xs text-[#64748B]">
                Thank you! Payment of {formatCurrency(totalCents)} has been settled via Stripe test mode.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] text-xs tabular-nums text-left space-y-1">
              <div className="flex justify-between">
                <span>Receipt Number:</span>
                <span className="font-bold text-[#0F172A]">REC-{Date.now().toString(36).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid for:</span>
                <span className="font-bold text-[#0F172A]">{currentInvoice.clientCompany || currentInvoice.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-[#14532D]">SETTLED</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Amount Banner */}
            <div className="p-6 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#4F46E5] block">Total Amount Due</span>
                <span className="text-xs text-[#64748B]">Includes {currentInvoice.taxPercent}% GST</span>
              </div>
              <span className="font-extrabold text-3xl text-[#4F46E5] tabular-nums">
                {formatCurrency(totalCents)}
              </span>
            </div>

            {/* Simulated Card Form */}
            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="size-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-mono tabular-nums text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A] uppercase">Expires</label>
                  <input
                    type="text"
                    defaultValue="08/29"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-mono text-[#0F172A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A] uppercase">CVC</label>
                  <input
                    type="text"
                    defaultValue="789"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-mono text-[#0F172A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider shadow-primary transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Authorizing Card Payment...</span>
                ) : (
                  <>
                    <Lock className="size-4" />
                    <span>Pay {formatCurrency(totalCents)} Now</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] pt-2">
                <Shield className="size-3.5 text-[#4F6B3A]" />
                <span>256-bit encrypted test mode transaction</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
