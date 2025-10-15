"use client";

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { TransactionCard } from './_components/transaction-card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TransactionFormDialog } from './_components/transaction-form-dialog';
import { useAppContext } from '@/contexts/AppContext';

export default function TransactionsPage() {
  const { transactions, categories, wallets, isLoading } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Gabungkan data transaksi dengan kategori & wallet
  const mergedTransactions = useMemo(() => {
    return transactions.map(tx => {
      const category = categories.find(c => c.id === tx.category_id) || { id: 0, name: 'Tidak diketahui', type: 'expense' };
      const wallet = wallets.find(w => w.id === tx.wallet_id) || { id: 0, name: 'Tidak diketahui', currency: 'IDR' };
      return {
        ...tx,
        category,
        wallet,
      };
    });
  }, [transactions, categories, wallets]);

  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = mergedTransactions.filter(tx =>
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOrder) {
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());
      case 'highest':
        return filtered.sort((a, b) => b.amount - a.amount);
      case 'lowest':
        return filtered.sort((a, b) => a.amount - b.amount);
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    }
  }, [mergedTransactions, searchQuery, sortOrder]);

  const formatCurrency = (value: number, currency = 'IDR') =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

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
              <TransactionFormDialog transactionType="income" onSuccess={() => {}}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Pemasukan / Saldo
                </DropdownMenuItem>
              </TransactionFormDialog>
              <TransactionFormDialog transactionType="expense" onSuccess={() => {}}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Pengeluaran
                </DropdownMenuItem>
              </TransactionFormDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari transaksi..."
            className="w-full rounded-lg bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:w-auto md:px-4">
              <ArrowUpDown className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Urutkan</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOrder('newest')}>Terbaru</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('oldest')}>Terlama</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('highest')}>Jumlah Tertinggi</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('lowest')}>Jumlah Terendah</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            {filteredAndSortedTransactions.map((tx) => (
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
                  {tx.category.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, tx.wallet.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tampilan Kartu untuk Mobile */}
      <div className="md:hidden flex flex-col gap-3 w-full">
        {filteredAndSortedTransactions.map((tx) => (
          <TransactionCard key={tx.id} transaction={{ ...tx, description: tx.description ?? "" }} />
        ))}
      </div>
    </div>
  );
}