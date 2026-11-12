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

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs">
              I
            </div>
            <p className="tabular-nums font-medium text-[#0F172A]">
              © 2026 InvoiceFlow · Demo project
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-[#0F172A] transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="hover:text-[#0F172A] transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-[#0F172A] transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
