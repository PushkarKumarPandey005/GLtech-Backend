/**
 * Invoice HTML Template Generator
 * Generates HTML invoice that can be printed or converted to PDF
 */

export const generateInvoiceHTML = (invoice) => {
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const itemsHTML = invoice.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.total.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    
    .company-info h1 {
      color: #2563eb;
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .company-info p {
      color: #666;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .invoice-info {
      text-align: right;
    }
    
    .invoice-info p {
      margin: 5px 0;
      color: #333;
      font-size: 13px;
    }
    
    .invoice-number {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .billing-shipping {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
    }
    
    .billing-info,
    .shipping-info {
      flex: 1;
      font-size: 13px;
      line-height: 1.8;
    }
    
    .address-box {
      background: #f9f9f9;
      padding: 15px;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
    }
    
    .address-box p {
      color: #333;
      margin: 3px 0;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .items-table thead {
      background: #2563eb;
      color: white;
    }
    
    .items-table th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
    }
    
    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      font-size: 13px;
    }
    
    .items-table thead th:nth-child(2),
    .items-table thead th:nth-child(3),
    .items-table thead th:nth-child(4) {
      text-align: right;
    }
    
    .summary {
      display: flex;
      justify-content: flex-end;
      margin-top: 30px;
    }
    
    .summary-box {
      width: 300px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 10px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    
    .summary-row.total {
      background: #2563eb;
      color: white;
      font-weight: bold;
      font-size: 16px;
      padding: 12px 10px;
      border: none;
      border-radius: 4px;
    }
    
    .notes {
      background: #f0f4ff;
      padding: 15px;
      border-radius: 4px;
      margin-top: 30px;
      font-size: 13px;
      color: #333;
      line-height: 1.6;
    }
    
    .terms {
      background: #fff5f5;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
      font-size: 12px;
      color: #333;
      line-height: 1.6;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #10b981;
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
    
    .action-buttons {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
    }
    
    .btn-print {
      background: #2563eb;
      color: white;
    }
    
    .btn-download {
      background: #10b981;
      color: white;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <h1>GL Technology</h1>
        <p>
          📍 Your Store Location<br>
          📞 Customer Support<br>
          📧 support@gltech.com
        </p>
      </div>
      <div class="invoice-info">
        <p class="invoice-number">Invoice: ${invoice.invoiceNumber}</p>
        <p><strong>Order ID:</strong> ${invoice.orderNumber}</p>
        <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <div class="status-badge">${invoice.payment.method.toUpperCase()} - ${invoice.payment.status}</div>
      </div>
    </div>
    
    <div class="billing-shipping">
      <div class="billing-info">
        <div class="section-title">Bill To</div>
        <div class="address-box">
          <p><strong>${invoice.customer.fullName}</strong></p>
          <p>${invoice.address.fullAddress}</p>
          <p>${invoice.address.city}, ${invoice.address.state} ${invoice.address.pincode}</p>
          <p>📧 ${invoice.customer.email}</p>
          <p>📱 ${invoice.customer.phone}</p>
        </div>
      </div>
      
      <div class="shipping-info">
        <div class="section-title">Ship To</div>
        <div class="address-box">
          <p><strong>${invoice.customer.fullName}</strong></p>
          <p>${invoice.address.fullAddress}</p>
          <p>${invoice.address.city}, ${invoice.address.state} ${invoice.address.pincode}</p>
          <p>📱 ${invoice.customer.phone}</p>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Order Items</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
    </div>
    
    <div class="summary">
      <div class="summary-box">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>₹${invoice.pricing.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${invoice.pricing.shipping === 0 ? 'FREE' : '₹' + invoice.pricing.shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Tax (18%):</span>
          <span>₹${invoice.pricing.tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total Amount:</span>
          <span>₹${invoice.pricing.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    ${invoice.notes ? `<div class="notes"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
    
    ${invoice.termsAndConditions ? `<div class="terms"><strong>Terms & Conditions:</strong><br>${invoice.termsAndConditions.replace(/\n/g, '<br>')}</div>` : ''}
    
    <div class="footer">
      <p>Thank you for your business! This is an electronically generated invoice and is valid without signature or stamp.</p>
      <p>Generated on ${new Date().toLocaleString('en-IN')} | Invoice: ${invoice.invoiceNumber}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
};

/**
 * Convert HTML to PDF using client-side library
 * Note: Requires html2pdf library on frontend
 */
export const invoiceToHTML = (invoice) => {
  return generateInvoiceHTML(invoice);
};
