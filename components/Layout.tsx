
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userName }) => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
              <img 
                alt="Profile" 
                className="w-full h-full object-cover" 
                src="https://picsum.photos/seed/sarah/100/100" 
              />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Good morning, {userName}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{dateStr}</p>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 pb-6 pt-2 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'home' ? 'fill' : ''}`}>home</span>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'sales' ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'sales' ? 'fill' : ''}`}>receipt</span>
            <span className="text-[10px] font-medium">Sales</span>
          </button>
          <button 
            onClick={() => setActiveTab('debts')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'debts' ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'debts' ? 'fill' : ''}`}>credit_score</span>
            <span className="text-[10px] font-medium">Debts</span>
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'stock' ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'stock' ? 'fill' : ''}`}>storefront</span>
            <span className="text-[10px] font-medium">Stock</span>
          </button>
          <button 
            onClick={() => setActiveTab('more')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'more' ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'more' ? 'fill' : ''}`}>settings</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
