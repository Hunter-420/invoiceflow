import { Profile, Client, Invoice, Subscription, PlanType, PLAN_CONFIGS } from './types';
import { calculateSubtotalCents, calculateTaxCents, calculateTotalCents, resolveInvoiceStatus } from './calc';

const STORAGE_KEYS = {
  PROFILE: 'if_profile_v1',
  CLIENTS: 'if_clients_v1',
  INVOICES: 'if_invoices_v1',
  SUBSCRIPTION: 'if_subscription_v1',
  ACCOUNTS_ADMIN: 'if_accounts_admin_v1',
  CURRENT_ROLE: 'if_current_role_v1',
};

export const DEMO_PROFILES: Record<string, { profile: Profile; subscription: Subscription }> = {
  pro: {
    profile: {
      id: 'usr-pro-1',
      fullName: 'Nischal Khanal',
      email: 'nischal@invoiceflow.example',
      role: 'user',
      companyName: 'Khanal Design & Code',
      defaultTaxPercent: 15,
    },
    subscription: {
      userId: 'usr-pro-1',
      stripeCustomerId: 'cus_test_pro_1',
      stripeSubscriptionId: 'sub_test_pro_1',
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: '2026-12-15T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  },
  admin: {
    profile: {
      id: 'usr-admin-1',
      fullName: 'Nischal Khanal (Admin)',
      email: 'admin@invoiceflow.example',
      role: 'admin',
      companyName: 'InvoiceFlow Core Systems',
      defaultTaxPercent: 15,
    },
    subscription: {
      userId: 'usr-admin-1',
      stripeCustomerId: 'cus_test_studio_admin',
      stripeSubscriptionId: 'sub_test_studio_admin',
      plan: 'studio',
      status: 'active',
      currentPeriodEnd: '2026-12-31T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  },
  free: {
    profile: {
      id: 'usr-free-1',
      fullName: 'Alex Vance',
      email: 'alex@starterfreelance.example',
      role: 'user',
      companyName: 'Alex Creative Studio',
      defaultTaxPercent: 15,
    },
    subscription: {
      userId: 'usr-free-1',
      stripeCustomerId: 'cus_test_free_1',
      plan: 'free',
      status: 'none',
      updatedAt: new Date().toISOString(),
    },
  },
};

const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'cli-northwind',
    userId: 'usr-pro-1',
    name: 'Maya Ellison',
    company: 'Northwind Studio',
    email: 'maya@northwind.example',
    phone: '+1 (555) 234-5678',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'cli-bloom',
    userId: 'usr-pro-1',
    name: 'Jo Bloom',
    company: 'Bloom & Co.',
    email: 'jo@bloom.example',
    phone: '+1 (555) 345-6789',
    createdAt: '2026-10-15T14:30:00Z',
  },
  {
    id: 'cli-atlas',
    userId: 'usr-pro-1',
    name: 'Sam Atlas',
    company: 'Atlas Labs',
    email: 'sam@atlas.example',
    phone: '+1 (555) 987-6543',
    createdAt: '2026-11-01T09:15:00Z',
  },
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-0153',
    userId: 'usr-pro-1',
    clientId: 'cli-northwind',
    clientName: 'Maya Ellison',
    clientCompany: 'Northwind Studio',
    clientEmail: 'maya@northwind.example',
    number: 'INV-0153',
    status: 'sent',
    issueDate: '2026-11-08',
    dueDate: '2026-11-22',
    taxPercent: 15,
    notes: 'Net 14 payment terms. Thank you for your business.',
    items: [
      { id: 'item-1', description: 'Brand Identity Design Sprint & Guidelines', quantity: 1, unitPriceCents: 180000 },
      { id: 'item-2', description: 'Collateral Revisions & Icon Asset Set', quantity: 3, unitPriceCents: 20000 },
    ],
    createdAt: '2026-11-08T10:00:00Z',
  },
  {
    id: 'inv-0152',
    userId: 'usr-pro-1',
    clientId: 'cli-bloom',
    clientName: 'Jo Bloom',
    clientCompany: 'Bloom & Co.',
    clientEmail: 'jo@bloom.example',
    number: 'INV-0152',
    status: 'paid',
    issueDate: '2026-11-02',
    dueDate: '2026-11-16',
    taxPercent: 15,
    notes: 'Paid via Stripe card checkout.',
    items: [
      { id: 'item-3', description: 'Custom Shopify Component Development', quantity: 1, unitPriceCents: 149565 },
    ],
    createdAt: '2026-11-02T11:00:00Z',
  },
  {
    id: 'inv-0151',
    userId: 'usr-pro-1',
    clientId: 'cli-atlas',
    clientName: 'Sam Atlas',
    clientCompany: 'Atlas Labs',
    clientEmail: 'sam@atlas.example',
    number: 'INV-0151',
    status: 'paid',
    issueDate: '2026-10-20',
    dueDate: '2026-11-03',
    taxPercent: 15,
    notes: 'Milestone 2 acceptance.',
    items: [
      { id: 'item-4', description: 'SaaS MVP Infrastructure & Database Setup', quantity: 1, unitPriceCents: 547826 },
    ],
    createdAt: '2026-10-20T08:30:00Z',
  },
  {
    id: 'inv-0150',
    userId: 'usr-pro-1',
    clientId: 'cli-northwind',
    clientName: 'Maya Ellison',
    clientCompany: 'Northwind Studio',
    clientEmail: 'maya@northwind.example',
    number: 'INV-0150',
    status: 'overdue',
    issueDate: '2026-10-10',
    dueDate: '2026-10-24', // Past today -> overdue
    taxPercent: 15,
    notes: 'Please settle invoice balance.',
    items: [
      { id: 'item-5', description: 'Initial Discovery Workshop & Strategy Brief', quantity: 1, unitPriceCents: 177391 },
    ],
    createdAt: '2026-10-10T09:00:00Z',
  },
];

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  status: 'active' | 'none' | 'past_due' | 'canceled';
  joinedDate: string;
}

const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
  { id: 'acc-1', name: 'Nischal Khanal', email: 'nischal@khanal.co.nz', plan: 'pro', status: 'active', joinedDate: '11 Nov 2026' },
  { id: 'acc-2', name: 'Amy Lin', email: 'amy.lin@design.example', plan: 'free', status: 'none', joinedDate: '09 Nov 2026' },
  { id: 'acc-3', name: 'Dev Patel', email: 'dev@patelagency.example', plan: 'studio', status: 'past_due', joinedDate: '02 Nov 2026' },
  { id: 'acc-4', name: 'Sarah Jenkins', email: 'sarah@jenkinscopy.example', plan: 'pro', status: 'active', joinedDate: '24 Oct 2026' },
  { id: 'acc-5', name: 'Marcus Vance', email: 'marcus@vancestudio.example', plan: 'studio', status: 'active', joinedDate: '15 Oct 2026' },
  { id: 'acc-6', name: 'Elena Rostova', email: 'elena@brandcraft.example', plan: 'free', status: 'none', joinedDate: '12 Oct 2026' },
];

export class InvoiceFlowStore {
  private static memoryStore: Record<string, string> = {};

  private static load<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const data = window.localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      }
      const mem = this.memoryStore[key];
      return mem ? JSON.parse(mem) : fallback;
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.memoryStore[key] = serialized;
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(key, serialized);
      }
    } catch {
      // In-memory fallback
    }
  }

  static getActiveRole(): 'pro' | 'admin' | 'free' {
    return this.load(STORAGE_KEYS.CURRENT_ROLE, 'pro');
  }

  static setActiveRole(role: 'pro' | 'admin' | 'free'): void {
    this.save(STORAGE_KEYS.CURRENT_ROLE, role);
    const demo = DEMO_PROFILES[role];
    this.saveProfile(demo.profile);
    this.saveSubscription(demo.subscription);
  }

  static getProfile(): Profile {
    const role = this.getActiveRole();
    return this.load(STORAGE_KEYS.PROFILE, DEMO_PROFILES[role].profile);
  }

  static saveProfile(profile: Profile): void {
    this.save(STORAGE_KEYS.PROFILE, profile);
  }

  static getSubscription(): Subscription {
    const role = this.getActiveRole();
    return this.load(STORAGE_KEYS.SUBSCRIPTION, DEMO_PROFILES[role].subscription);
  }

  static saveSubscription(sub: Subscription): void {
    this.save(STORAGE_KEYS.SUBSCRIPTION, sub);
  }

  static getClients(): Client[] {
    const clients = this.load(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    return clients.filter((c) => !c.deletedAt);
  }

  static saveClients(clients: Client[]): void {
    this.save(STORAGE_KEYS.CLIENTS, clients);
  }

  static getInvoices(): Invoice[] {
    const invoices: Invoice[] = this.load(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    return invoices.map((inv) => ({
      ...inv,
      status: resolveInvoiceStatus(inv),
    }));
  }

  static saveInvoices(invoices: Invoice[]): void {
    this.save(STORAGE_KEYS.INVOICES, invoices);
  }

  static getAdminAccounts(): AdminAccount[] {
    return this.load(STORAGE_KEYS.ACCOUNTS_ADMIN, DEFAULT_ADMIN_ACCOUNTS);
  }

  /**
   * Enforces Free Plan limits:
   * Max 3 active clients.
   */
  static canCreateClient(): { allowed: boolean; reason?: string } {
    const sub = this.getSubscription();
    const limits = PLAN_CONFIGS[sub.plan];
    const clients = this.getClients();

    if (clients.length >= limits.maxClients) {
      return {
        allowed: false,
        reason: `Your ${limits.name} plan is limited to ${limits.maxClients} clients. Upgrade to Pro for unlimited clients.`,
      };
    }
    return { allowed: true };
  }

  /**
   * Enforces Free Plan limits:
   * Max 5 invoices per calendar month.
   */
  static canCreateInvoice(): { allowed: boolean; reason?: string } {
    const sub = this.getSubscription();
    const limits = PLAN_CONFIGS[sub.plan];
    const invoices = this.getInvoices();

    // Check count for current month
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const thisMonthCount = invoices.filter((inv) => inv.issueDate.startsWith(currentMonthPrefix)).length;

    if (thisMonthCount >= limits.maxInvoicesPerMonth) {
      return {
        allowed: false,
        reason: `Your ${limits.name} plan is limited to ${limits.maxInvoicesPerMonth} invoices per month. Upgrade to Pro for unlimited invoices.`,
      };
    }
    return { allowed: true };
  }

  static createClient(data: { name: string; email: string; company: string; phone?: string }): { success: boolean; client?: Client; error?: string } {
    const limitCheck = this.canCreateClient();
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.reason };
    }

    const currentClients = this.load<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    const profile = this.getProfile();
    const newClient: Client = {
      id: `cli-${Date.now().toString(36)}`,
      userId: profile.id,
      name: data.name,
      email: data.email,
      company: data.company,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };

    currentClients.unshift(newClient);
    this.save(STORAGE_KEYS.CLIENTS, currentClients);
    return { success: true, client: newClient };
  }

  static softDeleteClient(clientId: string): { success: boolean } {
    const currentClients = this.load<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    const updated = currentClients.map((c) =>
      c.id === clientId ? { ...c, deletedAt: new Date().toISOString() } : c
    );
    this.save(STORAGE_KEYS.CLIENTS, updated);
    return { success: true };
  }

  static createInvoice(data: Omit<Invoice, 'id' | 'userId' | 'createdAt'>): { success: boolean; invoice?: Invoice; error?: string } {
    const limitCheck = this.canCreateInvoice();
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.reason };
    }

    const invoices = this.getInvoices();
    const profile = this.getProfile();
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now().toString(36)}`,
      userId: profile.id,
      createdAt: new Date().toISOString(),
    };

    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);
    return { success: true, invoice: newInvoice };
  }

  static updateInvoiceStatus(invoiceId: string, newStatus: Invoice['status']): void {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i.id === invoiceId);
    if (index !== -1) {
      invoices[index].status = newStatus;
      this.saveInvoices(invoices);
    }
  }

  static upgradePlan(newPlan: PlanType): void {
    const sub = this.getSubscription();
    sub.plan = newPlan;
    sub.status = 'active';
    sub.currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    sub.updatedAt = new Date().toISOString();
    this.saveSubscription(sub);
  }

  static resetToDefaults(): void {
    this.save(STORAGE_KEYS.PROFILE, DEMO_PROFILES.pro.profile);
    this.save(STORAGE_KEYS.SUBSCRIPTION, DEMO_PROFILES.pro.subscription);
    this.save(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    this.save(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    this.save(STORAGE_KEYS.ACCOUNTS_ADMIN, DEFAULT_ADMIN_ACCOUNTS);
    this.save(STORAGE_KEYS.CURRENT_ROLE, 'pro');
  }
}
