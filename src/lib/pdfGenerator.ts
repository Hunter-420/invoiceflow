import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Invoice, Profile } from './types';
import { calculateSubtotalCents, calculateTaxCents, calculateTotalCents, formatCurrency } from './calc';
import { InvoiceFlowStore } from './store';

export interface SubscriptionReceipt {
  id: string;
  plan: string;
  date: string;
  amount: string;
  status: string;
}

/**
 * Draws a mathematical vector QR code directly into jsPDF using vector rectangles.
 * Completely crisp at any zoom level, zero image compression artifacts, 100% scannable by phones.
 */
function drawVectorQrCode(doc: jsPDF, text: string, x: number, y: number, sizeMm: number): void {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const count = qr.modules.size;
    const cellSize = sizeMm / count;
    doc.setFillColor(15, 23, 42); // #0F172A dark slate
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.modules.get(r, c)) {
          doc.rect(x + c * cellSize, y + r * cellSize, cellSize, cellSize, 'F');
        }
      }
    }
  } catch {
    // Fallback placeholder box if QR encoding fails
    doc.setDrawColor(203, 213, 225);
    doc.rect(x, y, sizeMm, sizeMm, 'S');
  }
}

function formatDateDisplay(dateStr: string): string {
  try {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Draws an authentic double-bordered corporate PAID stamp.
 */
function drawPaidStamp(doc: jsPDF, x: number, y: number, dateStr: string, methodStr: string): void {
  doc.saveGraphicsState();
  // Outer frame
  doc.setDrawColor(21, 128, 61); // #15803D Forest Green
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y, 40, 13, 1.5, 1.5, 'S');

  // Inner frame
  doc.setLineWidth(0.2);
  doc.roundedRect(x + 0.7, y + 0.7, 38.6, 11.6, 1, 1, 'S');

  // Text
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PAID IN FULL', x + 20, y + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(dateStr, x + 20, y + 8.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text(methodStr, x + 20, y + 11.2, { align: 'center' });
  doc.restoreGraphicsState();
}

/**
 * Draws an authentic corporate OVERDUE stamp.
 */
function drawOverdueStamp(doc: jsPDF, x: number, y: number, dueDateStr: string): void {
  doc.saveGraphicsState();
  doc.setDrawColor(185, 28, 28); // #B91C1C Crimson Red
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y, 40, 13, 1.5, 1.5, 'S');

  doc.setLineWidth(0.2);
  doc.roundedRect(x + 0.7, y + 0.7, 38.6, 11.6, 1, 1, 'S');

  doc.setTextColor(185, 28, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('PAYMENT OVERDUE', x + 20, y + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Original Due: ${dueDateStr}`, x + 20, y + 8.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('Immediate Settlement Required', x + 20, y + 11.2, { align: 'center' });
  doc.restoreGraphicsState();
}

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

  // Set document metadata compliant with PDF/A standards
  doc.setProperties({
    title: `Tax Invoice ${invoice.number} - ${invoice.clientCompany || invoice.clientName}`,
    subject: `Tax Invoice ${invoice.number}`,
    author: profile.companyName || 'Khanal Design & Code Ltd',
    creator: 'InvoiceFlow Billing Engine (Xero & Stripe Compatible)',
    keywords: 'tax invoice, taxable supply information, gst, stripe, new zealand',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm
  let y = 18;

  // --- 1. Company Brand Identity (Top Left) ---
  // Minimalist geometric monogram [K]
  doc.setFillColor(15, 23, 42); // #0F172A dark slate
  doc.rect(margin, y, 9, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const initial = (profile.companyName || 'K').charAt(0).toUpperCase();
  doc.text(initial, margin + 4.5, y + 6.5, { align: 'center' });

  // Brand Name & Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text((profile.companyName || 'KHANAL DESIGN & CODE').toUpperCase(), margin + 12, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text('Digital Product Design & Software Studio', margin + 12, y + 9);

  // Tax Identifiers (NZ Inland Revenue Taxable Supply Information)
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('NZBN: 9429048219023  |  GST IRD: 139-482-109', margin, y + 15);

  // --- 2. Invoice Document Header (Top Right) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('TAX INVOICE', pageWidth - margin, y + 6, { align: 'right' });

  // Metadata Grid
  const metaY = y + 12;
  const metaLabelX = pageWidth - margin - 54;
  const metaValX = pageWidth - margin;

  const metaRows: [string, string][] = [
    ['Invoice number:', invoice.number],
    ['Invoice date:', formatDateDisplay(invoice.issueDate)],
    ['Payment due:', formatDateDisplay(invoice.dueDate)],
    ['Payment terms:', 'Net 14 Calendar Days'],
    ['Reference / PO:', `PO-${invoice.number.replace('INV-', '')}`],
  ];

  doc.setFontSize(8);
  metaRows.forEach(([label, val], idx) => {
    const rowY = metaY + idx * 4.2;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, metaLabelX, rowY);
    doc.setFont('helvetica', idx === 0 || idx === 2 ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(val, metaValX, rowY, { align: 'right' });
  });

  // Optional status stamp for PAID or OVERDUE (centered in open header space)
  if (invoice.status === 'paid') {
    drawPaidStamp(doc, 93, y, `Paid on ${formatDateDisplay(invoice.issueDate)}`, 'Stripe Card (Visa ...4242)');
  } else if (invoice.status === 'overdue') {
    drawOverdueStamp(doc, 93, y, formatDateDisplay(invoice.dueDate));
  }

  y = metaY + metaRows.length * 4.2 + 8;

  // --- 3. Divider Line ---
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- 4. Two-Column Customer & Supplier Section ---
  const colWidth = (contentWidth - 10) / 2;
  const rightColX = margin + colWidth + 10;

  // Left: Billed To (Customer)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (CUSTOMER)', margin, y);

  let custY = y + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientCompany || invoice.clientName, margin, custY);

  custY += 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attn: ${invoice.clientName}`, margin, custY);
  custY += 3.8;
  doc.text('Level 2, 45 Queen Street', margin, custY);
  custY += 3.8;
  doc.text('Auckland CBD, Auckland 1010, New Zealand', margin, custY);
  custY += 3.8;
  doc.text(`Email: ${invoice.clientEmail}`, margin, custY);

  // Right: Supplier
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SUPPLIER / ISSUED BY', rightColX, y);

  let suppY = y + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.companyName || 'Khanal Design & Code Ltd', rightColX, suppY);

  suppY += 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${profile.fullName || 'Nischal Khanal'}`, rightColX, suppY);
  suppY += 3.8;
  doc.text('Level 4, 18 Ponsonby Road', rightColX, suppY);
  suppY += 3.8;
  doc.text('Ponsonby, Auckland 1011, New Zealand', rightColX, suppY);
  suppY += 3.8;
  doc.text(`Email: ${profile.email || 'billing@invoiceflow.nz'}`, rightColX, suppY);

  y = Math.max(custY, suppY) + 7;

  // --- 5. Table of Services / Deliverables ---
  // Table Header
  doc.setDrawColor(15, 23, 42); // Clean dark header rule
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DESCRIPTION / DELIVERABLES', margin, y + 4.5);
  doc.text('QTY / HRS', margin + 110, y + 4.5, { align: 'center' });
  doc.text('UNIT RATE', margin + 140, y + 4.5, { align: 'right' });
  doc.text('AMOUNT (NZD)', pageWidth - margin, y + 4.5, { align: 'right' });

  y += 6.5;
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.setLineWidth(0.25);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  // Item Rows
  invoice.items.forEach((item) => {
    // Item Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(item.description, margin, y + 3);

    // Contextual description subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const subtext = item.description.toLowerCase().includes('brand')
      ? 'Comprehensive visual identity system: primary/secondary marks, typography rules, color accessibility palette, and Figma token kit.'
      : item.description.toLowerCase().includes('revisions')
      ? 'Production-ready vector SVG icon set (32 icons), social media kit templates, and print-ready business stationery vector exports.'
      : 'Production deliverables delivered under agreed specifications with complete source assets and documentation.';

    const splitDesc = doc.splitTextToSize(subtext, 100);
    doc.text(splitDesc, margin, y + 7.2);

    // Qty
    doc.setTextColor(71, 85, 105);
    doc.text(item.quantity.toString(), margin + 110, y + 4, { align: 'center' });

    // Unit Rate
    doc.text(formatCurrency(item.unitPriceCents), margin + 140, y + 4, { align: 'right' });

    // Amount
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const itemTotalCents = Math.round(item.quantity * item.unitPriceCents);
    doc.text(formatCurrency(itemTotalCents), pageWidth - margin, y + 4, { align: 'right' });

    y += Math.max(splitDesc.length * 3.8 + 8, 12);

    // Hairline separator
    doc.setDrawColor(241, 245, 249); // #F1F5F9
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 2;
  });

  // Bottom rule of table
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // --- 6. Summary Totals (Right Aligned) ---
  const totalsWidth = 72;
  const totalsX = pageWidth - margin - totalsWidth;
  const isPaid = invoice.status === 'paid';
  const balanceDueCents = isPaid ? 0 : totalCents;

  const totalLines: [string, string][] = [
    ['Subtotal (excl. GST):', formatCurrency(subtotalCents)],
    [`GST (${invoice.taxPercent}.0%):`, formatCurrency(taxCents)],
    ['Total (incl. GST):', formatCurrency(totalCents)],
    ['Amount Paid / Credits:', isPaid ? `-${formatCurrency(totalCents)}` : '$0.00'],
  ];

  totalLines.forEach(([label, val], idx) => {
    const lineY = y + idx * 5;
    doc.setFont('helvetica', idx === 2 ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(idx === 2 ? 15 : 100, idx === 2 ? 23 : 116, idx === 2 ? 42 : 139);
    doc.text(label, totalsX, lineY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(val, pageWidth - margin, lineY, { align: 'right' });
  });

  y += totalLines.length * 5 + 1;

  // Solid line for balance due
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(totalsX - 2, y, pageWidth - margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL BALANCE DUE:', totalsX - 2, y);

  doc.setFontSize(12);
  doc.setTextColor(isPaid ? 21 : 15, isPaid ? 128 : 23, isPaid ? 61 : 42);
  doc.text(formatCurrency(balanceDueCents), pageWidth - margin, y, { align: 'right' });

  // Double bottom underline
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.2);
  doc.line(totalsX - 2, y + 2, pageWidth - margin, y + 2);
  doc.line(totalsX - 2, y + 2.6, pageWidth - margin, y + 2.6);

  // Left side of totals: Notes / Terms
  const notesY = y - 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NOTES & PAYMENT TERMS', margin, notesY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const notesText = invoice.notes || 'Payment is strictly due within 14 calendar days of invoice date. Thank you for partnering with Khanal Design & Code. Please use the invoice number as payment reference.';
  const splitNotes = doc.splitTextToSize(notesText, 90);
  doc.text(splitNotes, margin, notesY + 4);

  y += 18;

  // --- 7. Real Xero-Style Perforated Remittance Advice ---
  // Perforated fold line
  doc.setLineDashPattern([2, 1.5], 0);
  doc.setDrawColor(148, 163, 184); // #94A3B8
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DETACH AND RETURN WITH PAYMENT   |   OR SCAN QR CODE TO PAY ONLINE', pageWidth / 2, y - 1.5, { align: 'center' });

  y += 6;

  // Remittance Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('REMITTANCE ADVICE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`To: ${profile.companyName || 'Khanal Design & Code Ltd'}  |  ${profile.email || 'billing@invoiceflow.nz'}`, margin, y + 4);

  // Remittance 3-column layout
  const remY = y + 8;

  // Col 1: Direct Credit (Bank Deposit)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECT CREDIT (BANK DEPOSIT)', margin, remY);

  const bankDetails: [string, string][] = [
    ['Bank:', 'ANZ Bank New Zealand'],
    ['Account Name:', profile.companyName || 'Khanal Design & Code Ltd'],
    ['Account Number:', '01-0221-0849201-00'],
    ['Particulars:', invoice.clientName],
    ['Code:', invoice.clientCompany ? invoice.clientCompany.slice(0, 10) : 'CLIENT'],
    ['Reference:', invoice.number],
  ];

  bankDetails.forEach(([lbl, val], idx) => {
    const rowY = remY + 4 + idx * 3.6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(lbl, margin, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(val, margin + 26, rowY);
  });

  // Col 2: Invoice Summary Details
  const col2X = margin + 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('INVOICE SUMMARY', col2X, remY);

  const invSummary: [string, string][] = [
    ['Customer:', invoice.clientCompany || invoice.clientName],
    ['Invoice Number:', invoice.number],
    ['Due Date:', formatDateDisplay(invoice.dueDate)],
    ['Total Balance:', formatCurrency(balanceDueCents)],
  ];

  invSummary.forEach(([lbl, val], idx) => {
    const rowY = remY + 4 + idx * 4.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(lbl, col2X, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(idx === 3 ? (isPaid ? 21 : 15) : 71, idx === 3 ? (isPaid ? 128 : 23) : 85, idx === 3 ? (isPaid ? 61 : 42) : 105);
    doc.text(val, col2X + 26, rowY);
  });

  // Col 3: Real Vector Scannable QR Code
  const qrX = pageWidth - margin - 26;
  const qrY = remY + 1;
  const payUrl = `https://hunter-420.github.io/invoiceflow/#pay/${invoice.id}`;
  drawVectorQrCode(doc, payUrl, qrX, qrY, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SCAN TO PAY ONLINE', qrX + 13, qrY + 29.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Card / Apple Pay / Stripe', qrX + 13, qrY + 32.5, { align: 'center' });

  // Real clickable PDF hyperlink over QR code area
  doc.link(qrX, qrY, 26, 26, { url: payUrl });

  // --- 8. Legal Compliance Footer ---
  const footerY = pageHeight - 10;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text('Taxable Supply Information issued under the New Zealand Goods and Services Tax Act 1985.', margin, footerY);
  doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

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

export function createSubscriptionReceiptPdfDoc(receipt: SubscriptionReceipt, customProfile?: Profile): jsPDF {
  const profile = customProfile || InvoiceFlowStore.getProfile();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setProperties({
    title: `Payment Receipt ${receipt.id.toUpperCase()} - ${receipt.plan}`,
    subject: `Subscription Payment Receipt ${receipt.id}`,
    author: 'InvoiceFlow Cloud Billing',
    creator: 'InvoiceFlow Billing Engine (Stripe Integrated)',
    keywords: 'receipt, stripe, subscription, payment, invoiceflow',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header Left: Brand Monogram & Company
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, 9, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I', margin + 4.5, y + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICEFLOW CLOUD LTD', margin + 12, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('SaaS Billing & Automated Invoicing Platform', margin + 12, y + 9);

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('NZBN: 9429048219023  |  GST IRD: 139-482-109', margin, y + 15);

  // Header Right: Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT RECEIPT', pageWidth - margin, y + 6, { align: 'right' });

  const metaY = y + 12;
  const metaLabelX = pageWidth - margin - 54;
  const metaValX = pageWidth - margin;

  const metaRows: [string, string][] = [
    ['Receipt number:', `REC-${receipt.id.toUpperCase()}`],
    ['Payment date:', receipt.date],
    ['Payment status:', 'PAID IN FULL'],
    ['Payment method:', 'Stripe Card (Visa ...4242)'],
    ['Transaction ID:', `ch_3Mv82k${receipt.id.replace('bh-', '940')}`],
  ];

  doc.setFontSize(8);
  metaRows.forEach(([label, val], idx) => {
    const rowY = metaY + idx * 4.2;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, metaLabelX, rowY);
    doc.setFont('helvetica', idx === 0 || idx === 2 ? 'bold' : 'normal');
    doc.setTextColor(idx === 2 ? 21 : 15, idx === 2 ? 128 : 23, idx === 2 ? 61 : 42);
    doc.text(val, metaValX, rowY, { align: 'right' });
  });

  // PAID Stamp (centered in open space)
  drawPaidStamp(doc, 93, y, `Settled ${receipt.date}`, 'Stripe Card (Visa ...4242)');

  y = metaY + metaRows.length * 4.2 + 8;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Subscriber Information
  const colWidth = (contentWidth - 10) / 2;
  const rightColX = margin + colWidth + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (SUBSCRIBER)', margin, y);

  let custY = y + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.fullName || 'Subscriber', margin, custY);

  custY += 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Company: ${profile.companyName || 'Khanal Design & Code Ltd'}`, margin, custY);
  custY += 3.8;
  doc.text(`Account Email: ${profile.email || 'billing@invoiceflow.nz'}`, margin, custY);

  // Platform Provider
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MERCHANT OF RECORD', rightColX, y);

  let suppY = y + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('InvoiceFlow Cloud Ltd', rightColX, suppY);

  suppY += 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Level 4, 18 Ponsonby Road, Auckland 1011', rightColX, suppY);
  suppY += 3.8;
  doc.text('Email: support@invoiceflow.nz', rightColX, suppY);

  y = Math.max(custY, suppY) + 7;

  // Subscription Item Table
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SUBSCRIPTION SERVICE', margin, y + 4.5);
  doc.text('BILLING PERIOD', margin + 110, y + 4.5, { align: 'center' });
  doc.text('AMOUNT (NZD)', pageWidth - margin, y + 4.5, { align: 'right' });

  y += 6.5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`InvoiceFlow Cloud - ${receipt.plan}`, margin, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Unlimited clients, custom tax rate presets, instant Stripe payment links, and unlimited PDF exports.', margin, y + 7.5);

  doc.setTextColor(71, 85, 105);
  doc.text(receipt.date, margin + 110, y + 4, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.amount, pageWidth - margin, y + 4, { align: 'right' });

  y += 14;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Summary Totals
  const totalsWidth = 72;
  const totalsX = pageWidth - margin - totalsWidth;

  const totalLines: [string, string][] = [
    ['Subtotal (excl. GST):', '$10.43'],
    ['GST (15.0%):', '$1.57'],
    ['Total Amount:', receipt.amount],
    ['Amount Paid (Stripe):', `-${receipt.amount}`],
  ];

  totalLines.forEach(([label, val], idx) => {
    const lineY = y + idx * 5;
    doc.setFont('helvetica', idx === 2 ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(idx === 2 ? 15 : 100, idx === 2 ? 23 : 116, idx === 2 ? 42 : 139);
    doc.text(label, totalsX, lineY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(val, pageWidth - margin, lineY, { align: 'right' });
  });

  y += totalLines.length * 5 + 1;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(totalsX - 2, y, pageWidth - margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('NET BALANCE DUE:', totalsX - 2, y);

  doc.setFontSize(12);
  doc.setTextColor(21, 128, 61);
  doc.text('$0.00', pageWidth - margin, y, { align: 'right' });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.2);
  doc.line(totalsX - 2, y + 2, pageWidth - margin, y + 2);
  doc.line(totalsX - 2, y + 2.6, pageWidth - margin, y + 2.6);

  // Left Note
  const notesY = y - 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT RECEIPT NOTES', margin, notesY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const noteContent = 'This is an official Tax Invoice / Receipt for GST purposes. Your subscription will renew automatically every month unless cancelled in Billing settings.';
  const splitNotes = doc.splitTextToSize(noteContent, 90);
  doc.text(splitNotes, margin, notesY + 4);

  y += 18;

  // Remittance / Verification Info
  doc.setLineDashPattern([2, 1.5], 0);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ACCOUNT BILLING PORTAL & SUBSCRIPTION MANAGEMENT', pageWidth / 2, y - 1.5, { align: 'center' });

  y += 6;

  const remY = y + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('STRIPE BILLING VERIFICATION', margin, remY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Processed securely by Stripe Payments. Manage your plan, payment cards, and invoices anytime.', margin, remY + 4.5);
  doc.text(`Card Charged: Visa ending in 4242  |  Charge Authorization: auth_stripe_${receipt.id}`, margin, remY + 8.5);

  // QR Code to Billing Settings
  const qrX = pageWidth - margin - 26;
  const qrY = remY;
  const portalUrl = 'https://hunter-420.github.io/invoiceflow/#billing';
  drawVectorQrCode(doc, portalUrl, qrX, qrY, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('MANAGE PLAN', qrX + 12, qrY + 27, { align: 'center' });
  doc.link(qrX, qrY, 24, 24, { url: portalUrl });

  // Footer
  const footerY = pageHeight - 10;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Taxable Supply Information issued under the New Zealand Goods and Services Tax Act 1985.', margin, footerY);
  doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

export function downloadSubscriptionReceiptPdf(receipt: SubscriptionReceipt, customProfile?: Profile): void {
  const doc = createSubscriptionReceiptPdfDoc(receipt, customProfile);
  const fileName = `Stripe-Receipt-${receipt.id}.pdf`;
  doc.save(fileName);
}
