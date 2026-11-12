import React, { useState } from 'react';
import { Plus, Shield, User, Menu, X, ArrowUpRight, FileText, CheckCircle2 } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Profile, Subscription } from '../lib/types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  profile: Profile;
  subscription: Subscription;
  onRoleSwitch: (role: 'pro' | 'admin' | 'free') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  profile,
  subscription,
  onRoleSwitch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeRole = InvoiceFlowStore.getActiveRole();

  const handleLinkClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLanding = currentTab === 'landing';

  const appNavLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'clients', label: 'Clients' },
    { id: 'billing', label: 'Billing' },
    { id: 'pricing', label: 'Pricing' },
    ...(profile.role === 'admin' ? [{ id: 'admin', label: 'Admin Accounts' }] : []),
  ];

  return (
    <>
      {/* Top Demo Bar & Multi-Role Switcher */}
      <div className="bg-[#0F172A] text-[#94A3B8] text-xs py-2 px-4 sm:px-8 border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#818CF8] uppercase tracking-wider text-[11px]">
              Demo SaaS Mode
            </span>
            <span className="hidden sm:inline text-[#64748B]">
              Stripe Test Mode | Plan: {subscription.plan.toUpperCase()}
            </span>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748B] hidden md:inline">Switch Role:</span>
            <div className="flex gap-1 bg-[#1E293B] p-0.5 rounded-lg border border-[#334155] text-[11px]">
              <button
                onClick={() => onRoleSwitch('pro')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  activeRole === 'pro'
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Pro ($12)
              </button>
              <button
                onClick={() => onRoleSwitch('free')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  activeRole === 'free'
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Free Tier
              </button>
              <button
                onClick={() => onRoleSwitch('admin')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  activeRole === 'admin'
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Studio Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Navigation (PDF Page 1 & 2 Header) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Brand Logo [I] InvoiceFlow */}
          <button
            onClick={() => handleLinkClick('landing')}
            className="flex items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4F46E5] rounded-xl p-1 group"
            aria-label="InvoiceFlow Home"
          >
            <div className="size-10 rounded-xl bg-[#4F46E5] flex items-center justify-center p-2 text-white shadow-sm group-hover:scale-105 transition-transform font-bold text-lg">
              I
            </div>
            <div>
              <span className="block font-sans font-extrabold text-xl text-[#0F172A] tracking-tight leading-none">
                InvoiceFlow
              </span>
              <span className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mt-0.5">
                Freelance Invoicing SaaS
              </span>
            </div>
          </button>

          {/* Nav Links: If Landing, show PDF Page 1 links (Features, Pricing, Customers, Docs). Otherwise app links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {isLanding ? (
              <>
                <button
                  onClick={() => handleLinkClick('landing')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => handleLinkClick('pricing')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => handleLinkClick('landing')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                >
                  Customers
                </button>
                <button
                  onClick={() => handleLinkClick('dashboard')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                >
                  Docs
                </button>
              </>
            ) : (
              appNavLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#EEF2FF] text-[#4F46E5]'
                        : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })
            )}
          </nav>

          {/* Actions: If Landing, show Log in & Start free (PDF Page 1). Otherwise New Invoice button */}
          <div className="flex items-center gap-3">
            {isLanding ? (
              <>
                <button
                  onClick={() => handleLinkClick('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => handleLinkClick('signup')}
                  className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-primary transition-all active:scale-95"
                >
                  Start free
                </button>
              </>
            ) : (
              <button
                onClick={() => handleLinkClick('invoice-new')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-primary transition-all active:scale-95"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">New invoice</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden size-10 rounded-xl border border-[#CBD5E1] flex items-center justify-center text-[#0F172A]"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-bold">
                    I
                  </div>
                  <span className="font-bold text-lg text-[#0F172A]">InvoiceFlow</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#64748B]"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="py-6 flex flex-col gap-2">
                <button
                  onClick={() => handleLinkClick('landing')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    currentTab === 'landing' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleLinkClick('dashboard')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    currentTab === 'dashboard' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleLinkClick('invoices')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    currentTab === 'invoices' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => handleLinkClick('clients')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    currentTab === 'clients' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                >
                  Clients
                </button>
                <button
                  onClick={() => handleLinkClick('billing')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    currentTab === 'billing' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                >
                  Billing
                </button>
                <button
                  onClick={() => handleLinkClick('pricing')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    currentTab === 'pricing' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                >
                  Pricing
                </button>
                <button
                  onClick={() => handleLinkClick('login')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    currentTab === 'login' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                >
                  Log in
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E2E8F0]">
              <button
                onClick={() => handleLinkClick('invoice-new')}
                className="w-full py-3.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold uppercase tracking-wider shadow-primary"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
