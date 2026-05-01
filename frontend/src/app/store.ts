import { create } from 'zustand';
import { Product, CartItem, Bill, BillItem, Customer, Payment, Expense } from './types';

// ─── Helpers ───
const LS = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key: string, val: unknown) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(val));
  },
};

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Default Products (Indian shop) ───
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1',  name: 'Masala Chai',       price: 20,  cost: 8,   emoji: '☕', category: 'Beverages', gstPercent: 5,  stock: 999, lowStockThreshold: 10 },
  { id: '2',  name: 'Cold Coffee',       price: 80,  cost: 30,  emoji: '🧋', category: 'Beverages', gstPercent: 5,  stock: 100, lowStockThreshold: 10 },
  { id: '3',  name: 'Veg Burger',        price: 90,  cost: 35,  emoji: '🍔', category: 'Snacks',    gstPercent: 5,  stock: 50,  lowStockThreshold: 5 },
  { id: '4',  name: 'Samosa (2pc)',       price: 30,  cost: 10,  emoji: '🥟', category: 'Snacks',    gstPercent: 5,  stock: 200, lowStockThreshold: 20 },
  { id: '5',  name: 'Paneer Roll',       price: 70,  cost: 25,  emoji: '🌯', category: 'Snacks',    gstPercent: 5,  stock: 80,  lowStockThreshold: 10 },
  { id: '6',  name: 'Margherita Pizza',   price: 220, cost: 80,  emoji: '🍕', category: 'Food',      gstPercent: 5,  stock: 40,  lowStockThreshold: 5 },
  { id: '7',  name: 'Dal Tadka',         price: 120, cost: 40,  emoji: '🍲', category: 'Food',      gstPercent: 5,  stock: 60,  lowStockThreshold: 10 },
  { id: '8',  name: 'Gulab Jamun (2pc)', price: 40,  cost: 12,  emoji: '🍮', category: 'Desserts',  gstPercent: 5,  stock: 150, lowStockThreshold: 20 },
  { id: '9',  name: 'Mango Lassi',       price: 60,  cost: 20,  emoji: '🥛', category: 'Beverages', gstPercent: 5,  stock: 100, lowStockThreshold: 10 },
  { id: '10', name: 'Veg Thali',         price: 180, cost: 70,  emoji: '🍱', category: 'Food',      gstPercent: 5,  stock: 30,  lowStockThreshold: 5 },
  { id: '11', name: 'Pav Bhaji',         price: 100, cost: 35,  emoji: '🍛', category: 'Food',      gstPercent: 5,  stock: 45,  lowStockThreshold: 5 },
  { id: '12', name: 'Lemon Soda',        price: 35,  cost: 10,  emoji: '🍋', category: 'Beverages', gstPercent: 5,  stock: 200, lowStockThreshold: 20 },
];

// ─── Store Shape ───
interface AppStore {
  // Products
  products: Product[];
  setProducts: (p: Product[]) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart (100% frontend, zero backend calls)
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  incrementQty: (id: string) => void;
  decrementQty: (id: string) => void;
  clearCart: () => void;

  // Bills
  bills: Bill[];
  nextInvoiceNo: number;
  generateBill: (paymentMode: 'Cash' | 'UPI' | 'Credit', customerName: string, phone: string, customerId?: string) => Bill | null;

  // Customers
  customers: Customer[];
  addCustomer: (name: string, phone: string) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Payments (Udhaar ledger)
  payments: Payment[];
  recordPayment: (customerId: string, amount: number, mode: 'Cash' | 'UPI', note?: string) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (title: string, amount: number, category: string) => void;
  deleteExpense: (id: string) => void;

  // Printer
  printerConnected: boolean;
  setPrinterConnected: (v: boolean) => void;

  // Hydrate from localStorage
  hydrate: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // ─── Products ───
  products: DEFAULT_PRODUCTS,
  setProducts: (products) => { set({ products }); LS.set('be_products', products); },
  addProduct: (p) => {
    const product: Product = { ...p, id: genId() };
    const products = [...get().products, product];
    set({ products }); LS.set('be_products', products);
  },
  updateProduct: (id, updates) => {
    const products = get().products.map(p => p.id === id ? { ...p, ...updates } : p);
    set({ products }); LS.set('be_products', products);
  },
  deleteProduct: (id) => {
    const products = get().products.filter(p => p.id !== id);
    set({ products }); LS.set('be_products', products);
  },

  // ─── Cart (fully client-side, <100ms) ───
  cart: [],
  addToCart: (product) => {
    set(state => {
      const existing = state.cart.find(i => i.id === product.id);
      if (existing) {
        // Don't exceed stock
        if (existing.qty >= product.stock) return state;
        return { cart: state.cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
      }
      if (product.stock <= 0) return state;
      return { cart: [...state.cart, { ...product, qty: 1 }] };
    });
  },
  removeFromCart: (id) => set(state => ({ cart: state.cart.filter(i => i.id !== id) })),
  updateCartQty: (id, qty) => {
    set(state => {
      if (qty <= 0) return { cart: state.cart.filter(i => i.id !== id) };
      const item = state.cart.find(i => i.id === id);
      if (!item) return state;
      const product = state.products.find(p => p.id === id);
      const maxQty = product ? product.stock : qty;
      return { cart: state.cart.map(i => i.id === id ? { ...i, qty: Math.min(qty, maxQty) } : i) };
    });
  },
  incrementQty: (id) => {
    const item = get().cart.find(i => i.id === id);
    const product = get().products.find(p => p.id === id);
    if (item && product && item.qty < product.stock) {
      set(state => ({ cart: state.cart.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i) }));
    }
  },
  decrementQty: (id) => {
    set(state => ({
      cart: state.cart.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0)
    }));
  },
  clearCart: () => set({ cart: [] }),

  // ─── Bills ───
  bills: [],
  nextInvoiceNo: 1,
  generateBill: (paymentMode, customerName, phone, customerId) => {
    const state = get();
    if (state.cart.length === 0) return null;

    const billItems: BillItem[] = state.cart.map(item => {
      const lineTotal = item.price * item.qty;
      const lineGST = Math.round(lineTotal * (item.gstPercent / 100));
      return {
        productId: item.id, name: item.name, price: item.price,
        qty: item.qty, gstPercent: item.gstPercent,
        lineTotal, lineGST,
      };
    });

    const subTotal = billItems.reduce((s, i) => s + i.lineTotal, 0);
    const totalGST = billItems.reduce((s, i) => s + i.lineGST, 0);
    const cgst = Number((totalGST / 2).toFixed(2));
    const sgst = totalGST - cgst;
    const grandTotal = subTotal + totalGST;

    let finalCustomerId = customerId;
    let updatedCustomers = state.customers;

    // Auto-create customer if name/phone provided but no ID
    if (!finalCustomerId && (customerName && customerName !== 'Walk-in' || phone)) {
      const newCustomer: Customer = {
        id: genId(), name: customerName || 'Walk-in', phone: phone || '',
        credit: 0, totalPurchases: 0, billIds: []
      };
      updatedCustomers = [...updatedCustomers, newCustomer];
      finalCustomerId = newCustomer.id;
    }

    const bill: Bill = {
      id: genId(),
      invoiceNo: state.nextInvoiceNo,
      items: billItems, subTotal, cgst, sgst, totalGST, grandTotal,
      paymentMode, customerName: customerName || 'Walk-in', customerId: finalCustomerId, phone,
      date: new Date().toLocaleString('en-IN'), timestamp: Date.now(),
    };

    // Reduce stock (optimistic)
    const updatedProducts = state.products.map(p => {
      const cartItem = state.cart.find(c => c.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      return p;
    });

    // Credit tracking
    if (paymentMode === 'Credit' && finalCustomerId) {
      updatedCustomers = updatedCustomers.map(c =>
        c.id === finalCustomerId
          ? { ...c, credit: c.credit + grandTotal, totalPurchases: c.totalPurchases + grandTotal, billIds: [...(c.billIds || []), bill.id] }
          : c
      );
    } else if (finalCustomerId) {
      updatedCustomers = updatedCustomers.map(c =>
        c.id === finalCustomerId
          ? { ...c, totalPurchases: c.totalPurchases + grandTotal, billIds: [...(c.billIds || []), bill.id] }
          : c
      );
    }

    const bills = [bill, ...state.bills];
    const nextInvoiceNo = state.nextInvoiceNo + 1;

    set({ bills, nextInvoiceNo, cart: [], products: updatedProducts, customers: updatedCustomers });
    LS.set('be_bills', bills);
    LS.set('be_invoiceNo', nextInvoiceNo);
    LS.set('be_products', updatedProducts);
    LS.set('be_customers', updatedCustomers);

    // ☁️ Cloud Sync (Fire and forget)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bill })
    }).catch(() => console.log('⚠️ Failed to sync bill to cloud (running offline)'));

    return bill;
  },

  // ─── Customers ───
  customers: [
    { id: 'c1', name: 'Rahul Sharma', phone: '9876543210', credit: 0, totalPurchases: 0, billIds: [] },
    { id: 'c2', name: 'Priya Patel', phone: '9123456789', credit: 150, totalPurchases: 500, billIds: [] },
  ],
  addCustomer: (name, phone) => {
    const c: Customer = { id: genId(), name, phone, credit: 0, totalPurchases: 0, billIds: [] };
    const customers = [...get().customers, c];
    set({ customers }); LS.set('be_customers', customers);
    return c;
  },
  updateCustomer: (id, updates) => {
    const customers = get().customers.map(c => c.id === id ? { ...c, ...updates } : c);
    set({ customers }); LS.set('be_customers', customers);
  },
  deleteCustomer: (id) => {
    const customers = get().customers.filter(c => c.id !== id);
    set({ customers }); LS.set('be_customers', customers);
  },

  // ─── Payments ───
  payments: [],
  recordPayment: (customerId, amount, mode, note = '') => {
    const payment: Payment = {
      id: genId(), customerId, amount, mode, note,
      date: new Date().toLocaleString('en-IN'), timestamp: Date.now(),
    };
    const payments = [payment, ...get().payments];
    const customers = get().customers.map(c =>
      c.id === customerId ? { ...c, credit: Math.max(0, c.credit - amount) } : c
    );
    set({ payments, customers });
    LS.set('be_payments', payments);
    LS.set('be_customers', customers);
  },

  // ─── Expenses ───
  expenses: [],
  addExpense: (title, amount, category) => {
    const exp: Expense = { id: genId(), title, amount, category, date: new Date().toLocaleString('en-IN'), timestamp: Date.now() };
    const expenses = [exp, ...get().expenses];
    set({ expenses }); LS.set('be_expenses', expenses);
  },
  deleteExpense: (id) => {
    const expenses = get().expenses.filter(e => e.id !== id);
    set({ expenses }); LS.set('be_expenses', expenses);
  },

  // ─── Printer ───
  printerConnected: false,
  setPrinterConnected: (v) => set({ printerConnected: v }),

  // ─── Hydrate ───
  hydrate: async () => {
    // 1. Load instantly from Local Storage (Offline First)
    set({
      products: LS.get('be_products', DEFAULT_PRODUCTS),
      bills: LS.get('be_bills', []),
      nextInvoiceNo: LS.get('be_invoiceNo', 1),
      customers: LS.get('be_customers', []),
      payments: LS.get('be_payments', []),
      expenses: LS.get('be_expenses', []),
    });

    // 2. Background Sync with Cloud Database
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/products`);
      if (res.ok) {
        const cloudProducts = await res.json();
        if (cloudProducts && cloudProducts.length > 0) {
          set({ products: cloudProducts });
          LS.set('be_products', cloudProducts);
          console.log('☁️ Synced products from cloud database');
        }
      }
    } catch (err) {
      console.log('⚠️ Cloud database unreachable, running in offline mode');
    }
  },
}));
