"use client";

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { WalletFormDialog } from './_components/wallet-form-dialog';
import { DeleteWalletDialog } from './_components/delete-wallet-dialog'; 
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { useAppContext } from '@/contexts/AppContext';

export default function WalletsPage() {
  const { user, wallets, isLoading } = useAppContext();

  const formatCurrency = (value: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Dummy handler, sesuaikan jika ingin menghapus dari context
  const handleDelete = (walletId: number) => {
    // Implementasikan penghapusan dompet di context jika sudah ada
    alert('Fitur hapus dompet belum diimplementasikan di context.');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelola Dompet</h1>
        <WalletFormDialog mode="create" onSuccess={() => {}} user={user}>
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
                <TableCell className="text-right">{formatCurrency(wallet.balance, wallet.currency)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <WalletFormDialog mode="edit" initialData={wallet} onSuccess={() => {}} user={user}>
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
