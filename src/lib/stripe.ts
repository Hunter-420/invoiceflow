import { Invoice, PlanType } from './types';
import { calculateSubtotalCents, calculateTaxCents, calculateTotalCents } from './calc';

// Injected securely at build time via GitHub Secret (VITE_STRIPE_RESTRICTED_KEY)
export const STRIPE_RESTRICTED_KEY =
  (import.meta.env?.VITE_STRIPE_RESTRICTED_KEY as string) || '';

export interface CheckoutResult {
  url?: string;
  id?: string;
  error?: string;
}

export interface SessionVerification {
  id: string;
  status: string;
  paymentStatus: string;
  amountTotal: number;
  currency: string;
}

/**
 * Creates a real Stripe Checkout Session for plan upgrades using the restricted key.
 */
export async function createPlanCheckoutSession(
  plan: PlanType,
  isAnnual = false
): Promise<CheckoutResult> {
  if (!STRIPE_RESTRICTED_KEY) {
    return {
      error: 'Stripe test payment integration is not configured.',
    };
  }

  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname.replace(/\/$/, '');

  const amountCents =
    plan === 'pro'
      ? isAnnual
        ? 12000
        : 1200
      : plan === 'studio'
      ? isAnnual
        ? 28800
        : 2900
      : 0;

  if (amountCents === 0) {
    return { error: 'Free tier does not require checkout.' };
  }

  const successUrl = `${currentOrigin}${currentPath}/#billing?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
  const cancelUrl = `${currentOrigin}${currentPath}/#pricing`;

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('line_items[0][price_data][currency]', 'nzd');
  params.append(
    'line_items[0][price_data][product_data][name]',
    `InvoiceFlow ${plan.toUpperCase()} Plan (${isAnnual ? 'Annual' : 'Monthly'})`
  );
  params.append('line_items[0][price_data][unit_amount]', String(amountCents));
  params.append('line_items[0][quantity]', '1');

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_RESTRICTED_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        error: data?.error?.message || 'Failed to initiate Stripe Checkout session.',
      };
    }

    return {
      url: data.url,
      id: data.id,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network error communicating with Stripe.',
    };
  }
}

/**
 * Creates a real Stripe Checkout Session for paying a client invoice.
 */
export async function createInvoiceCheckoutSession(invoice: Invoice): Promise<CheckoutResult> {
  if (!STRIPE_RESTRICTED_KEY) {
    return {
      error: 'Stripe test payment integration is not configured.',
    };
  }

  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname.replace(/\/$/, '');

  const subtotal = calculateSubtotalCents(invoice.items);
  const tax = calculateTaxCents(subtotal, invoice.taxPercent);
  const total = calculateTotalCents(subtotal, tax);

  const successUrl = `${currentOrigin}${currentPath}/#pay/${invoice.id}?session_id={CHECKOUT_SESSION_ID}&paid=true`;
  const cancelUrl = `${currentOrigin}${currentPath}/#pay/${invoice.id}`;

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('line_items[0][price_data][currency]', 'nzd');
  params.append(
    'line_items[0][price_data][product_data][name]',
    `Invoice ${invoice.number} - ${invoice.clientCompany || invoice.clientName}`
  );
  params.append('line_items[0][price_data][unit_amount]', String(total));
  params.append('line_items[0][quantity]', '1');

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_RESTRICTED_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        error: data?.error?.message || 'Failed to create invoice checkout session.',
      };
    }

    return {
      url: data.url,
      id: data.id,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network error communicating with Stripe.',
    };
  }
}

/**
 * Retrieves and verifies checkout session status from Stripe.
 */
export async function retrieveCheckoutSession(
  sessionId: string
): Promise<SessionVerification | null> {
  if (!STRIPE_RESTRICTED_KEY) return null;

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${STRIPE_RESTRICTED_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      paymentStatus: data.payment_status,
      amountTotal: data.amount_total,
      currency: data.currency,
    };
  } catch {
    return null;
  }
}
