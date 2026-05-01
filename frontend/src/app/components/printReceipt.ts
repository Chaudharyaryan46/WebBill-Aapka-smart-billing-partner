import { Bill } from '../types';

/**
 * 🎨 Premium Neo-Brutalist Receipt (80mm width)
 * Designed for Lumina Fine Dining.
 */
export function printLuminaReceipt(bill: Bill) {
  const printWindow = window.open('', '_blank', 'width=450,height=800');
  if (!printWindow) return;

  // Real-time calculations
  const serviceChargePercent = 10;
  const serviceCharge = Math.round(bill.subTotal * (serviceChargePercent / 100));
  const finalGrandTotal = bill.grandTotal + serviceCharge;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${bill.invoiceNo}</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style>
          @page { margin: 0; size: 80mm auto; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Space Grotesk', sans-serif; -webkit-print-color-adjust: exact; }
          body { background: #fff; color: #000; width: 80mm; padding: 20px; margin: 0 auto; }
          
          header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 42px; font-weight: 800; letter-spacing: -3px; text-transform: uppercase; margin-bottom: 2px; }
          .address { font-size: 11px; font-weight: 600; color: #000; text-transform: uppercase; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
          
          .customer-meta { 
            display: flex; 
            flex-direction: column; 
            gap: 2px; 
            font-size: 11px; 
            font-weight: 800; 
            margin-bottom: 10px; 
            text-transform: uppercase;
          }

          .meta-info { 
            display: flex; 
            justify-content: space-between; 
            font-size: 12px; 
            font-weight: 800; 
            padding: 10px 0; 
            border-top: 3px solid #000; 
            border-bottom: 3px solid #000; 
            margin-bottom: 20px; 
            text-transform: uppercase;
          }

          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { text-align: left; font-size: 11px; font-weight: 800; padding-bottom: 10px; text-transform: uppercase; }
          td { padding: 12px 0; vertical-align: top; font-size: 14px; font-weight: 600; }
          .hr-line { border-bottom: 3px solid #000; }
          
          .item-name { max-width: 140px; line-height: 1.2; }
          .qty { text-align: center; font-weight: 800; }
          .price { text-align: right; font-weight: 800; }

          .totals-box { 
            padding: 18px; 
            background: #fff; 
            border: 4px solid #000; 
            box-shadow: 6px 6px 0px #000; 
            margin-bottom: 30px;
          }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 600; }
          .grand-total { 
            margin-top: 14px; 
            padding-top: 14px; 
            border-top: 3px solid #000; 
            font-size: 28px; 
            font-weight: 900; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            letter-spacing: -1px;
          }

          footer { margin-top: 20px; text-align: center; }
          .thanks { font-size: 16px; font-weight: 800; margin-bottom: 25px; text-transform: uppercase; letter-spacing: -0.5px; }
          
          .qr-section { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; }
          .qr-box { width: 54px; height: 54px; border: 3px solid #000; display: flex; align-items: center; justify-content: center; background: #fff; }
          .qr-label { font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; line-height: 1.1; }
        </style>
      </head>
      <body>
        <header>
          <div class="logo">LUMINA</div>
          <div class="address">45 Skyline Blvd, Palanpur | +91 98765 43210</div>
        </header>

        <div class="customer-meta">
          <div>CUSTOMER: ${bill.customerName.toUpperCase() || 'GUEST'}</div>
          <div>MOBILE:   ${bill.phone || 'N/A'}</div>
          <div>DATE:     ${bill.date}</div>
          <div>INV NO:   #${bill.invoiceNo}</div>
        </div>

        <div class="meta-info">
          <span>TABLE #04</span>
          <span>SERVER: AMAN</span>
          <span>GUESTS: 02</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 60%">ITEM</th>
              <th style="width: 15%; text-align: center;">QTY</th>
              <th style="width: 25%; text-align: right;">PRICE</th>
            </tr>
            <tr><th colspan="3" class="hr-line"></th></tr>
          </thead>
          <tbody>
            ${bill.items.map(item => `
              <tr>
                <td class="item-name">${item.name.toUpperCase()}</td>
                <td class="qty">${item.qty}</td>
                <td class="price">₹${item.lineTotal.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-box">
          <div class="total-row"><span>Subtotal</span><span>₹${bill.subTotal.toLocaleString('en-IN')}</span></div>
          <div class="total-row"><span>GST (5%)</span><span>₹${bill.totalGST.toLocaleString('en-IN')}</span></div>
          <div class="total-row"><span>Service Charge (10%)</span><span>₹${serviceCharge.toLocaleString('en-IN')}</span></div>
          <div class="grand-total">
            <span>TOTAL</span>
            <span>₹${finalGrandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <footer>
          <div class="thanks">Thank You For Dining With Us!</div>
          <div class="qr-section">
            <div class="qr-box">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <rect x="2" y="2" width="6" height="6" /><rect x="16" y="2" width="6" height="6" /><rect x="2" y="16" width="6" height="6" />
                <path d="M16 16h2v2h-2zM18 18h2v2h-2zM20 16h2v2h-2zM16 20h2v2h-2z" />
              </svg>
            </div>
            <div class="qr-label">SCAN TO PAY<br>OR FEEDBACK</div>
          </div>
        </footer>

        <script>
          window.onload = () => { 
            setTimeout(() => { window.print(); window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * 📠 Thermal Printer Optimized Formatter (32 cols / 58mm)
 */
export function formatLuminaThermalReceipt(bill: Bill) {
  const W = 32;
  const hr = "━".repeat(W);
  const dotHr = "┄".repeat(W);
  const center = (txt: string) => { const pad = Math.max(0, Math.floor((W - txt.length) / 2)); return " ".repeat(pad) + txt; };
  const justify = (left: string, right: string) => { const space = W - left.length - right.length; return left + " ".repeat(Math.max(1, space)) + right; };
  let r = "";
  r += center("LUMINA FINE DINING") + "\n";
  r += center("45 Skyline Blvd, Palanpur") + "\n";
  r += hr + "\n";
  r += justify(`INV: #${bill.invoiceNo}`, bill.date.split(',')[0]) + "\n";
  r += justify(`CUST: ${bill.customerName || 'GUEST'}`, "") + "\n";
  r += hr + "\n";
  r += "ITEM            QTY    PRICE\n";
  r += dotHr + "\n";
  bill.items.forEach(item => {
    const name = item.name.length > 15 ? item.name.substring(0, 12) + ".." : item.name.padEnd(15);
    const qty = item.qty.toString().padStart(3);
    const price = item.lineTotal.toFixed(0).padStart(8);
    r += `${name} ${qty} ${price}\n`;
  });
  r += hr + "\n";
  r += justify("Subtotal:", `Rs.${bill.subTotal}`) + "\n";
  r += justify("GST:", `Rs.${bill.totalGST}`) + "\n";
  r += hr + "\n";
  r += justify("TOTAL:", `Rs.${bill.grandTotal}`) + "\n";
  r += hr + "\n";
  r += center("Thank you!") + "\n";
  return r;
}
