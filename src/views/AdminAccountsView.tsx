import React from 'react';
import { Shield, Users, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Profile } from '../lib/types';

interface AdminAccountsViewProps {
  onNavigate: (tab: string) => void;
  profile: Profile;
}

export const AdminAccountsView: React.FC<AdminAccountsViewProps> = ({ onNavigate, profile }) => {
  // Access control check: Only admin role can view
  if (profile.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="size-16 rounded-2xl bg-[#FEE2E2] text-[#7F1D1D] flex items-center justify-center mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="font-extrabold text-2xl text-[#0F172A]">
          404 - Page Not Found
        </h1>
        <p className="text-xs text-[#64748B]">
          The requested administrative resource is not accessible to standard accounts.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold"
        >
          <ArrowLeft className="size-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  const accounts = InvoiceFlowStore.getAdminAccounts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
          Super Admin Console
        </span>
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A] mt-1">
          Subscriber Accounts & MRR
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          System-wide active tenant subscriptions and monthly recurring revenue ledger
        </p>
      </div>

      {/* 4 Stat Tiles (Spec Section 4.4 & Mockup) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Total Accounts
          </span>
          <span className="font-extrabold text-3xl text-[#0F172A] tabular-nums block">
            128
          </span>
          <span className="text-[11px] text-[#4F6B3A] font-semibold">+14 this week</span>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Pro Subscribers ($12)
          </span>
          <span className="font-extrabold text-3xl text-[#4F46E5] tabular-nums block">
            41
          </span>
          <span className="text-[11px] text-[#64748B]">$492 / mo</span>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Studio Subscribers ($29)
          </span>
          <span className="font-extrabold text-3xl text-[#4F46E5] tabular-nums block">
            9
          </span>
          <span className="text-[11px] text-[#64748B]">$261 / mo</span>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Monthly Recurring Revenue (MRR)
          </span>
          <span className="font-extrabold text-3xl text-[#14532D] tabular-nums block">
            $785.00
          </span>
          <span className="text-[11px] text-[#4F6B3A] font-semibold">Active ARR: $9,420</span>
        </div>
      </div>

      {/* Admin Accounts Table (Figma spec-only & HTML mockup) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <h2 className="font-extrabold text-lg text-[#0F172A]">
          Tenant Accounts Directory
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Plan Tier</th>
                <th className="pb-3">Stripe Status</th>
                <th className="pb-3 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-bold text-[#0F172A]">{acc.name}</td>
                  <td className="py-3.5 text-[#64748B]">{acc.email}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        acc.plan === 'studio'
                          ? 'bg-[#EEF2FF] text-[#4F46E5]'
                          : acc.plan === 'pro'
                          ? 'bg-[#DDF3E4] text-[#14532D]'
                          : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      {acc.plan}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        acc.status === 'active'
                          ? 'bg-[#DDF3E4] text-[#14532D]'
                          : acc.status === 'past_due'
                          ? 'bg-[#FEF3C7] text-[#78350F]'
                          : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-[#64748B]">{acc.joinedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
