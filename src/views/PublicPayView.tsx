import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Lock, ArrowLeft, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { Invoice } from '../lib/types';
import { InvoiceFlowStore } from '../lib/store';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';
import { createInvoiceCheckoutSession, retrieveCheckoutSession } from '../lib/stripe';

interface PublicPayViewProps {
  invoice: Invoice;
  onBack: () => void;
}

export const PublicPayView: React.FC<PublicPayViewProps> = ({ invoice, onBack }) => {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(invoice);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(invoice.status === 'paid');

  const subtotalCents = calculateSubtotalCents(currentInvoice.items);
  const taxCents = calculateTaxCents(subtotalCents, currentInvoice.taxPercent);
  const totalCents = calculateTotalCents(subtotalCents, taxCents);

  useEffect(() => {
    // Check if returning from a real Stripe checkout session
    const hash = window.location.hash;
    if (hash.includes('session_id=') && (hash.includes('paid=true') || hash.includes(currentInvoice.id))) {
      const query = hash.split('?')[1];
      const params = new URLSearchParams(query);
      const sessionId = params.get('session_id');

      if (sessionId) {
        InvoiceFlowStore.updateInvoiceStatus(currentInvoice.id, 'paid');
        setCurrentInvoice((prev) => ({ ...prev, status: 'paid' }));
        setIsSuccess(true);
        retrieveCheckoutSession(sessionId).then((data) => {
          if (data) {
            InvoiceFlowStore.updateInvoiceStatus(currentInvoice.id, 'paid');
          }
        });
      }
    }
  }, [currentInvoice.id]);

  const handleStripeCheckout = async () => {
    setIsStripeLoading(true);
    setStripeError(null);
    try {
      const res = await createInvoiceCheckoutSession(currentInvoice);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setStripeError(res.error || 'Failed to start Stripe Checkout. You can pay using the test card form below.');
      }
    } catch {
      setStripeError('Network error connecting to Stripe. Please use the test card form below.');
    } finally {
      setIsStripeLoading(false);
    }
  };

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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
      >
        <ArrowLeft className="size-4" />
        <span>Return to application</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
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

            {/* Stripe Checkout Primary Option */}
            <div className="space-y-3">
              {stripeError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  {stripeError}
                </div>
              )}
              <button
                type="button"
                disabled={isStripeLoading}
                onClick={handleStripeCheckout}
                className="w-full py-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider shadow-primary transition-colors flex items-center justify-center gap-2"
              >
                {isStripeLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Connecting to Stripe Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" />
                    <span>Pay {formatCurrency(totalCents)} with Stripe Checkout</span>
                    <ExternalLink className="size-3.5" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
                <Shield className="size-3.5 text-[#4F6B3A]" />
                <span>Redirects to Stripe's secure checkout page</span>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E2E8F0]" />
              <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Or Instant Card Simulation
              </span>
              <div className="flex-grow border-t border-[#E2E8F0]" />
            </div>

            {/* Simulated Card Form */}
            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">
                  Test Card Number
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
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs uppercase tracking-wider border border-[#CBD5E1] transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Authorizing Card...</span>
                ) : (
                  <>
                    <Lock className="size-4" />
                    <span>Authorize Test Card Directly</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
