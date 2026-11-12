import React, { useState } from 'react';
import { FileText, Shield, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';

interface LoginViewProps {
  onNavigate: (tab: string) => void;
  onRoleSwitch: (role: 'pro' | 'admin' | 'free') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onRoleSwitch }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('nischal@invoiceflow.example');
  const [password, setPassword] = useState('password123');

  const handleQuickLogin = (role: 'pro' | 'admin' | 'free') => {
    onRoleSwitch(role);
    onNavigate('dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column (Branded Showcase) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0F172A] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white">
              <FileText className="size-5" />
            </div>
            <span className="font-extrabold text-xl">InvoiceFlow</span>
          </div>

          <h2 className="font-extrabold text-3xl text-balance pt-8 leading-tight">
            The calm invoicing tool designed for modern freelancers
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
            Spend less time chasing unpaid accounts and more time crafting work. Automated Net 14 terms, instant card settlement, and clean revenue analytics.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] space-y-3">
          <p className="text-xs text-[#E2E8F0] italic">
            "InvoiceFlow cut my invoice settlement lag from 18 days down to 48 hours. The public payment link makes paying effortless for my clients."
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span className="font-bold text-white">Maya Ellison</span>
            <span>Founder, Northwind Studio</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form card (Figma node 6:135) */}
      <div className="lg:col-span-7 p-8 sm:p-16 flex items-center justify-center bg-[#F8FAFC]">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="space-y-2">
            <h1 className="font-extrabold text-3xl text-[#0F172A]">
              {isSignUp ? 'Create your account' : 'Sign in to InvoiceFlow'}
            </h1>
            <p className="text-xs text-[#64748B]">
              {isSignUp ? 'Start your 14-day test trial' : 'Access your active billing dashboard'}
            </p>
          </div>

          {/* 1-Click Demo Accounts */}
          <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] space-y-2.5">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider block">
              1-Click Demo Logins:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('pro')}
                className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[11px] font-bold text-[#0F172A] transition-colors"
              >
                Pro User ($12)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('free')}
                className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[11px] font-bold text-[#0F172A] transition-colors"
              >
                Free Tier
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2 px-2.5 rounded-xl bg-[#4F46E5] text-white text-[11px] font-bold hover:bg-[#4338CA] transition-colors"
              >
                Studio Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">Password</label>
                <span className="text-[11px] text-[#4F46E5] cursor-pointer hover:underline">Forgot?</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider shadow-primary transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSignUp ? 'Create Demo Account' : 'Sign In'}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-[#4F46E5] font-bold hover:underline"
            >
              {isSignUp ? 'Already registered? Sign in' : 'Need an account? Start Free'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
