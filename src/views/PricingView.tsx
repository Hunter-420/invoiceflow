import React, { useState } from 'react';
import { Check, Shield, Zap, Sparkles, CreditCard, Lock, X, ExternalLink, Loader2 } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { PlanType, Subscription } from '../lib/types';
import { createPlanCheckoutSession } from '../lib/stripe';

interface PricingViewProps {
  onNavigate: (tab: string) => void;
  subscription: Subscription;
  onSubscriptionUpdate: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  onNavigate,
  subscription,
  onSubscriptionUpdate,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<PlanType | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Free Starter',
      desc: 'Ideal for new freelancers getting their first client contracts off the ground.',
      priceMonthly: 0,
      priceAnnual: 0,
      limits: 'Up to 3 clients · 5 invoices / month',
      features: [
        '3 Active clients',
        '5 Invoices per calendar month',
        'Standard invoice line item builder',
        '15% Tax calculation',
        'Printable PDF export view',
      ],
      cta: 'Current Plan',
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro Freelancer',
      desc: 'Everything an active independent contractor needs for unlimited billing.',
      priceMonthly: 12,
      priceAnnual: 10,
      popular: true,
      limits: 'Unlimited clients · Unlimited invoices',
      features: [
        'Unlimited active clients',
        'Unlimited invoices and line items',
        'Public client credit card pay page',
        'Stripe Checkout in test mode',
        'Overdue reminders and tracking',
        'Net 7, 14, 30 payment terms',
      ],
      cta: 'Upgrade to Pro',
    },
    {
      id: 'studio' as PlanType,
      name: 'Studio MVP',
      desc: 'For small development agencies and studios requiring multi-user admin oversight.',
      priceMonthly: 29,
      priceAnnual: 24,
      limits: 'Unlimited everything + Admin Portal',
      features: [
        'All Pro features included',
        'Admin MRR and account metrics',
        'Multi-user team permissions',
        'Customer Portal billing management',
        'Priority technical assistance',
      ],
      cta: 'Upgrade to Studio',
    },
  ];

  const handleStripeCheckout = async (plan: PlanType) => {
    if (plan === subscription.plan) {
      onNavigate('billing');
      return;
    }
    if (plan === 'free') {
      InvoiceFlowStore.upgradePlan('free');
      onSubscriptionUpdate();
      onNavigate('billing');
      return;
    }

    setIsStripeLoading(true);
    setStripeError(null);

    try {
      const res = await createPlanCheckoutSession(plan, isAnnual);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setStripeError(res.error || 'Failed to initialize Stripe checkout. You can use the instant modal below.');
        setCheckoutModalPlan(plan);
      }
    } catch (err) {
      setStripeError('Network error connecting to Stripe. Fallback modal enabled.');
      setCheckoutModalPlan(plan);
    } finally {
      setIsStripeLoading(false);
    }
  };

  const handleCompleteTestCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutModalPlan) return;
    setIsProcessing(true);

    setTimeout(() => {
      InvoiceFlowStore.upgradePlan(checkoutModalPlan);
      onSubscriptionUpdate();
      setIsProcessing(false);
      setCheckoutModalPlan(null);
      onNavigate('billing');
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
          Transparent Pricing
        </span>
        <h1 className="font-extrabold text-4xl sm:text-5xl text-[#0F172A] text-balance">
          Choose the right plan for your freelance business
        </h1>
        <p className="text-sm sm:text-base text-[#475569] text-pretty">
          Upgrade or cancel any time with test-mode Stripe checkout simulation.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${!isAnnual ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-[#CBD5E1] p-1 flex items-center transition-colors relative"
            aria-label="Toggle annual billing discount"
          >
            <div
              className={`size-4 rounded-full bg-[#4F46E5] transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${isAnnual ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
            Annual Billing
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-[11px] font-bold">
            Save 20%
          </span>
        </div>
      </div>

      {stripeError && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span>{stripeError}</span>
          <button
            onClick={() => setStripeError(null)}
            className="font-bold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => {
          const isCurrent = subscription.plan === p.id;
          const price = isAnnual ? p.priceAnnual : p.priceMonthly;

          return (
            <div
              key={p.id}
              className={`rounded-3xl p-8 border flex flex-col justify-between transition-all relative ${
                p.popular
                  ? 'bg-white border-[#4F46E5] shadow-xl ring-2 ring-[#4F46E5]/20'
                  : 'bg-white border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1]'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-2xl text-[#0F172A]">{p.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 min-h-[36px]">{p.desc}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-4xl text-[#0F172A] tabular-nums">
                      ${price}
                    </span>
                    <span className="text-xs text-[#64748B]">/ month {isAnnual && '(billed annually)'}</span>
                  </div>
                  <span className="text-xs text-[#4F46E5] font-semibold block">
                    {p.limits}
                  </span>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                    Plan Features:
                  </span>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#0F172A]">
                      <Check className="size-4 text-[#4F6B3A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  disabled={isCurrent || isStripeLoading}
                  onClick={() => handleStripeCheckout(p.id)}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 text-[#64748B] cursor-default border border-[#E2E8F0]'
                      : p.popular
                      ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-primary'
                      : 'bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] border border-[#C7D2FE]'
                  }`}
                >
                  {isStripeLoading && !isCurrent ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Opening Stripe...</span>
                    </>
                  ) : isCurrent ? (
                    'Current Active Plan'
                  ) : (
                    <>
                      <span>{p.cta}</span>
                      <ExternalLink className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Checkout Modal Simulation */}
      {checkoutModalPlan && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Stripe Test Mode Checkout"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">
                  <CreditCard className="size-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">
                    Stripe Checkout (Test Mode)
                  </h3>
                  <span className="text-[11px] text-[#64748B]">Simulated Subscription Flow</span>
                </div>
              </div>
              <button
                onClick={() => setCheckoutModalPlan(null)}
                className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#64748B]"
                aria-label="Close checkout"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] space-y-1 text-xs">
              <span className="text-[#4F46E5] font-bold block">Selected Subscription</span>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm text-[#0F172A] capitalize">
                  {checkoutModalPlan} Plan
                </span>
                <span className="font-extrabold text-base text-[#4F46E5] tabular-nums">
                  ${checkoutModalPlan === 'pro' ? '12.00' : '29.00'} / mo
                </span>
              </div>
            </div>

            <form onSubmit={handleCompleteTestCheckout} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">
                  Test Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-mono tabular-nums text-[#0F172A]"
                />
                <span className="text-[11px] text-[#64748B] block">
                  Use standard test card 4242 4242 4242 4242
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A] uppercase">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-mono text-[#0F172A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A] uppercase">CVC</label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-mono text-[#0F172A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider shadow-primary transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Test Subscription...</span>
                ) : (
                  <>
                    <Lock className="size-3.5" />
                    <span>Authorize & Upgrade Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
