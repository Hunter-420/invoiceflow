import React from 'react';
import { FileText, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto">
      {/* Demo Notice Banner */}
      <div className="bg-[#EEF2FF] border-b border-[#C7D2FE] py-2 px-4 text-center">
        <p className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
          Demo project: concept SaaS invoicing tool for freelancers and agencies
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">
                <FileText className="size-4" />
              </div>
              <span className="font-extrabold text-lg text-[#0F172A]">
                InvoiceFlow
              </span>
            </div>
            <p className="text-xs text-[#64748B] text-pretty leading-relaxed">
              Automated invoice tracking, client relationship management, and instant Stripe-powered payments for modern freelancers.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Application
            </h4>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              {['dashboard', 'invoices', 'clients', 'billing'].map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => onNavigate(tab)}
                    className="hover:text-[#4F46E5] transition-colors capitalize"
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              SaaS Packages
            </h4>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#4F46E5]">
                  Free Starter (3 clients)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#4F46E5]">
                  Pro Freelancer ($12/mo)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#4F46E5]">
                  Studio MVP ($29/mo)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Architecture
            </h4>
            <p className="text-xs text-[#64748B] text-pretty leading-relaxed">
              Proves Premium Package deliverables: Authentication, Database CRUD, Subscription Billing, Admin Accounts, and PDF Invoicing.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p className="tabular-nums">&copy; 2026 InvoiceFlow MVP. Concept demonstration.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Security Protocol</span>
            <span className="hover:underline cursor-pointer">Stripe Test Terms</span>
            <span className="hover:underline cursor-pointer">API Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
