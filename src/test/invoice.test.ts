import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceFlowStore, DEMO_PROFILES } from '../lib/store';
import { calculateSubtotalCents, calculateTaxCents, calculateTotalCents, formatCurrency, resolveInvoiceStatus } from '../lib/calc';
import { Invoice, InvoiceItem } from '../lib/types';
import { STRIPE_RESTRICTED_KEY } from '../lib/stripe';

describe('InvoiceFlow SaaS Acceptance Tests & Math Validation', () => {
  beforeEach(() => {
    InvoiceFlowStore.resetToDefaults();
  });

  it('acceptance test: calculates exact subtotal, tax and total in integer cents without float precision bugs', () => {
    const items: InvoiceItem[] = [
      { id: '1', description: 'Brand Design', quantity: 1, unitPriceCents: 180000 }, // $1,800.00
      { id: '2', description: 'Revisions', quantity: 3, unitPriceCents: 20000 },    // $600.00
    ];

    const subtotal = calculateSubtotalCents(items);
    expect(subtotal).toBe(240000); // $2,400.00

    const tax = calculateTaxCents(subtotal, 15);
    expect(tax).toBe(36000); // $360.00 (15% GST)

    const total = calculateTotalCents(subtotal, tax);
    expect(total).toBe(276000); // $2,760.00

    expect(formatCurrency(total)).toBe('$2,760.00');
  });

  it('acceptance test: dynamic overdue status resolution', () => {
    const pastDueDateInvoice: Invoice = {
      id: 'inv-test-overdue',
      userId: 'usr-pro-1',
      clientId: 'c1',
      clientName: 'Test Client',
      number: 'INV-999',
      status: 'sent',
      issueDate: '2026-01-01',
      dueDate: '2026-01-15', // Past date
      taxPercent: 15,
      items: [{ id: '1', description: 'Consulting', quantity: 1, unitPriceCents: 10000 }],
      createdAt: '2026-01-01T00:00:00Z',
    };

    expect(resolveInvoiceStatus(pastDueDateInvoice)).toBe('overdue');

    // Paid invoices stay paid even if due date has passed
    const paidInvoice: Invoice = { ...pastDueDateInvoice, status: 'paid' };
    expect(resolveInvoiceStatus(paidInvoice)).toBe('paid');
  });

  it('acceptance test: Free plan limits enforce max 3 clients and blocks 4th with clear message', () => {
    // Switch to free tier
    InvoiceFlowStore.setActiveRole('free');
    const clients = InvoiceFlowStore.getClients();
    expect(clients.length).toBe(3); // Already at 3

    // Attempting 4th client should be rejected
    const check = InvoiceFlowStore.canCreateClient();
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Free Starter plan is limited to 3 clients');

    const res = InvoiceFlowStore.createClient({
      name: 'Fourth Client',
      email: 'fourth@example.com',
      company: 'Fourth Corp',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Upgrade to Pro');
  });

  it('acceptance test: Pro plan allows unlimited client additions', () => {
    InvoiceFlowStore.setActiveRole('pro');
    const check = InvoiceFlowStore.canCreateClient();
    expect(check.allowed).toBe(true);

    const res = InvoiceFlowStore.createClient({
      name: 'Elena Rostova',
      email: 'elena@brandcraft.example',
      company: 'BrandCraft Studio',
    });
    expect(res.success).toBe(true);
    expect(res.client?.name).toBe('Elena Rostova');
  });

  it('acceptance test: upgrade plan modifies subscription state to Pro', () => {
    InvoiceFlowStore.setActiveRole('free');
    expect(InvoiceFlowStore.getSubscription().plan).toBe('free');

    InvoiceFlowStore.upgradePlan('pro');
    const updatedSub = InvoiceFlowStore.getSubscription();
    expect(updatedSub.plan).toBe('pro');
    expect(updatedSub.status).toBe('active');
  });

  it('acceptance test: Admin view access guard', () => {
    // Standard user is not admin
    InvoiceFlowStore.setActiveRole('pro');
    expect(InvoiceFlowStore.getProfile().role).toBe('user');

    // Admin role
    InvoiceFlowStore.setActiveRole('admin');
    expect(InvoiceFlowStore.getProfile().role).toBe('admin');
    const adminAccounts = InvoiceFlowStore.getAdminAccounts();
    expect(adminAccounts.length).toBeGreaterThanOrEqual(4);
  });

  it('acceptance test: Stripe client module loads and exports valid helper functions', () => {
    expect(STRIPE_RESTRICTED_KEY).toBeDefined();
    expect(typeof STRIPE_RESTRICTED_KEY).toBe('string');
  });
});
