"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Scale } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { DynamicGreeting } from './_components/greeting';
import { CurrencyWalletsDialog } from './_components/currency-wallet-dialog';
import { toast } from 'sonner';

// Definisikan tipe data
interface Wallet { id: number; name: string; balance: number; bank_name?: string; currency: string; }
interface User { name: string; currency: string; }
interface Transaction { id: number; description: string; amount: number; transaction_date: string; wallet: Wallet; category: { name: string; type: 'income' | 'expense'; }; }

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // [REVISI] Gunakan Promise.allSettled agar lebih tangguh
        const results = await Promise.allSettled([
          api.get('/api/profile'),
          api.get('/api/wallets'),
          api.get('/api/transactions'),
          api.get('/api/exchange-rates'),
        ]);

        // Proses hasil profil
        if (results[0].status === 'fulfilled') {
          setUser(results[0].value.data.user);
        } else {
          console.error("Gagal memuat profil:", results[0].reason);
        }

        // Proses hasil dompet
        if (results[1].status === 'fulfilled') {
          setWallets(results[1].value.data.data || []);
        } else {
          console.error("Gagal memuat dompet:", results[1].reason);
        }

        // Proses hasil transaksi
        if (results[2].status === 'fulfilled') {
          setRecentTransactions((results[2].value.data.data || []).slice(0, 5));
        } else {
          console.error("Gagal memuat transaksi:", results[2].reason);
        }
        
        // Proses hasil kurs mata uang
        if (results[3].status === 'fulfilled') {
          setExchangeRates(results[3].value.data.data);
        } else {
          console.error("Gagal memuat kurs mata uang:", results[3].reason);
        }

      } catch (error) {
        console.error("Gagal, ini errornya:", error)
        toast.error("Terjadi kesalahan saat memuat data dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const currencyTotals = useMemo(() => {
    return wallets.reduce((acc, wallet) => {
      acc[wallet.currency] = (acc[wallet.currency] || 0) + wallet.balance;
      return acc;
    }, {} as Record<string, number>);
  }, [wallets]);

  const grandTotalInDefaultCurrency = useMemo(() => {
    if (!exchangeRates || !user) return 0;
    const defaultCurrency = user.currency;
    const baseRate = exchangeRates[defaultCurrency];
    if (!baseRate) return 0;

    return Object.entries(currencyTotals).reduce((total, [currency, amount]) => {
      const currencyRate = exchangeRates[currency];
      if (!currencyRate) return total;
      const amountInUSD = amount / currencyRate;
      return total + (amountInUSD * baseRate);
    }, 0);
  }, [currencyTotals, exchangeRates, user]);

  const formatCurrency = (value: number, currency: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <DynamicGreeting name={user?.name} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Scale /> Estimasi Total Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(grandTotalInDefaultCurrency, user?.currency || 'IDR')}</p>
            <p className="text-xs text-muted-foreground">Total gabungan dari semua dompet dikonversi ke mata uang default Anda.</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Rincian Saldo per Mata Uang</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(currencyTotals).map(([currency, total]) => (
            <Card key={currency}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Total Saldo {currency}</CardTitle>
                <CurrencyWalletsDialog
                  currency={currency}
                  wallets={wallets.filter(w => w.currency === currency)}
                />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{formatCurrency(total, currency)}</p></CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                  <p className="text-sm text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {tx.wallet.name}</p>
                </div>
                <div className={`font-semibold shrink-0 ${tx.category.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.category.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, tx.wallet.currency)}
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
