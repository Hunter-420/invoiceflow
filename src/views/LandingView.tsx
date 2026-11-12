import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, ChevronDown, ChevronUp, Star, CreditCard, Lock, Sparkles, Check, FileText, Clock, BarChart3 } from 'lucide-react';

interface LandingViewProps {
  onNavigate: (tab: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does client payment work with Stripe?',
      a: 'When you create an invoice, a secure public payment link is generated. Your client can pay instantly using debit card, credit card, Apple Pay, or Google Pay via Stripe test mode in this demo. Once paid, the invoice status updates automatically.'
    },
    {
      q: 'Can I set custom tax rates like 15% GST?',
      a: 'Yes. You can configure your default tax rate in Settings (such as 15% GST for New Zealand, or state tax for the US). You can also override the tax percentage on any individual invoice.'
    },
    {
      q: 'What are the limits on the Free Starter plan?',
      a: 'The Free Starter plan allows you to manage up to 3 active clients and create up to 5 invoices per calendar month at zero cost. When your business grows, you can upgrade to Pro for unlimited clients and invoices.'
    },
    {
      q: 'Can I export invoices as clean printable PDFs?',
      a: 'Yes, every invoice features a dedicated Print and PDF export view formatted to standard A4/Letter page standards with clean tabular line items and business tax breakdowns.'
    },
    {
      q: 'Is my financial data secure?',
      a: 'In a full production deployment, Row Level Security (RLS) is strictly enforced on Postgres tables, ensuring each user can only read and write their own client and invoice records. Stripe webhook signatures are cryptographically validated.'
    },
    {
      q: 'Can I switch plans or cancel at any time?',
      a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time in the Billing settings. There are no lock-in contracts.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-14 pb-12 sm:pb-14">
      {/* Hero Section (Figma node 3:2 / PDF Page 1) */}
      <section className="px-4 sm:px-8 pt-6 sm:pt-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-5">
            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-[54px] text-[#0F172A] leading-[1.1] tracking-tight text-balance">
              Invoicing that gets you paid faster
            </h1>

            <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl text-pretty">
              Create professional invoices in seconds, send them to clients, and track every payment in one clean dashboard. No spreadsheets, no chasing.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('signup')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm shadow-primary transition-all active:scale-95"
              >
                <span>Start for free</span>
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-sm border border-[#CBD5E1] transition-colors"
              >
                Watch 60s demo
              </button>
            </div>
          </div>

          {/* Right Column (Hero Card Preview from PDF Page 1) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xl space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <span className="font-extrabold text-base text-[#0F172A]">This month</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-xs font-bold tabular-nums">
                  +18% vs last month
                </span>
              </div>

              {/* 3 Metric Tiles */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="text-[11px] font-semibold text-[#64748B] block">Paid</span>
                  <span className="font-extrabold text-lg text-[#0F172A] tabular-nums block">
                    $12,480
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="text-[11px] font-semibold text-[#64748B] block">Pending</span>
                  <span className="font-extrabold text-lg text-[#0F172A] tabular-nums block">
                    $3,260
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="text-[11px] font-semibold text-[#64748B] block">Overdue</span>
                  <span className="font-extrabold text-lg text-[#B91C1C] tabular-nums block">
                    $840
                  </span>
                </div>
              </div>

              {/* Recent Invoices List */}
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                  Recent invoices
                </span>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] flex items-center justify-between transition-all">
                    <div>
                      <span className="font-bold text-xs text-[#0F172A] block">Northwind Studio</span>
                      <span className="text-[11px] text-[#64748B]">INV-0148</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-[#0F172A] tabular-nums">$2,400</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-[11px] font-bold">
                        Paid
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] flex items-center justify-between transition-all">
                    <div>
                      <span className="font-bold text-xs text-[#0F172A] block">Bloom & Co.</span>
                      <span className="text-[11px] text-[#64748B]">INV-0147</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-[#0F172A] tabular-nums">$860</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold">
                        Pending
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] flex items-center justify-between transition-all">
                    <div>
                      <span className="font-bold text-xs text-[#0F172A] block">Atlas Labs</span>
                      <span className="text-[11px] text-[#64748B]">INV-0146</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-[#0F172A] tabular-nums">$3,150</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#DDF3E4] text-[#14532D] text-[11px] font-bold">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Text */}
        <div className="text-center pt-8 sm:pt-10">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Loved by 2,400+ freelancers and small studios
          </p>
        </div>
      </section>

      {/* EVERYTHING YOU NEED Section (PDF Page 1) */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] block">
            EVERYTHING YOU NEED
          </span>
          <h2 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
            Built for people who bill clients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm space-y-3.5 hover:shadow-md transition-shadow">
            <div className="size-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <Clock className="size-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F172A]">Create in seconds</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed text-pretty">
              Reusable clients and line items turn a blank page into a finished invoice in under a minute.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm space-y-3.5 hover:shadow-md transition-shadow">
            <div className="size-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <CreditCard className="size-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F172A]">Get paid online</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed text-pretty">
              Clients pay by card through Stripe. Payment status syncs to your dashboard automatically.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm space-y-3.5 hover:shadow-md transition-shadow">
            <div className="size-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <BarChart3 className="size-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F172A]">Know where you stand</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed text-pretty">
              Totals, overdue invoices and monthly revenue at a glance, with no spreadsheet needed.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING Section (PDF Page 1) */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] block">
            PRICING
          </span>
          <h2 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
            Simple plans that grow with you
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div>
                <h3 className="font-extrabold text-xl text-[#0F172A]">Free</h3>
                <p className="text-xs text-[#64748B] mt-0.5">For trying things out</p>
              </div>

              <div className="py-2 border-y border-[#E2E8F0]">
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">$0</span>
                  <span className="text-xs text-[#64748B]">/ month</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-[#475569]">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>3 clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>5 invoices / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Email delivery</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('pricing')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold transition-colors"
            >
              Choose Free
            </button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#4F46E5] shadow-xl flex flex-col justify-between space-y-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most popular
            </div>

            <div className="space-y-3.5">
              <div>
                <h3 className="font-extrabold text-xl text-[#0F172A]">Pro</h3>
                <p className="text-xs text-[#64748B] mt-0.5">For busy freelancers</p>
              </div>

              <div className="py-2 border-y border-[#E2E8F0]">
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">$12</span>
                  <span className="text-xs text-[#64748B]">/ month</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-[#475569]">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Unlimited clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Unlimited invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Stripe card payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Overdue reminders</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('pricing')}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider shadow-primary transition-colors"
            >
              Start 14-day trial
            </button>
          </div>

          {/* Studio Tier */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div>
                <h3 className="font-extrabold text-xl text-[#0F172A]">Studio</h3>
                <p className="text-xs text-[#64748B] mt-0.5">For small teams</p>
              </div>

              <div className="py-2 border-y border-[#E2E8F0]">
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums">$29</span>
                  <span className="text-xs text-[#64748B]">/ month</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-[#475569]">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Team roles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Admin dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#14532D]" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('pricing')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold transition-colors"
            >
              Choose Studio
            </button>
          </div>
        </div>
      </section>

      {/* Send your first invoice in 2 minutes (PDF Page 1 Banner) */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0F172A] text-white rounded-3xl p-8 sm:p-10 text-center space-y-5">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="font-extrabold text-2xl sm:text-3xl text-balance">
              Send your first invoice in 2 minutes
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] text-pretty">
              Free plan, no credit card. Upgrade only when you need Stripe payments.
            </p>
          </div>

          <button
            onClick={() => onNavigate('signup')}
            className="px-7 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider shadow-primary transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <span>Create free account</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="px-4 sm:px-8 max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] block">
            Frequently Asked Questions
          </span>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
            Everything you need to know
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#0F172A] hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="size-4 text-[#4F46E5] shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-[#64748B] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-[#475569] leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
