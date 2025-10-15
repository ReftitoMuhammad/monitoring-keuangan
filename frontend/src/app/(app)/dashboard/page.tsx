"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Scale } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { DynamicGreeting } from './_components/greeting';
import { CurrencyWalletsDialog } from './_components/currency-wallet-dialog';
import { useAppContext } from '@/contexts/AppContext'; // Tambahkan ini

export default function DashboardPage() {
  const { user, wallets, transactions, isLoading } = useAppContext();

  // Ambil 5 transaksi terbaru, urutkan berdasarkan tanggal terbaru
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Hitung total saldo per mata uang
  const currencyTotals = useMemo(() => {
    return wallets.reduce((acc, wallet) => {
      acc[wallet.currency] = (acc[wallet.currency] || 0) + wallet.balance;
      return acc;
    }, {} as Record<string, number>);
  }, [wallets]);

  // Tidak ada kurs, jadi grand total hanya jumlahkan semua saldo (asumsi satu mata uang default)
  const grandTotal = useMemo(() => {
    if (!user) return 0;
    return currencyTotals[user.currency] || 0;
  }, [currencyTotals, user]);

  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);

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
            <p className="text-3xl font-bold">{formatCurrency(grandTotal, user?.currency || 'IDR')}</p>
            <p className="text-xs text-muted-foreground">Total gabungan dari semua dompet dalam mata uang default Anda.</p>
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
                  <p className="font-medium truncate">{tx.description || tx.category_id}</p>
                  <p className="text-sm text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {wallets.find(w => w.id === tx.wallet_id)?.name}</p>
                </div>
                <div className={`font-semibold shrink-0 ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, wallets.find(w => w.id === tx.wallet_id)?.currency || 'IDR')}
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
