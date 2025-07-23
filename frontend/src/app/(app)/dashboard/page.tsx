"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { DynamicGreeting } from './_components/greeting';

// Definisikan tipe data yang lebih lengkap
interface Wallet { id: number; name: string; balance: number; }
interface Category { id: number; name: string; type: 'income' | 'expense'; }
interface Transaction {
  id: number;
  description: string;
  amount: number;
  transaction_date: string;
  wallet: Wallet;
  category: Category;
}
interface User { name: string; }

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, walletsRes, transactionsRes] = await Promise.all([
          api.get('/api/profile'),
          api.get('/api/wallets'),
          api.get('/api/transactions'),
        ]);

        setUser(profileRes.data.user);
        const fetchedWallets = walletsRes.data.data || [];
        const fetchedTransactions = transactionsRes.data.data || [];

        setWallets(fetchedWallets);
        setRecentTransactions(fetchedTransactions.slice(0, 5));

        const total = fetchedWallets.reduce(
          (sum: number, wallet: Wallet) => sum + wallet.balance,
          0
        );
        setTotalBalance(total);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <DynamicGreeting name={user?.name} />

      {/* Bagian Ringkasan Saldo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">dari {wallets.length} dompet</p>
          </CardContent>
        </Card>
      </div>

      {/* [BARU] Bagian Rincian Dompet */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dompet Anda</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader>
                <CardTitle className="text-lg">{wallet.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Kartu Ringkasan Transaksi */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Berikut adalah 5 transaksi terakhir Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{tx.description || tx.category.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(tx.transaction_date)} • {tx.wallet.name}</p>
                </div>
                <div className={`font-semibold shrink-0 ${tx.category.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.category.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/transactions">
              Lihat Semua Transaksi <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
