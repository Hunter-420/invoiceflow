# InvoiceFlow - Invoicing & Client Portal SaaS MVP

A modern SaaS MVP for independent freelancers, contractors, and boutique agencies. Features client management, line-item invoice drafting with live tax math, status lifecycle workflows (draft, sent, paid, overdue), multi-tier subscription billing with Stripe integration, printable PDF generation, and super-admin accounts oversight. Demonstrates the Premium Package for the Next.js and Modern Web App Fiverr gig.

## Demo Notice

This application is a concept SaaS demonstration proving full-stack multi-tenant architecture, tier limits enforcement, Stripe integration, and administrative controls.

## Project Overview

- Package: Premium Package ($950)
- Brand: InvoiceFlow
- Live Demo: Hosted on GitHub Pages
- Framework: React 18, TypeScript (strict), Vite, Tailwind CSS, Lucide Icons, Zod

## Design Tokens and Typography

- Typography: Plus Jakarta Sans
- Page Background: #F8FAFC
- Ink Headings: #0F172A, Body: #475569, Muted: #64748B
- Primary Color: Indigo (#4F46E5), Hover (#4338CA)
- Indigo Tint Background: #EEF2FF, Border: #C7D2FE
- Card Borders: #E2E8F0, Input Borders: #CBD5E1
- Radii: Buttons 12px, Stat Tiles 16px, Cards 24px, Featured Plan 28px, Banners 36px, Pills 100px

## Key Features and Routes

1. High-Conversion Landing Page (/):
   - Clear value proposition headline, proof signals, and interactive invoice demo preview.
   - Three-step workflow breakdown.
   - Technical feature architecture pillars (Row Level Security, Webhook Sync, Integer-Cent Precision).
   - Six-question interactive FAQ accordion.

2. Revenue Dashboard (/dashboard - Figma 4:2):
   - 4 Top metric tiles: Total Revenue Billed ($12,820.00), Paid This Month ($3,215.00), Pending Collection ($2,760.00), and Overdue Balance ($2,040.00).
   - 12-Month historical invoiced volume bar chart with interactive tooltips.
   - Needs Attention section highlighting overdue accounts with instant reminder action.
   - Recent Invoices table with status pills (Paid, Sent, Overdue, Draft).

3. Invoice Editor (/invoice-new & /invoices/[id] - Spec Section 4.4):
   - Left 2/3: Form card with client selector, issue date, Net 14 due date, and dynamic line items table with add/remove rows.
   - Right 1/3: Summary card with subtotal, tax percentage (15% GST), and total amount in integer cents.
   - Status actions: Mark as Sent, Save as Draft, Mark as Settled.

4. Client Portal & Invoices (/invoices & /clients):
   - Filterable ledger by status (Sent, Paid, Overdue, Draft) and search bar.
   - Client directory tracking open invoices and total revenue billed.
   - Soft-delete client capability with confirmation dialog.

5. Subscription Billing (/billing & /pricing - Figma 6:2):
   - Monthly and annual pricing comparison with -20% annual discount badge.
   - Tier limits enforcement:
     - Free Starter: limited to 3 clients and 5 invoices per calendar month.
     - Pro Freelancer ($12/mo): unlimited clients and invoices.
     - Studio MVP ($29/mo): adds team accounts and admin dashboard.
   - Simulated Stripe Checkout modal using test card 4242 4242 4242 4242.
   - Direct links to Stripe Customer Portal.

6. Super-Admin Accounts Portal (/admin - Spec Section 4.4):
   - Protected route accessible only to users with role = admin. Non-admin accounts receive a 404 response.
   - Global metrics: Total Accounts (128), Pro Subscribers (41), Studio Subscribers (9), MRR ($785.00).
   - Tenant directory with subscription status and join dates.

7. PDF Invoicing & Client Payment (/public-pay):
   - Print-optimized stylesheet for crisp A4/Letter PDF invoice downloads.
   - Public pay link allowing simulated client card settlement.

8. Multi-Role Demo Switcher:
   - Top banner toggle allows instantaneous switching between Pro Freelancer, Free Tier, and Studio Admin perspectives.

## Local Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run automated test suite
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

## License

MIT
