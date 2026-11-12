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
  const [email, setEmail] = useState('you@studio.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
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
      {/* Left Column: Form Card (PDF Page 4) */}
      <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex items-center justify-center bg-white order-2 lg:order-1">
        <div className="max-w-md w-full space-y-7">
          <div className="space-y-2">
            <h1 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {isSignUp
                ? 'Start invoicing and getting paid in minutes.'
                : 'Log in to see what your clients owe you.'}
            </p>
          </div>

          {/* 1-Click Demo Accounts */}
          <div className="p-3.5 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] space-y-2">
            <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider block">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#475569]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-[#4F46E5] focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(!isForgotOpen)}
                  className="text-[#4F46E5] font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

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
              className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider shadow-primary transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isSignUp ? 'Create an account' : 'Log in'}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E2E8F0]" />
              <span className="flex-shrink mx-4 text-xs text-[#94A3B8]">or</span>
              <div className="flex-grow border-t border-[#E2E8F0]" />
            </div>

            <button
              type="button"
              onClick={() => {
                onRoleSwitch('pro');
                onNavigate('dashboard');
              }}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-bold border border-[#CBD5E1] transition-colors flex items-center justify-center gap-2.5"
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

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-[#4F46E5] font-semibold hover:underline"
            >
              {isSignUp
                ? 'Already have an account? Log in'
                : 'New to InvoiceFlow? Create an account'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Branded Visual Showcase (PDF Page 4) */}
      <div className="lg:col-span-6 bg-[#0F172A] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center relative overflow-hidden order-1 lg:order-2">
        <div className="max-w-md w-full space-y-8">
          {/* Testimonial Quote Card (PDF Page 4) */}
          <div className="p-8 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-5 shadow-xl">
            <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
              "I used to chase payments for weeks. Now clients pay the same day they open the invoice."
            </p>
            <div>
              <span className="font-bold text-sm text-white block">Maya Ellison</span>
              <span className="text-xs text-[#94A3B8]">Brand designer, Wellington</span>
            </div>
          </div>

          {/* Floating Payment Received Card (PDF Page 4) */}
          <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#DDF3E4] text-[#14532D] flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Payment received</span>
                <span className="text-[11px] text-[#94A3B8]">Northwind Studio paid INV-0148</span>
              </div>
            </div>
            <span className="font-extrabold text-base text-[#4ADE80] tabular-nums">
              +$2,400
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
