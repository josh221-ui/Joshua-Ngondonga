
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import Modal from './components/Modal';
import { 
  Transaction, 
  TransactionType, 
  PaymentMethod, 
  InventoryItem, 
  Debt, 
  AppData 
} from './types';
import { getBusinessInsights } from './services/geminiService';

const INITIAL_DATA: AppData = {
  transactions: [
    { id: '1', type: TransactionType.SALE, description: 'Sold Milk & Bread', amount: 12.50, timestamp: Date.now() - 3600000, method: PaymentMethod.CASH },
    { id: '2', type: TransactionType.SALE, description: 'Customer: John Doe', amount: 24.00, timestamp: Date.now() - 7200000, method: PaymentMethod.POS },
    { id: '3', type: TransactionType.EXPENSE, description: 'Electricity Bill', amount: 35.00, timestamp: Date.now() - 10800000, method: PaymentMethod.CASH, category: 'Utility' },
  ],
  inventory: [
    { id: '1', name: 'Milk', quantity: 24, price: 2.50 },
    { id: '2', name: 'Bread', quantity: 15, price: 1.50 },
    { id: '3', name: 'Eggs', quantity: 120, price: 0.20 },
  ],
  debts: [
    { id: '1', customerName: 'Mark Smith', amount: 50.00, timestamp: Date.now() - 86400000 },
  ]
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('digital_shop_book_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [activeTab, setActiveTab] = useState('home');
  const [modalType, setModalType] = useState<'sale' | 'debt' | 'stock' | 'expense' | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('digital_shop_book_data', JSON.stringify(data));
  }, [data]);

  // Insights fetching
  const fetchInsights = useCallback(async () => {
    setLoadingInsight(true);
    try {
      const insight = await getBusinessInsights(data.transactions, data.inventory, data.debts);
      setAiInsight(insight);
    } finally {
      setLoadingInsight(false);
    }
  }, [data]);

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const todaysTransactions = data.transactions.filter(t => t.timestamp >= today);
    const sales = todaysTransactions.filter(t => t.type === TransactionType.SALE).reduce((s, t) => s + t.amount, 0);
    const expenses = todaysTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return {
      sales,
      profit: sales - expenses,
      debtCount: data.debts.length,
      totalDebt: data.debts.reduce((s, d) => s + d.amount, 0)
    };
  }, [data]);

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const type = modalType === 'expense' ? TransactionType.EXPENSE : TransactionType.SALE;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      description,
      timestamp: Date.now(),
      method: formData.get('method') as PaymentMethod || PaymentMethod.CASH,
      category: formData.get('category') as string || undefined
    };

    setData(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    setModalType(null);
  };

  const handleAddDebt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const customerName = formData.get('customerName') as string;

    const newDebt: Debt = {
      id: Math.random().toString(36).substr(2, 9),
      customerName,
      amount,
      timestamp: Date.now()
    };

    setData(prev => ({ ...prev, debts: [newDebt, ...prev.debts] }));
    setModalType(null);
  };

  const handleAddStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const price = parseFloat(formData.get('price') as string);

    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      quantity,
      price
    };

    setData(prev => ({ ...prev, inventory: [newItem, ...prev.inventory] }));
    setModalType(null);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} userName="Sarah">
      {activeTab === 'home' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform active:scale-95">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Profit</p>
              </div>
              <p className="text-2xl font-bold text-primary">${metrics.profit.toFixed(2)}</p>
              <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-xs">arrow_upward</span>
                <span>12% from yesterday</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform active:scale-95">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-400 text-sm">payments</span>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Sales</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">${metrics.sales.toFixed(2)}</p>
              <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-xs">arrow_upward</span>
                <span>8% from yesterday</span>
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <h3 className="text-xs font-bold uppercase tracking-wider">Business Insight</h3>
            </div>
            {loadingInsight ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="h-4 bg-primary/10 rounded w-full"></div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{aiInsight || 'Loading business tips...'}"
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setModalType('sale')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-primary rounded-xl text-white shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                </div>
                <span className="text-sm font-semibold">Log Sale</span>
              </button>
              <button 
                onClick={() => setModalType('debt')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined">person_remove</span>
                </div>
                <span className="text-sm font-semibold">Add Debt</span>
              </button>
              <button 
                onClick={() => setActiveTab('stock')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <span className="text-sm font-semibold">Check Stock</span>
              </button>
              <button 
                onClick={() => setModalType('expense')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <span className="text-sm font-semibold">Expenses</span>
              </button>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              <button onClick={() => setActiveTab('sales')} className="text-xs font-semibold text-primary">View All</button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {data.transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.type === TransactionType.SALE ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600'
                  }`}>
                    <span className="material-symbols-outlined">
                      {tx.type === TransactionType.SALE ? 'shopping_bag' : 'account_balance_wallet'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === TransactionType.SALE ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                      {tx.type === TransactionType.SALE ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <p className={`text-[10px] ${tx.type === TransactionType.SALE ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {tx.category || 'Completed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === 'sales' && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">All Sales</h2>
          <div className="space-y-2">
            {data.transactions.filter(t => t.type === TransactionType.SALE).map(tx => (
              <div key={tx.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold">{tx.description}</p>
                  <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <p className="text-lg font-bold text-primary">${tx.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'debts' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pending Debts</h2>
            <button 
              onClick={() => setModalType('debt')}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
            >
              + New Debt
            </button>
          </div>
          <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center">
            <p className="text-xs text-primary font-bold uppercase tracking-wider">Total Owed to You</p>
            <p className="text-3xl font-black text-primary">${metrics.totalDebt.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            {data.debts.map(debt => (
              <div key={debt.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold">{debt.customerName}</p>
                  <p className="text-xs text-slate-500">{new Date(debt.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-rose-600">${debt.amount.toFixed(2)}</p>
                  <button 
                    onClick={() => setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== debt.id) }))}
                    className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                </div>
              </div>
            ))}
            {data.debts.length === 0 && (
              <p className="text-center text-slate-500 py-12">No pending debts! Great job.</p>
            )}
          </div>
        </section>
      )}

      {activeTab === 'stock' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Inventory Status</h2>
            <button 
              onClick={() => setModalType('stock')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              + Add Item
            </button>
          </div>
          <div className="grid gap-3">
            {data.inventory.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">inventory</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)} per unit</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${item.quantity < 10 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                    {item.quantity}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">Available</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <Modal 
        isOpen={modalType === 'sale' || modalType === 'expense'} 
        onClose={() => setModalType(null)} 
        title={modalType === 'expense' ? 'Log Expense' : 'Log New Sale'}
      >
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
            <input 
              name="amount" 
              type="number" 
              step="0.01" 
              autoFocus 
              required 
              className="w-full text-2xl font-bold border-0 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:ring-0 focus:border-primary px-0"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <input 
              name="description" 
              type="text" 
              required 
              className="w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800"
              placeholder={modalType === 'expense' ? 'e.g., Rent, Electricity' : 'e.g., Bread, Milk'}
            />
          </div>
          {modalType === 'sale' ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="relative flex items-center justify-center p-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                  <input type="radio" name="method" value={PaymentMethod.CASH} defaultChecked className="hidden" />
                  <span className="text-sm font-bold">Cash</span>
                </label>
                <label className="relative flex items-center justify-center p-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                  <input type="radio" name="method" value={PaymentMethod.POS} className="hidden" />
                  <span className="text-sm font-bold">POS</span>
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
              <select name="category" className="w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800">
                <option value="General">General</option>
                <option value="Utility">Utility</option>
                <option value="Rent">Rent</option>
                <option value="Restock">Restock</option>
                <option value="Salary">Salary</option>
              </select>
            </div>
          )}
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 mt-4 active:scale-95 transition-transform">
            Save {modalType === 'expense' ? 'Expense' : 'Sale'}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={modalType === 'debt'} 
        onClose={() => setModalType(null)} 
        title="Add Customer Debt"
      >
        <form onSubmit={handleAddDebt} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
            <input 
              name="customerName" 
              type="text" 
              required 
              autoFocus
              className="w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800"
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Owed ($)</label>
            <input 
              name="amount" 
              type="number" 
              step="0.01" 
              required 
              className="w-full text-2xl font-bold border-0 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:ring-0 focus:border-primary px-0"
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 mt-4 active:scale-95 transition-transform">
            Record Debt
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={modalType === 'stock'} 
        onClose={() => setModalType(null)} 
        title="Add New Stock Item"
      >
        <form onSubmit={handleAddStock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              autoFocus
              className="w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800"
              placeholder="e.g., Cooking Oil"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
              <input 
                name="quantity" 
                type="number" 
                required 
                min="0"
                className="w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price per Unit ($)</label>
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                required 
                min="0"
                className="w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800"
                placeholder="0.00"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 mt-4 active:scale-95 transition-transform">
            Save Item
          </button>
        </form>
      </Modal>
    </Layout>
  );
};

export default App;
