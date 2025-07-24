"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { toast } from "sonner";
import { WalletFormDialog } from './_components/wallet-form-dialog';
import { DeleteWalletDialog } from './_components/delete-wallet-dialog'; 
import { LoadingSpinner } from '@/components/ui/loadingspinner';

interface User { currency?: string; }
interface Wallet { id: number; name: string; balance: number; bank_name?: string; currency: string; }

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/wallets');
      setWallets(response.data.data || []);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg = err.response?.data?.error || "Silakan coba muat ulang halaman.";
      toast.error("Gagal memuat data dompet", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

 const handleDelete = async (walletId: number) => {
    try {
      await api.delete(`/api/wallets/${walletId}`);
      toast.success("Dompet berhasil dihapus.");
      fetchData(); // Auto-refresh data
    } catch (error) {
      console.error("Gagal menghapus dompet:", error);
      toast.error("Gagal menghapus dompet.");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  }; 

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, walletsRes] = await Promise.all([
        api.get('/api/profile'),
        api.get('/api/wallets'),
      ]);
      setUser(profileRes.data.user);
      setWallets(walletsRes.data.data || []);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast.error("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelola Dompet</h1>
        <WalletFormDialog mode="create" onSuccess={fetchData} user={user}>
          <Button><PlusCircle className="mr-2 h-4 w-4" />Tambah Dompet</Button>
        </WalletFormDialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Dompet</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell className="font-medium">{wallet.name}
                  {wallet.bank_name && (
                    <div className="text-sm text-muted-foreground">{wallet.bank_name}</div>
                  )}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(wallet.balance)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <WalletFormDialog mode="edit" initialData={wallet} onSuccess={fetchData} user={user}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenuItem>
                      </WalletFormDialog>
                      <DeleteWalletDialog onConfirm={() => handleDelete(wallet.id)}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">Hapus</DropdownMenuItem>
                      </DeleteWalletDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
