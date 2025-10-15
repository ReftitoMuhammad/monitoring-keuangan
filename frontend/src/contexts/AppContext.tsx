"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Definisikan tipe data yang akan kita gunakan di seluruh aplikasi
export interface Wallet { id: number; name: string; balance: number; currency: string; bank_name?: string; }
export interface Category { id: number; name: string; type: 'income' | 'expense'; }
export interface Transaction { id: number; wallet_id: number; category_id: number; amount: number; description?: string; transaction_date: string; type: 'income' | 'expense'; }
export interface User { name: string; email: string; currency: string; profile_image_url?: string; }

// 2. Tipe untuk nilai yang akan disediakan oleh context
interface AppContextType {
  user: User | null;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  isLoading: boolean;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'type'>) => void;
  addCategory: (category: { name: string; type: "income" | "expense" }) => void;
  editCategory?: (id: number, updatedData: { name: string; type: "income" | "expense" }) => void;
  deleteCategory: (id: number) => void;
  editUser?: (user: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Data awal untuk pengguna tamu baru
const initialGuestData = {
  user: { name: "Pengguna Tamu", email: "guest@aturuang.com", currency: "IDR", profile_image_url: "" },
  wallets: [
    { id: 1, name: "Dompet Utama", balance: 150000, currency: "IDR", bank_name: "Tunai" },
    { id: 2, name: "Rekening Bank", balance: 2500000, currency: "IDR", bank_name: "BCA" },
  ],
  categories: [
    { id: 1, name: "Makanan", type: "expense" as const },
    { id: 2, name: "Transportasi", type: "expense" as const },
    { id: 3, name: "Gaji", type: "income" as const },
  ],
  transactions: [
    { id: 1, wallet_id: 1, category_id: 1, amount: 50000, description: "Makan siang", transaction_date: "2023-10-01", type: "expense" as const },
    { id: 2, wallet_id: 2, category_id: 3, amount: 5000000, description: "Gaji Bulanan", transaction_date: "2023-10-01", type: "income" as const },
    { id: 3, wallet_id: 1, category_id: 2, amount: 20000, description: "Ojek online", transaction_date: "2023-10-02", type: "expense" as const },
  ],
};

// 4. Komponen Provider utama
export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Saat aplikasi dimuat, ambil semua data dari localStorage
    setIsLoading(true);
    const storedUser = localStorage.getItem('guest_user');
    const storedWallets = localStorage.getItem('guest_wallets');
    const storedCategories = localStorage.getItem('guest_categories');
    const storedTransactions = localStorage.getItem('guest_transactions');

    if (!storedUser) { // Jika ini pertama kalinya tamu masuk
      setUser(initialGuestData.user);
      setWallets(initialGuestData.wallets);
      setCategories(initialGuestData.categories);
      setTransactions(initialGuestData.transactions);
      localStorage.setItem('guest_user', JSON.stringify(initialGuestData.user));
      localStorage.setItem('guest_wallets', JSON.stringify(initialGuestData.wallets));
      localStorage.setItem('guest_categories', JSON.stringify(initialGuestData.categories));
      localStorage.setItem('guest_transactions', JSON.stringify(initialGuestData.transactions));
    } else {
      setUser(JSON.parse(storedUser));
      setWallets(JSON.parse(storedWallets!));
      setCategories(JSON.parse(storedCategories!));
      setTransactions(JSON.parse(storedTransactions!));
    }
    setIsLoading(false);
  }, []);
  
  const addWallet = (newWalletData: Omit<Wallet, 'id'>) => {
    setWallets(prev => {
      const newWallet = { ...newWalletData, id: Date.now() };
      const updated = [...prev, newWallet];
      localStorage.setItem('guest_wallets', JSON.stringify(updated));
      return updated;
    });
  };

  const addTransaction = (newTransactionData: Omit<Transaction, 'id' | 'type'>) => {
    // Cari tipe kategori
    const category = categories.find(c => c.id === newTransactionData.category_id);
    if (!category) return;

    setTransactions(prev => {
      const newTransaction = { ...newTransactionData, id: Date.now(), type: category.type };
      const updated = [...prev, newTransaction];
      localStorage.setItem('guest_transactions', JSON.stringify(updated));
      return updated;
    });
    // Perbarui saldo dompet
    setWallets(prev => {
        const updated = prev.map(w => {
            if (w.id === newTransactionData.wallet_id) {
                return {
                    ...w,
                    balance: category.type === 'income' 
                        ? w.balance + newTransactionData.amount 
                        : w.balance - newTransactionData.amount
                };
            }
            return w;
        });
        localStorage.setItem('guest_wallets', JSON.stringify(updated));
        return updated;
    });
  };

  const addCategory = (newCategoryData: Omit<Category, 'id'>) => {
    setCategories(prev => {
      const newCategory = { ...newCategoryData, id: Date.now() };
      const updated = [...prev, newCategory];
      localStorage.setItem('guest_categories', JSON.stringify(updated));
      return updated;
    });
  };

  const editCategory = (id: number, updatedData: { name: string; type: "income" | "expense" }) => {
    setCategories(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updatedData } : c));
      localStorage.setItem('guest_categories', JSON.stringify(updated));
      return updated;
    });
  };
  
  const deleteCategory = (id: number) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('guest_categories', JSON.stringify(updated));
      return updated;
    });
    // Hapus juga transaksi terkait kategori ini
    setTransactions(prev => {
      const updated = prev.filter(t => t.category_id !== id);
      localStorage.setItem('guest_transactions', JSON.stringify(updated));
      return updated;
    });
  }

  const editUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('guest_user', JSON.stringify(updatedUser));
  };

  const value = { user, wallets, categories, transactions, isLoading, addWallet, addTransaction, addCategory, editCategory, deleteCategory, editUser };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 6. Hook kustom untuk memudahkan penggunaan
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
