
export enum TransactionType {
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  DEBT = 'DEBT'
}

export enum PaymentMethod {
  CASH = 'CASH',
  POS = 'POS',
  CREDIT = 'CREDIT'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  timestamp: number;
  method: PaymentMethod;
  category?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Debt {
  id: string;
  customerName: string;
  amount: number;
  timestamp: number;
}

export interface AppData {
  transactions: Transaction[];
  inventory: InventoryItem[];
  debts: Debt[];
}
