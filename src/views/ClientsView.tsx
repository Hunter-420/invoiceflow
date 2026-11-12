import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Users, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Client } from '../lib/types';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';

interface ClientsViewProps {
  onNavigate: (tab: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onNavigate }) => {
  const [clients, setClients] = useState<Client[]>(() => InvoiceFlowStore.getClients());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<Client | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // New client form fields
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const invoices = InvoiceFlowStore.getInvoices();
  const subscription = InvoiceFlowStore.getSubscription();

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [clients, searchQuery]);

  const handleOpenAddModal = () => {
    const limitCheck = InvoiceFlowStore.canCreateClient();
    if (!limitCheck.allowed) {
      setLimitNotice(limitCheck.reason || 'Client limit reached for your plan.');
      return;
    }
    setLimitNotice(null);
    setShowAddModal(true);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const res = InvoiceFlowStore.createClient({
      name: newName,
      company: newCompany,
      email: newEmail,
      phone: newPhone,
    });

    if (res.success) {
      setClients(InvoiceFlowStore.getClients());
      setShowAddModal(false);
      setNewName('');
      setNewCompany('');
      setNewEmail('');
      setNewPhone('');
    } else {
      setLimitNotice(res.error || 'Failed to add client.');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmClient) return;
    InvoiceFlowStore.softDeleteClient(deleteConfirmClient.id);
    setClients(InvoiceFlowStore.getClients());
    setDeleteConfirmClient(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
            Directory
          </span>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[#0F172A] mt-1">
            Clients
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage your client accounts, billing information, and historical invoices
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-primary transition-colors self-start sm:self-center"
        >
          <Plus className="size-4" />
          <span>New Client</span>
        </button>
      </div>

      {limitNotice && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] text-[#7F1D1D] text-xs font-bold border border-[#FCA5A5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{limitNotice}</span>
          </div>
          <button
            onClick={() => onNavigate('pricing')}
            className="underline font-bold text-xs"
          >
            Upgrade to Pro ($12)
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="size-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, or email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
          />
        </div>

        <div className="text-xs text-[#64748B] tabular-nums font-semibold">
          {clients.length} / {subscription.plan === 'free' ? '3 Max' : 'Unlimited'} Clients
        </div>
      </div>

      {/* Clients Table (Spec Section 4.4) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                <th className="pb-3">Client</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Email</th>
                <th className="pb-3 text-center">Open Invoices</th>
                <th className="pb-3 text-right">Total Billed</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {filteredClients.map((client) => {
                const clientInvoices = invoices.filter((i) => i.clientId === client.id);
                const openInvoicesCount = clientInvoices.filter(
                  (i) => i.status === 'sent' || i.status === 'overdue'
                ).length;

                const totalBilledCents = clientInvoices.reduce((acc, inv) => {
                  const sub = calculateSubtotalCents(inv.items);
                  const tax = calculateTaxCents(sub, inv.taxPercent);
                  return acc + calculateTotalCents(sub, tax);
                }, 0);

                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold text-[#0F172A]">{client.name}</td>
                    <td className="py-4 font-semibold text-[#475569]">{client.company || '-'}</td>
                    <td className="py-4 text-[#64748B]">{client.email}</td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          openInvoicesCount > 0 ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-slate-100 text-[#64748B]'
                        }`}
                      >
                        {openInvoicesCount} open
                      </span>
                    </td>
                    <td className="py-4 text-right font-extrabold text-[#0F172A]">
                      {formatCurrency(totalBilledCents)}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setDeleteConfirmClient(client)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        aria-label={`Delete client ${client.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredClients.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <Users className="size-10 text-[#CBD5E1] mx-auto" />
              <p className="font-bold text-sm text-[#0F172A]">No clients registered yet</p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold"
              >
                Add Your First Client
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Add New Client"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-[#E2E8F0] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-extrabold text-xl text-[#0F172A]">Add New Client</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Maya Ellison"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">Company Name</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Northwind Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="maya@northwind.example"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase">Phone</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal (AlertDialog) */}
      {deleteConfirmClient && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-[#E2E8F0] shadow-2xl">
            <h3 className="font-extrabold text-xl text-[#0F172A]">Delete Client?</h3>
            <p className="text-xs text-[#64748B]">
              Are you sure you want to delete <span className="font-bold text-[#0F172A]">{deleteConfirmClient.name}</span>? Existing invoices will be preserved in historical records.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setDeleteConfirmClient(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold"
              >
                Keep Client
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#BE123C]"
              >
                Yes, Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
