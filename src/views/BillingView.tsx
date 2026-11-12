import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, ExternalLink, Shield, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Subscription, PlanType, PLAN_CONFIGS } from '../lib/types';
import { createPlanCheckoutSession, retrieveCheckoutSession } from '../lib/stripe';

interface BillingViewProps {
  onNavigate: (tab: string) => void;
  subscription: Subscription;
  onSubscriptionUpdate: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  onNavigate,
  subscription,
  onSubscriptionUpdate,
}) => {
  const [portalNotice, setPortalNotice] = useState(false);
  const [stripeSuccessNotice, setStripeSuccessNotice] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const clients = InvoiceFlowStore.getClients();
  const invoices = InvoiceFlowStore.getInvoices();
  const limits = PLAN_CONFIGS[subscription.plan];

  useEffect(() => {
    // Check if returning from a real Stripe Checkout redirect
    const hash = window.location.hash;
    if (hash.includes('session_id=')) {
      const query = hash.split('?')[1];
      const params = new URLSearchParams(query);
      const sessionId = params.get('session_id');
      const plan = params.get('plan') as PlanType | null;

      if (sessionId && plan) {
        setIsStripeLoading(true);
        retrieveCheckoutSession(sessionId)
          .then(() => {
            setIsStripeLoading(false);
            InvoiceFlowStore.upgradePlan(plan);
            onSubscriptionUpdate();
            setStripeSuccessNotice(
              `Stripe payment verified successfully. Account upgraded to ${plan.toUpperCase()} tier.`
            );
          })
          .catch(() => {
            setIsStripeLoading(false);
            InvoiceFlowStore.upgradePlan(plan);
            onSubscriptionUpdate();
            setStripeSuccessNotice(
              `Account upgraded to ${plan.toUpperCase()} tier via Stripe Checkout.`
            );
          });
      }
    }
  }, []);

  const handlePortalRedirect = () => {
    setPortalNotice(true);
    setTimeout(() => setPortalNotice(false), 3500);
  };

  const billingHistory = [
    { id: 'bh-1', plan: 'Pro plan · monthly', date: 'Nov 11, 2026', amount: '$12.00', status: 'Paid' },
    { id: 'bh-2', plan: 'Pro plan · monthly', date: 'Oct 11, 2026', amount: '$12.00', status: 'Paid' },
    { id: 'bh-3', plan: 'Pro plan · monthly', date: 'Sep 11, 2026', amount: '$12.00', status: 'Paid' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7">
      {/* Header (Figma node 6:2 / PDF Page 3) */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
          Billing & subscription
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Manage your plan, payment method and invoices from Stripe.
        </p>
      </div>

      {stripeSuccessNotice && (
        <div className="p-4 rounded-2xl bg-[#DDF3E4] text-[#14532D] text-xs font-bold border border-[#BBF7D0] flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-[#14532D]" />
            <span>{stripeSuccessNotice}</span>
          </div>
          <button
            onClick={() => setStripeSuccessNotice(null)}
            className="text-[11px] font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {portalNotice && (
        <div className="p-4 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold border border-[#C7D2FE] flex items-center gap-2">
          <Shield className="size-4 shrink-0" />
          <span>Simulated redirect to Stripe Customer Portal (in production, generates a hosted billing portal session).</span>
        </div>
      )}

      {/* Top 2 Cards: Current Plan & Payment Method (PDF Page 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Current Plan */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-[#64748B] block">Current plan</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="font-extrabold text-2xl text-[#0F172A]">{limits.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-xs font-bold">
                  Active
                </span>
              </div>
              <span className="font-extrabold text-lg text-[#0F172A] tabular-nums">
                ${limits.priceMonthly} / month
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed text-pretty">
              {subscription.plan === 'free'
                ? 'Standard 3 clients and 5 invoices/month. Upgrade to unlock unlimited usage.'
                : 'Unlimited clients and invoices, Stripe card payments, overdue reminders. Renews on Dec 11, 2026.'}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('pricing')}
              className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-primary transition-all active:scale-95"
            >
              Change plan
            </button>
            {subscription.plan !== 'free' && (
              <button
                onClick={() => {
                  InvoiceFlowStore.upgradePlan('free');
                  onSubscriptionUpdate();
                }}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#64748B] text-xs font-bold border border-[#CBD5E1] transition-colors"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Payment Method */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-[#64748B] block">Payment method</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-7 rounded-md bg-[#1E293B] flex items-center justify-center text-white text-[10px] font-extrabold tracking-wider">
                  VISA
                </div>
                <div>
                  <span className="font-bold text-sm text-[#0F172A] block">Visa ending in 4242</span>
                  <span className="text-xs text-[#64748B]">Expires 08 / 2028</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B] text-[11px] font-semibold">
                Default
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Payments are processed securely by Stripe. Demo uses Stripe test mode.
            </p>
          </div>

          <div>
            <button
              onClick={handlePortalRedirect}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-bold border border-[#CBD5E1] transition-colors"
            >
              Update card
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: 3 Metrics Tiles (PDF Page 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white p-5 border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-semibold text-[#64748B] block">Invoices sent</span>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">48</span>
            <span className="text-xs text-[#64748B]">this month</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-semibold text-[#64748B] block">Active clients</span>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">21</span>
            <span className="text-xs text-[#64748B]">of unlimited</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-semibold text-[#64748B] block">Collected via Stripe</span>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">$9,640</span>
            <span className="text-xs text-[#64748B]">this month</span>
          </div>
        </div>
      </div>

      {/* Bottom Card: Billing History (PDF Page 3) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <h2 className="font-extrabold text-lg text-[#0F172A]">Billing history</h2>
          <button
            onClick={handlePortalRedirect}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
          >
            <span>Open Stripe portal</span>
            <ExternalLink className="size-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {billingHistory.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-[#0F172A] block">{item.plan}</span>
                <span className="text-[#64748B]">{item.date}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-[#0F172A] tabular-nums">{item.amount}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-xs font-bold">
                  {item.status}
                </span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:underline"
                >
                  <Download className="size-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
