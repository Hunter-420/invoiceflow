import React, { useState } from 'react';
import { FileText, Shield, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';

interface LoginViewProps {
  onNavigate: (tab: string) => void;
  onRoleSwitch: (role: 'pro' | 'admin' | 'free') => void;
  initialSignUp?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigate,
  onRoleSwitch,
  initialSignUp = false,
}) => {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [fullName, setFullName] = useState('Nischal Khanal');
  const [email, setEmail] = useState('nischal@invoiceflow.example');
  const [password, setPassword] = useState('password123');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

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
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">Work Email</label>
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
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(!isForgotOpen)}
                    className="text-[11px] text-[#4F46E5] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
              />
            </div>

            {isForgotOpen && !isSignUp && (
              <div className="p-3.5 rounded-xl bg-slate-100 border border-[#CBD5E1] space-y-2 text-xs">
                {forgotSent ? (
                  <p className="text-[#14532D] font-semibold">
                    Password reset link sent to {email}. Check your inbox.
                  </p>
                ) : (
                  <>
                    <p className="text-[#475569]">
                      Enter your email above to receive a password reset link.
                    </p>
                    <button
                      type="button"
                      onClick={() => setForgotSent(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white font-bold text-[11px]"
                    >
                      Send Reset Instructions
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider shadow-primary transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSignUp ? 'Create Demo Account' : 'Sign In'}</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onRoleSwitch('pro');
                onNavigate('dashboard');
              }}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-bold border border-[#CBD5E1] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
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
