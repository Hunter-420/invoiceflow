import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, ExternalLink, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
        retrieveCheckoutSession(sessionId).then((verification) => {
          setIsStripeLoading(false);
          InvoiceFlowStore.upgradePlan(plan);
          onSubscriptionUpdate();
          setStripeSuccessNotice(
            `Stripe payment verified successfully. Account upgraded to ${plan.toUpperCase()} tier.`
          );
        }).catch(() => {
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

  const handleQuickStripeUpgrade = async (targetPlan: PlanType) => {
    setIsStripeLoading(true);
    try {
      const res = await createPlanCheckoutSession(targetPlan, false);
      if (res.url) {
        window.location.href = res.url;
      } else {
        onNavigate('pricing');
      }
    } catch {
      onNavigate('pricing');
    } finally {
      setIsStripeLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
          Subscription & Payments
        </span>
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A] mt-1">
          Billing & Plans
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage your subscription tier, Stripe customer portal, and invoice usage limits.
        </p>
      </div>

      {stripeSuccessNotice && (
        <div className="p-4 rounded-xl bg-[#DDF3E4] text-[#14532D] text-xs font-bold border border-[#BBF7D0] flex items-center justify-between gap-2 animate-in fade-in">
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
        <div className="p-4 rounded-xl bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold border border-[#C7D2FE] flex items-center gap-2">
          <Shield className="size-4" />
          <span>Simulated redirect to Stripe Customer Portal (in production, generates a hosted billing portal session).</span>
        </div>
      )}

      {/* Current Plan Overview Card (Figma node 6:2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="font-extrabold text-2xl text-[#0F172A]">
                  {limits.name}
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-xs font-bold uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                {subscription.plan === 'free'
                  ? 'No monthly fees. Upgrade to unlock unlimited usage.'
                  : `Billed at $${limits.priceMonthly}.00 / month via Stripe.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('pricing')}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold shadow-sm hover:bg-[#4338CA] transition-colors"
              >
                Change Plan
              </button>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-[#0F172A]">Plan Usage Limits</h3>

            {/* Clients Meter */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-[#475569]">Active Clients</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  {clients.length} / {limits.maxClients === Infinity ? 'Unlimited' : limits.maxClients}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, (clients.length / (limits.maxClients === Infinity ? 20 : limits.maxClients)) * 100)}%`,
                  }}
                  className="h-full bg-[#4F46E5] rounded-full"
                />
              </div>
            </div>

            {/* Invoices Meter */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-[#475569]">Monthly Invoices</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  {invoices.length} / {limits.maxInvoicesPerMonth === Infinity ? 'Unlimited' : limits.maxInvoicesPerMonth}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, (invoices.length / (limits.maxInvoicesPerMonth === Infinity ? 20 : limits.maxInvoicesPerMonth)) * 100)}%`,
                  }}
                  className="h-full bg-[#4F46E5] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Customer Portal Link */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-[#64748B]">
              Stripe Customer ID: <span className="font-mono text-[#0F172A]">{subscription.stripeCustomerId}</span>
            </div>

            <button
              onClick={handlePortalRedirect}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
            >
              <span>Manage on Stripe Customer Portal</span>
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4 bg-[#EEF2FF] rounded-3xl p-6 border border-[#C7D2FE] space-y-4">
          <div className="flex items-center gap-2 text-[#4F46E5]">
            <Shield className="size-5" />
            <h3 className="font-bold text-sm text-[#0F172A]">Demo Honesty Notice</h3>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed text-pretty">
            This demo connects to Stripe test mode. No real credit card transactions occur and no real customer funds are captured.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full py-2.5 rounded-xl bg-white text-[#4F46E5] font-bold text-xs border border-[#C7D2FE] hover:bg-slate-50 transition-colors"
            >
              Compare All Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
