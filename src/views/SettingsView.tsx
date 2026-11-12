import React, { useState } from 'react';
import { Save, Check, Shield } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Profile } from '../lib/types';

interface SettingsViewProps {
  profile: Profile;
  onProfileUpdate: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onProfileUpdate }) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [taxPercent, setTaxPercent] = useState(profile.defaultTaxPercent);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    InvoiceFlowStore.saveProfile({
      ...profile,
      fullName,
      email,
      companyName,
      defaultTaxPercent: taxPercent,
    });
    onProfileUpdate();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="border-b border-[#E2E8F0] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
          Preferences
        </span>
        <h1 className="font-extrabold text-3xl text-[#0F172A] mt-1">
          Studio & Tax Settings
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Configure default business details and tax calculation percentages
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[#DDF3E4] text-[#14532D] text-xs font-bold border border-[#BBF7D0] flex items-center gap-2">
          <Check className="size-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-5">
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

        <div className="space-y-1">
          <label className="block text-xs font-bold text-[#0F172A] uppercase">Account Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-[#0F172A] uppercase">Business / Studio Name</label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-[#0F172A] uppercase">Default Tax Rate (% GST / VAT)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            className="w-32 px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-bold tabular-nums text-[#0F172A]"
          />
        </div>

        <div className="pt-4 border-t border-[#E2E8F0]">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
