// ─── Core Entity Types ───
export interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;       // cost price for profit calc
  emoji: string;
  category: string;
  gstPercent: number;  // per-product GST rate
  stock: number;
  lowStockThreshold: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface BillItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  gstPercent: number;
  lineTotal: number;   // price × qty
  lineGST: number;     // tax on this line
}

export interface Bill {
  id: string;
  invoiceNo: number;
  items: BillItem[];
  subTotal: number;
  cgst: number;
  sgst: number;
  totalGST: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI' | 'Credit';
  customerName: string;
  customerId?: string;
  phone: string;
  date: string;
  timestamp: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  credit: number;           // outstanding udhaar
  totalPurchases: number;
  billIds: string[];
}

export interface Payment {
  id: string;
  customerId: string;
  billId?: string;
  amount: number;
  mode: 'Cash' | 'UPI';
  date: string;
  timestamp: number;
  note: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  timestamp: number;
  date: string;
}
