import React from 'react';
import { Home } from 'lucide-react';

interface NotFoundViewProps {
  onNavigate: (tab: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <span className="font-extrabold text-5xl text-[#4F46E5] tabular-nums">
        404
      </span>
      <h1 className="font-extrabold text-2xl text-[#0F172A]">
        Invoice Screen Not Found
      </h1>
      <p className="text-xs text-[#64748B]">
        The invoice, client, or setting you requested does not exist.
      </p>
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4F46E5] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#4338CA] transition-colors"
      >
        <Home className="size-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};
