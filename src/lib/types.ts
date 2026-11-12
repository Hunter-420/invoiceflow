export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'pro' | 'studio';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyName: string;
  defaultTaxPercent: number;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  deletedAt?: string | null;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  number: string; // e.g. "INV-0153"
  status: InvoiceStatus;
  issueDate: string; // "YYYY-MM-DD"
  dueDate: string; // "YYYY-MM-DD"
  taxPercent: number; // e.g. 15.0
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Subscription {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  plan: PlanType;
  status: 'active' | 'none' | 'past_due' | 'canceled';
  currentPeriodEnd?: string;
  updatedAt: string;
}

export interface PlanLimits {
  maxClients: number; // e.g. 3 for free, Infinity for pro
  maxInvoicesPerMonth: number; // e.g. 5 for free, Infinity for pro
  name: string;
  priceMonthly: number;
  priceAnnualMonthly: number; // discounted rate
}

export const PLAN_CONFIGS: Record<PlanType, PlanLimits> = {
  free: {
    maxClients: 3,
    maxInvoicesPerMonth: 5,
    name: 'Free Starter',
    priceMonthly: 0,
    priceAnnualMonthly: 0,
  },
  pro: {
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    name: 'Pro Freelancer',
    priceMonthly: 12,
    priceAnnualMonthly: 10,
  },
  studio: {
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    name: 'Studio MVP',
    priceMonthly: 29,
    priceAnnualMonthly: 24,
  },
};
