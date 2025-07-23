"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { TransactionCard } from './_components/transaction-card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TransactionFormDialog } from './_components/transaction-form-dialog';

// Definisikan tipe data
interface Wallet { id: number; name: string; }
interface Category { id: number; name: string; type: 'income' | 'expense'; }
interface Transaction {
  id: number;
  description: string;
  amount: number;
  transaction_date: string;
  wallet: Wallet;
  category: Category;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/transactions');
      setTransactions(response.data.data || []);
    } catch (error: unknown) {
      console.error("Terjadi error:", error);
      toast.error("Gagal memuat data transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold md:mb-4">Riwayat Transaksi</h1>
        
        {/* Tombol Tambah Transaksi untuk Desktop */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Transaksi
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <TransactionFormDialog transactionType="income" onSuccess={fetchTransactions}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Pemasukan / Saldo
                </DropdownMenuItem>
              </TransactionFormDialog>
              <TransactionFormDialog transactionType="expense" onSuccess={fetchTransactions}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Pengeluaran
                </DropdownMenuItem>
              </TransactionFormDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tampilan Tabel untuk Desktop */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="font-medium">{tx.description || tx.category.name}</div>
                  <div className="text-sm text-muted-foreground">{formatDate(tx.transaction_date)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={tx.category.type === 'income' ? 'default' : 'destructive'}>
                    {tx.category.name}
                  </Badge>
                  <div className="text-sm text-muted-foreground">{tx.wallet.name}</div>
                </TableCell>
                <TableCell className={`text-right font-medium ${tx.category.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.category.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* [REVISI] Tampilan Kartu untuk Mobile */}
      <div className="md:hidden flex flex-col gap-3 w-full">
        {transactions.map((tx) => (
          <TransactionCard key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
}