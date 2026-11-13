import { jsPDF } from 'jspdf';
import { Invoice, Profile } from './types';
import { calculateSubtotalCents, calculateTaxCents, calculateTotalCents, formatCurrency } from './calc';
import { InvoiceFlowStore } from './store';

export function createInvoicePdfDoc(invoice: Invoice, customProfile?: Profile): jsPDF {
  const profile = customProfile || InvoiceFlowStore.getProfile();
  const subtotalCents = calculateSubtotalCents(invoice.items);
  const taxCents = calculateTaxCents(subtotalCents, invoice.taxPercent);
  const totalCents = calculateTotalCents(subtotalCents, taxCents);

  // Standard A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set document metadata
  doc.setProperties({
    title: `Tax Invoice ${invoice.number} - ${invoice.clientCompany || invoice.clientName}`,
    subject: `Tax Invoice ${invoice.number}`,
    author: profile.companyName,
    creator: 'InvoiceFlow Billing Engine',
    keywords: 'invoice, tax, payment, billing',
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // --- 1. Top Decorative Brand Accent Bar ---
  doc.setFillColor(79, 70, 229); // #4F46E5 Primary Indigo
  doc.rect(margin, y, contentWidth, 2, 'F');
  y += 9;

  // --- 2. Header: Brand / Issuer on Left, Invoice Title on Right ---
  // Brand Logo Icon [I]
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, y, 12, 12, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('I', margin + 6, y + 8.5, { align: 'center' });

  // Company Name
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(profile.companyName || 'InvoiceFlow Studio Ltd', margin + 16, y + 6);

  // Issuer Subtitle / GST
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(`GST / Tax ID: 139-482-109 | NZBN: 9429048219023`, margin + 16, y + 10.5);

  // Right Side: TAX INVOICE Header & Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('TAX INVOICE', pageWidth - margin, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text(invoice.number, pageWidth - margin, y + 12, { align: 'right' });

  y += 18;

  // --- 3. Status Badge and Metadata Strip ---
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');

  // Status Pill
  const statusUpper = invoice.status.toUpperCase();
  let pillBg = [221, 243, 228]; // Green #DDF3E4
  let pillText = [20, 83, 45]; // Dark green #14532D
  if (invoice.status === 'overdue') {
    pillBg = [254, 226, 226]; // Red #FEE2E2
    pillText = [185, 28, 28];
  } else if (invoice.status === 'sent') {
    pillBg = [238, 242, 255]; // Indigo #EEF2FF
    pillText = [79, 70, 229];
  } else if (invoice.status === 'draft') {
    pillBg = [241, 245, 249]; // Slate #F1F5F9
    pillText = [71, 85, 105];
  }

  doc.setFillColor(pillBg[0], pillBg[1], pillBg[2]);
  doc.roundedRect(margin + 4, y + 3.5, 24, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(pillText[0], pillText[1], pillText[2]);
  doc.text(statusUpper, margin + 16, y + 8, { align: 'center' });

  // Metadata Columns
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Issue Date:', margin + 36, y + 8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.issueDate, margin + 52, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Due:', margin + 78, y + 8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.dueDate, margin + 98, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Balance Due:', margin + 128, y + 8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(formatCurrency(totalCents), pageWidth - margin - 5, y + 8.5, { align: 'right' });

  y += 20;

  // --- 4. Two-Column Information Box (Billed By vs Billed To) ---
  const colWidth = (contentWidth - 8) / 2;

  // Left: Billed By
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FROM / PAYEE:', margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.companyName || 'Khanal Design & Code Ltd', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${profile.fullName || 'Nischal Khanal'}`, margin, y);
  y += 4;
  doc.text(`Email: ${profile.email || 'billing@invoiceflow.nz'}`, margin, y);
  y += 4;
  doc.text(`Address: Level 4, 18 Ponsonby Road, Auckland 1011, NZ`, margin, y);

  // Right: Billed To
  let rightY = y - 16.5;
  const rightX = margin + colWidth + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO / CLIENT:', rightX, rightY);
  rightY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientCompany || invoice.clientName, rightX, rightY);
  rightY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attn: ${invoice.clientName}`, rightX, rightY);
  rightY += 4;
  doc.text(`Email: ${invoice.clientEmail}`, rightX, rightY);
  rightY += 4;
  doc.text(`Client ID: ${invoice.clientId}`, rightX, rightY);

  y = Math.max(y, rightY) + 9;

  // --- 5. Line Items Table ---
  // Table Header
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.setLineWidth(0.3);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('DESCRIPTION / SERVICES', margin + 4, y + 5.5);
  doc.text('QTY / HRS', margin + 105, y + 5.5, { align: 'center' });
  doc.text('UNIT PRICE', margin + 140, y + 5.5, { align: 'right' });
  doc.text('AMOUNT (NZD)', margin + contentWidth - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Table Body Rows
  invoice.items.forEach((item, index) => {
    const rowHeight = 9;
    // Alternating background
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    // Description text truncated if necessary
    const descText = item.description.length > 55 ? `${item.description.slice(0, 52)}...` : item.description;
    doc.text(descText, margin + 4, y + 6);

    // Quantity
    doc.setTextColor(71, 85, 105);
    doc.text(item.quantity.toString(), margin + 105, y + 6, { align: 'center' });

    // Unit Price
    doc.text(formatCurrency(item.unitPriceCents), margin + 140, y + 6, { align: 'right' });

    // Amount
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const itemTotalCents = Math.round(item.quantity * item.unitPriceCents);
    doc.text(formatCurrency(itemTotalCents), margin + contentWidth - 4, y + 6, { align: 'right' });

    // Row separator
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    y += rowHeight;
  });

  // Bottom table line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  // --- 6. Summary Totals Box (Right Aligned) ---
  const totalsWidth = 75;
  const totalsX = margin + contentWidth - totalsWidth;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(subtotalCents), margin + contentWidth - 4, y + 4, { align: 'right' });
  y += 6.5;

  // Tax
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`GST (${invoice.taxPercent}%):`, totalsX, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(taxCents), margin + contentWidth - 4, y + 4, { align: 'right' });
  y += 6.5;

  // Grand Total Box
  doc.setFillColor(238, 242, 255); // #EEF2FF
  doc.roundedRect(totalsX - 3, y, totalsWidth + 3, 11, 2, 2, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(totalsX - 3, y, totalsWidth + 3, 11, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(79, 70, 229);
  doc.text('Total Due (NZD):', totalsX, y + 7);
  doc.setFontSize(11);
  doc.text(formatCurrency(totalCents), margin + contentWidth - 4, y + 7.5, { align: 'right' });

  y += 18;

  // --- 7. Remittance Advice & Payment Details Box ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 30, 2.5, 2.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 30, 2.5, 2.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT INSTRUCTIONS & REMITTANCE ADVICE', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  // Bank transfer info
  doc.text('Electronic Bank Transfer (EFT):', margin + 5, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank: ANZ Bank New Zealand  |  Account: 01-0221-0849201-00', margin + 5, y + 16.5);
  doc.text(`Reference: ${invoice.number}  |  Code: ${invoice.clientCompany ? invoice.clientCompany.slice(0, 10) : 'CLIENT'}`, margin + 5, y + 21);

  // Stripe & Online Card Pay
  doc.setFont('helvetica', 'normal');
  doc.text('Secure Card & Apple Pay Payment Link:', margin + 5, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  const payUrl = `https://hunter-420.github.io/invoiceflow/#pay/${invoice.id}`;
  doc.textWithLink(payUrl, margin + 58, y + 26, { url: payUrl });

  y += 36;

  // --- 8. Notes & Terms Section ---
  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('NOTES / TERMS:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4 + 4;
  }

  // --- 9. Standard Bottom Footer ---
  const footerY = 282; // A4 height is 297mm
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text('Thank you for your business. Inquiries: support@invoiceflow.nz', margin, footerY);
  doc.text('Generated by InvoiceFlow SaaS · Standard A4 Tax Invoice · Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

export function downloadInvoicePdf(invoice: Invoice, customProfile?: Profile): void {
  const doc = createInvoicePdfDoc(invoice, customProfile);
  const fileName = `Tax-Invoice-${invoice.number}.pdf`;
  doc.save(fileName);
}

export function openInvoicePdfPreview(invoice: Invoice, customProfile?: Profile): void {
  const doc = createInvoicePdfDoc(invoice, customProfile);
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

export interface SubscriptionReceipt {
  id: string;
  plan: string;
  date: string;
  amount: string;
  status: string;
}

export function createSubscriptionReceiptPdfDoc(receipt: SubscriptionReceipt, customProfile?: Profile): jsPDF {
  const profile = customProfile || InvoiceFlowStore.getProfile();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setProperties({
    title: `Payment Receipt ${receipt.id} - ${receipt.plan}`,
    subject: `Subscription Payment Receipt ${receipt.id}`,
    author: 'InvoiceFlow Cloud Billing',
    creator: 'InvoiceFlow Billing Engine',
    keywords: 'receipt, stripe, subscription, payment',
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // Top Accent Bar
  doc.setFillColor(79, 70, 229);
  doc.rect(margin, y, contentWidth, 2, 'F');
  y += 9;

  // Header
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, y, 12, 12, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('I', margin + 6, y + 8.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('InvoiceFlow Cloud Ltd', margin + 16, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GST / Tax ID: 139-482-109 | NZBN: 9429048219023', margin + 16, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT RECEIPT', pageWidth - margin, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text(`Receipt #${receipt.id.toUpperCase()}`, pageWidth - margin, y + 12, { align: 'right' });

  y += 18;

  // Metadata Strip
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');

  // Status Pill: PAID
  doc.setFillColor(221, 243, 228);
  doc.roundedRect(margin + 4, y + 3.5, 24, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 83, 45);
  doc.text('PAID', margin + 16, y + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Date:', margin + 36, y + 8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.date, margin + 58, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Method:', margin + 88, y + 8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Stripe Card (ending in 4242)', margin + 112, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Amount Paid:', margin + 158, y + 8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(receipt.amount, pageWidth - margin - 5, y + 8.5, { align: 'right' });

  y += 20;

  // Billed To / Account Holder
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO / SUBSCRIBER:', margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.fullName || 'Subscriber', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Organization: ${profile.companyName || 'Khanal Design & Code Ltd'}`, margin, y);
  y += 4;
  doc.text(`Account Email: ${profile.email || 'billing@invoiceflow.nz'}`, margin, y);

  y += 12;

  // Line items
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('SUBSCRIPTION SERVICE', margin + 4, y + 5.5);
  doc.text('BILLING PERIOD', margin + 110, y + 5.5, { align: 'center' });
  doc.text('TOTAL (NZD)', margin + contentWidth - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`InvoiceFlow Cloud - ${receipt.plan}`, margin + 4, y + 6);
  doc.setTextColor(71, 85, 105);
  doc.text(receipt.date, margin + 110, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.amount, margin + contentWidth - 4, y + 6, { align: 'right' });

  y += 12;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // Summary Totals
  const totalsWidth = 75;
  const totalsX = margin + contentWidth - totalsWidth;
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(totalsX - 3, y, totalsWidth + 3, 11, 2, 2, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(totalsX - 3, y, totalsWidth + 3, 11, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text('Total Paid (NZD):', totalsX, y + 7);
  doc.setFontSize(11);
  doc.text(receipt.amount, margin + contentWidth - 4, y + 7.5, { align: 'right' });

  y += 20;

  // Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 22, 2.5, 2.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 22, 2.5, 2.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SUBSCRIPTION & TAX DETAILS', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Payment processed securely via Stripe. This document acts as an official Tax Invoice / Receipt for GST purposes.', margin + 5, y + 11.5);
  doc.text('Manage your subscription, cancellation or payment method anytime in your InvoiceFlow Billing settings.', margin + 5, y + 16.5);

  // Footer
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('InvoiceFlow Cloud Ltd · Billing inquiries: support@invoiceflow.nz', margin, footerY);
  doc.text('Standard A4 Tax Receipt · Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

export function downloadSubscriptionReceiptPdf(receipt: SubscriptionReceipt, customProfile?: Profile): void {
  const doc = createSubscriptionReceiptPdfDoc(receipt, customProfile);
  const fileName = `Stripe-Receipt-${receipt.id}.pdf`;
  doc.save(fileName);
}
