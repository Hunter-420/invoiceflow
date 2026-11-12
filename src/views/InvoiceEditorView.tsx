import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ArrowLeft, Check, AlertCircle, FileText } from 'lucide-react';
import { InvoiceFlowStore } from '../lib/store';
import { Invoice, InvoiceItem, Client } from '../lib/types';
import { formatCurrency, calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from '../lib/calc';

interface InvoiceEditorViewProps {
  onNavigate: (tab: string) => void;
  onSaveSuccess: (inv: Invoice) => void;
}

export const InvoiceEditorView: React.FC<InvoiceEditorViewProps> = ({
  onNavigate,
  onSaveSuccess,
}) => {
  const clients = InvoiceFlowStore.getClients();
  const profile = InvoiceFlowStore.getProfile();
  const subscription = InvoiceFlowStore.getSubscription();

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Default due date Net 14
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [taxPercent, setTaxPercent] = useState<number>(profile.defaultTaxPercent || 15);
  const [notes, setNotes] = useState<string>('Net 14 payment terms. Thank you for your partnership.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'item-1', description: 'Design Sprint & Concept Wireframes', quantity: 1, unitPriceCents: 180000 },
    { id: 'item-2', description: 'Revisions & Component Specs', quantity: 2, unitPriceCents: 20000 },
  ]);

  // Live calculations
  const subtotalCents = useMemo(() => calculateSubtotalCents(items), [items]);
  const taxCents = useMemo(() => calculateTaxCents(subtotalCents, taxPercent), [subtotalCents, taxPercent]);
  const totalCents = useMemo(() => calculateTotalCents(subtotalCents, taxCents), [subtotalCents, taxCents]);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPriceCents: 10000,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((i) => {
        if (i.id !== id) return i;
        if (field === 'quantity') {
          return { ...i, quantity: Math.max(1, parseFloat(value) || 1) };
        }
        if (field === 'unitPriceCents') {
          return { ...i, unitPriceCents: Math.max(0, Math.round((parseFloat(value) || 0) * 100)) };
        }
        return { ...i, [field]: value };
      })
    );
  };

  const handleSave = (status: Invoice['status']) => {
    setErrorMsg(null);
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) {
      setErrorMsg('Please select or create a client first.');
      return;
    }

    if (items.some((i) => !i.description.trim())) {
      setErrorMsg('Please enter a description for all line items.');
      return;
    }

    const nextInvoiceNumber = `INV-${Math.floor(100 + Math.random() * 900)}`;

    const res = InvoiceFlowStore.createInvoice({
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      clientEmail: client.email,
      number: nextInvoiceNumber,
      status,
      issueDate,
      dueDate,
      taxPercent,
      notes,
      items,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create invoice.');
      return;
    }

    onSaveSuccess(res.invoice!);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('invoices')}
            className="size-9 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 flex items-center justify-center text-[#0F172A]"
            aria-label="Back to Invoices list"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Invoice Editor
            </span>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
              Create New Invoice
            </h1>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] text-[#7F1D1D] text-xs font-bold border border-[#FCA5A5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {errorMsg.includes('upgrade') && (
            <button
              onClick={() => onNavigate('pricing')}
              className="underline font-bold text-xs"
            >
              Upgrade Now
            </button>
          )}
        </div>
      )}

      {/* Editor Split Layout (Spec Section 4.4: 2/3 left, 1/3 right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 2/3: Form card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Client Select */}
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">
                Select Client
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-semibold text-[#0F172A]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-[#0F172A]">
                Line Items
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0F172A] transition-colors"
              >
                <Plus className="size-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold">
                    <th className="pb-2 w-1/2">Description</th>
                    <th className="pb-2 w-20">Qty</th>
                    <th className="pb-2 w-28">Unit Price</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Frontend Development Sprint"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-full px-2 py-2 rounded-lg border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={(item.unitPriceCents / 100).toFixed(0)}
                          onChange={(e) => handleItemChange(item.id, 'unitPriceCents', e.target.value)}
                          className="w-full px-2 py-2 rounded-lg border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
                        />
                      </td>
                      <td className="py-2.5 font-bold text-right text-[#0F172A]">
                        {formatCurrency(Math.round(item.quantity * item.unitPriceCents))}
                      </td>
                      <td className="py-2.5 text-right pl-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                          className="p-1 rounded text-red-500 hover:bg-red-50 disabled:opacity-30"
                          aria-label="Remove line item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax % and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0]">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">
                Tax Percentage (% GST / VAT)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-32 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs font-bold tabular-nums text-[#0F172A]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A] uppercase">
                Payment Terms & Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 text-xs text-[#0F172A]"
              />
            </div>
          </div>
        </div>

        {/* Right 1/3: Summary card (Spec Section 4.4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <h2 className="font-extrabold text-xl text-[#0F172A] border-b border-[#E2E8F0] pb-4">
            Invoice Summary
          </h2>

          <div className="space-y-3 text-xs tabular-nums">
            <div className="flex justify-between text-[#64748B]">
              <span>Subtotal:</span>
              <span className="font-bold text-[#0F172A]">{formatCurrency(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Tax ({taxPercent}%):</span>
              <span className="font-bold text-[#0F172A]">{formatCurrency(taxCents)}</span>
            </div>
            <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-baseline">
              <span className="font-extrabold text-sm text-[#0F172A]">Total Amount:</span>
              <span className="font-extrabold text-2xl text-[#4F46E5]">{formatCurrency(totalCents)}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => handleSave('sent')}
              className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider shadow-primary transition-colors flex items-center justify-center gap-2"
            >
              <span>Mark as Sent</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="w-full py-3 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-[#0F172A] transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('paid')}
              className="w-full py-3 rounded-xl bg-[#DDF3E4] hover:bg-[#BBF7D0] text-[#14532D] text-xs font-bold transition-colors"
            >
              Mark as Settled / Paid
            </button>
          </div>

          <p className="text-[11px] text-[#64748B] text-center">
            {subscription.plan === 'free'
              ? 'Free tier: 5 invoices / month limit.'
              : 'Pro plan: Unlimited invoices enabled.'}
          </p>
        </div>
      </div>
    </div>
  );
};
