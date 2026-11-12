# Handover Document - InvoiceFlow

## Deliverable Information

- Project: InvoiceFlow SaaS MVP
- Package: Premium Package ($950)
- Repository: hunter-420/invoiceflow
- Live URL: https://hunter-420.github.io/invoiceflow/
- Demo Identity: Concept SaaS for Freelancers & Independent Studios

## Test Accounts (Pre-configured)

1. Pro Freelancer Account:
   - Email: nischal@invoiceflow.example
   - Role: user
   - Plan: pro ($12/mo)
   - Status: active

2. Super Admin Account:
   - Email: admin@invoiceflow.example
   - Role: admin
   - Plan: studio ($29/mo)
   - Status: active
   - Access: /admin accounts portal enabled

3. Free Tier Account:
   - Email: alex@starterfreelance.example
   - Role: user
   - Plan: free
   - Status: none
   - Limits: 3 clients maximum, 5 invoices/month maximum

## Verified Acceptance Criteria

- Math accuracy: all currency is computed in integer cents and formatted with tabular numerals.
- Dynamic overdue status: computes overdue status whenever due_date is before current day and status is sent.
- Free plan boundary checks: blocks creation of 4th client and 6th monthly invoice with upgrade modal.
- Stripe subscription lifecycle: upgrade action converts plan to Pro or Studio and records period end.
- Admin guard: non-admin accounts accessing /admin receive a 404 response; admins see tenant list and MRR.
- PDF generation: browser print stylesheet formats invoice to clean PDF layout.
- Zero emotes or emojis exist in documentation, source code, or interfaces.
