"use client";

import { useForm, Resolver } from "react-hook-form"; // [FIX] Impor tipe 'Resolver'
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionFormValues, transactionSchema } from "@/lib/schemas/transaction-schema";
import api from "@/lib/api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Wallet { id: number; name: string; }
interface Category { id: number; name: string; }

export function TransactionFormDialog({ children, onSuccess }: { children: React.ReactNode; onSuccess: () => void; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<TransactionFormValues>({
    // [FIX] Secara eksplisit melakukan 'casting' pada resolver. Ini adalah
    // cara yang paling tegas untuk memberitahu TypeScript agar mempercayai
    // tipe yang kita berikan, dan ini akan menyelesaikan semua error terkait.
    resolver: zodResolver(transactionSchema) as Resolver<TransactionFormValues>,
    defaultValues: { transaction_date: new Date(), description: "", amount: undefined },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [walletsRes, categoriesRes] = await Promise.all([
            api.get('/api/wallets'),
            api.get('/api/categories'),
          ]);
          setWallets(walletsRes.data.data || []);
          setCategories(categoriesRes.data.data || []);
        } catch (error) {
          console.error("Failed to fetch dropdown data:", error);
          toast.error("Gagal memuat data dompet & kategori.");
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const onSubmit = async (values: TransactionFormValues) => {
    const payload = {
      ...values,
      wallet_id: Number(values.wallet_id),
      category_id: Number(values.category_id),
    };
    try {
      await api.post("/api/transactions", payload);
      toast.success("Transaksi berhasil dicatat.");
      onSuccess();
      setIsOpen(false);
      form.reset({ transaction_date: new Date(), amount: undefined, description: "", wallet_id: undefined, category_id: undefined });
    } catch (error: unknown) {
        console.error("Failed to create transaction:", error);
        let errorMsg = "Gagal mencatat transaksi.";
        if (typeof error === "object" && error !== null && "response" in error) {
           const axiosError = error as { response?: { data?: { error?: string } } };
           errorMsg = axiosError.response?.data?.error || errorMsg;
        }
        toast.error("Terjadi Kesalahan", {
        description: errorMsg,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount & Description */}
            <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Jumlah</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Input placeholder="cth: Makan siang" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            {/* Wallet & Category */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="wallet_id" render={({ field }) => (
                  <FormItem><FormLabel>Dompet</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih dompet" /></SelectTrigger></FormControl><SelectContent>{wallets.map(w=><SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="category_id" render={({ field }) => (
                  <FormItem><FormLabel>Kategori</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl><SelectContent>{categories.map(c=><SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )}/>
            </div>
            {/* Date */}
            <FormField control={form.control} name="transaction_date" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Tanggal Transaksi</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
            )}/>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}