import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, ChevronDown, ChevronUp, Star, CreditCard, Lock, Sparkles } from 'lucide-react';

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
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-12 lg:pt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D2FE]">
              <span className="size-2 rounded-full bg-[#4F46E5]"></span>
              <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                Built for Independent Designers & Developers
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] leading-[1.08] tracking-tight text-balance">
              Get paid on time, every time, without awkward chasing
            </h1>

            <p className="text-lg sm:text-xl text-[#475569] leading-relaxed max-w-xl text-pretty">
              Create branded invoices in under 60 seconds, accept instant credit card payments via Stripe, and monitor your monthly recurring revenue in one calm dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm shadow-primary transition-all active:scale-95"
              >
                <span>Open Live Dashboard Demo</span>
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-sm border border-[#CBD5E1] transition-colors"
              >
                View Plans & Pricing
              </button>
            </div>

            {/* Proof Signals */}
            <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center gap-8 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-[#0F172A] tabular-nums">4.9 / 5.0</span>
                <span>(340+ freelancers)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-[#4F6B3A]" />
                <span className="font-medium">Average payout time: 3 days</span>
              </div>
            </div>
          </div>

          {/* Interactive Invoice Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-xl space-y-6 relative">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">Preview Invoice</span>
                  <h3 className="font-extrabold text-xl text-[#0F172A]">INV-0153</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#DDF3E4] text-[#14532D] text-xs font-bold">
                  Sent · Net 14
                </span>
              </div>

              <div className="space-y-3 text-xs tabular-nums">
                <div className="flex justify-between text-[#64748B]">
                  <span>Client:</span>
                  <span className="font-bold text-[#0F172A]">Northwind Studio (Maya Ellison)</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Issue Date:</span>
                  <span className="font-medium text-[#0F172A]">08 Nov 2026</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Due Date:</span>
                  <span className="font-medium text-[#0F172A]">22 Nov 2026</span>
                </div>
              </div>

              {/* Line items mini table */}
              <div className="rounded-xl border border-[#E2E8F0] overflow-hidden text-xs">
                <div className="bg-slate-50 px-3 py-2 flex justify-between font-bold text-[#64748B] border-b border-[#E2E8F0]">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-3 space-y-2 tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-[#0F172A] font-medium">Brand Identity Design Sprint</span>
                    <span className="font-bold text-[#0F172A]">$1,800.00</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Collateral Revisions (3 hrs)</span>
                    <span className="font-semibold text-[#0F172A]">$600.00</span>
                  </div>
                </div>
                <div className="bg-[#EEF2FF] p-3 flex justify-between items-center border-t border-[#C7D2FE]">
                  <span className="font-bold text-[#4F46E5]">Total with 15% GST:</span>
                  <span className="font-extrabold text-base text-[#4F46E5] tabular-nums">$2,760.00</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => onNavigate('invoices')}
                  className="w-full py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold shadow-sm"
                >
                  Pay Invoice Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              Streamlined Workflow
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#0F172A] text-balance">
              From contract agreement to settled funds in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl bg-white p-8 border border-[#E2E8F0] space-y-4 shadow-sm">
              <span className="size-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-extrabold text-lg">
                1
              </span>
              <h3 className="font-bold text-xl text-[#0F172A]">
                Add or Select Client
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed text-pretty">
                Store client contact details, billing company name, and currency once. Search and attach in two keystrokes.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 border border-[#E2E8F0] space-y-4 shadow-sm">
              <span className="size-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-extrabold text-lg">
                2
              </span>
              <h3 className="font-bold text-xl text-[#0F172A]">
                Draft Line Items with Live Tax Math
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed text-pretty">
                Add hourly or fixed line items. Subtotals, GST, and currency totals compute automatically in exact integer cents.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 border border-[#E2E8F0] space-y-4 shadow-sm">
              <span className="size-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-extrabold text-lg">
                3
              </span>
              <h3 className="font-bold text-xl text-[#0F172A]">
                Share Link & Get Paid Directly
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed text-pretty">
                Clients pay via card with one click. Invoices instantly mark as paid, and metrics update on your revenue dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="px-4 sm:px-8">
        <div className="max-w-7xl mx-auto rounded-[36px] bg-[#0F172A] text-white p-8 sm:p-14 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
              High-Craft SaaS Architecture
            </span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white text-balance">
              Built to withstand real freelance operations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-[#1E293B]">
            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#818CF8]">
                <Shield className="size-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Row Level Security</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed text-pretty">
                Strict multi-tenant boundary checks. User A can never inspect or alter User B invoices, clients, or billing tokens.
              </p>
            </div>

            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#818CF8]">
                <CreditCard className="size-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Stripe Webhook Sync</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed text-pretty">
                Idempotent subscription webhooks handle upgrades, cancellations, and past-due statuses seamlessly.
              </p>
            </div>

            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#818CF8]">
                <TrendingUp className="size-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Integer-Cent Precision</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed text-pretty">
                Eliminates JavaScript floating-point rounding errors. All calculations happen in integer cents with tabular numerals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              Answers to Common Questions
            </span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A] text-balance">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-base text-[#0F172A]">{faq.q}</span>
                    <span className="size-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-[#475569] leading-relaxed text-pretty border-t border-[#E2E8F0]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 sm:px-8">
        <div className="max-w-7xl mx-auto rounded-[36px] bg-[#4F46E5] p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-primary">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white text-balance">
              Send your first branded invoice in 2 minutes
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 text-pretty">
              Try the live interactive demo or test client creation without any credit card required.
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-8 py-4 rounded-xl bg-white hover:bg-indigo-50 text-[#4F46E5] font-extrabold text-sm transition-colors shadow-sm shrink-0"
          >
            Launch Interactive Dashboard
          </button>
        </div>
      </section>
    </div>
  );
};
