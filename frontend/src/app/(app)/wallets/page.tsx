"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { toast } from "sonner";
import { WalletFormDialog } from './_components/wallet-form-dialog'; // 1. Impor komponen dialog
import { LoadingSpinner } from '@/components/ui/loadingspinner';

// Definisikan tipe data Wallet
interface Wallet {
  id: number;
  name: string;
  balance: number;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/wallets');
      setWallets(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      toast.error("Gagal memuat data", {
        description: "Tidak bisa mengambil daftar dompet dari server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleDelete = async (walletId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dompet ini?')) return;

    try {
      await api.delete(`/api/wallets/${walletId}`);
      toast.success("Sukses", { description: "Dompet berhasil dihapus." });
      fetchWallets(); // Muat ulang data setelah berhasil
    } catch (error) {
      console.error("Failed to delete wallet:", error);
      toast.error("Gagal menghapus", { description: "Dompet tidak bisa dihapus." });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelola Dompet</h1>
        {/* 2. Gunakan Dialog untuk tombol Tambah */}
        <WalletFormDialog mode="create" onSuccess={fetchWallets}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Dompet
          </Button>
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
                <TableCell className="font-medium">{wallet.name}</TableCell>
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
                      {/* 3. Gunakan Dialog untuk menu Edit */}
                      <WalletFormDialog mode="edit" initialData={wallet} onSuccess={fetchWallets}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenuItem>
                      </WalletFormDialog>
                      <DropdownMenuItem onClick={() => handleDelete(wallet.id)} className="text-red-500">
                        Hapus
                      </DropdownMenuItem>
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
