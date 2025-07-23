"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api'; // Gunakan API client kita
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

// Definisikan tipe data agar sesuai dengan backend
interface User {
  id: number;
  name: string;
  email: string;
}

interface Wallet {
  id: number;
  name: string;
  balance: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data profil dan dompet secara bersamaan
        const [profileRes, walletsRes] = await Promise.all([
          api.get('/api/profile'),
          api.get('/api/wallets'),
        ]);

        setUser(profileRes.data.user);
        setWallets(walletsRes.data.data || []);

        // Hitung total saldo
        const total = (walletsRes.data.data || []).reduce(
          (sum: number, wallet: Wallet) => sum + wallet.balance,
          0
        );
        setTotalBalance(total);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Di sini Anda bisa menangani error, misalnya menampilkan notifikasi
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

 if (isLoading) return <LoadingSpinner />;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Selamat datang kembali, {user?.name}!</p>

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
        {/* Kartu lain (Pemasukan/Pengeluaran) bisa ditambahkan di sini */}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Dompet Anda</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader>
                <CardTitle>{wallet.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
