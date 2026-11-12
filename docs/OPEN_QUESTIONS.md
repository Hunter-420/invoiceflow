# Open Questions and Architecture Notes - InvoiceFlow

## Architecture Decisions

1. Static Deployment with In-Memory / LocalStorage Persistence:
   - Configured for GitHub Pages hosting with immediate interactive responsiveness.
   - All database tables (profiles, clients, invoices, invoice_items, subscriptions) operate via an in-browser storage layer that replicates PostgreSQL schema behavior and RLS boundaries.

2. Stripe Integration Mode:
   - Configured in test mode with client checkout simulation modal accepting test card `4242 4242 4242 4242`.
   - Simulated webhook state synchronization immediately updates subscription status and unlocks plan quotas.
