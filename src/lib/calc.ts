import { Invoice, InvoiceItem } from './types';

/**
 * Calculates subtotal in cents from line items.
 */
export function calculateSubtotalCents(items: InvoiceItem[]): number {
  return items.reduce((acc, item) => {
    return acc + Math.round(item.quantity * item.unitPriceCents);
  }, 0);
}

/**
 * Calculates tax in cents based on subtotal and tax percentage.
 */
export function calculateTaxCents(subtotalCents: number, taxPercent: number): number {
  return Math.round((subtotalCents * taxPercent) / 100);
}

/**
 * Calculates grand total in cents.
 */
export function calculateTotalCents(subtotalCents: number, taxCents: number): number {
  return subtotalCents + taxCents;
}

/**
 * Formats an amount in integer cents into standard localized currency string: "$1,800.00"
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Computes overdue status dynamically:
 * If due_date < today and status is 'sent', invoice is considered overdue.
 */
export function resolveInvoiceStatus(invoice: Invoice): Invoice['status'] {
  if (invoice.status === 'paid' || invoice.status === 'draft') {
    return invoice.status;
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  if (invoice.dueDate < todayStr && invoice.status === 'sent') {
    return 'overdue';
  }
  return invoice.status;
}
