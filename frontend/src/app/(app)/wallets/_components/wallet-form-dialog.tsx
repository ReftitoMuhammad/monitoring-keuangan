"use client";

import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletFormValues, walletSchema } from "@/lib/schemas/wallet-schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Wallet {
  id: number;
  name: string;
  balance: number;
  bank_name?: string;
  currency: string;
}

interface WalletFormDialogProps {
  children: React.ReactNode; 
  mode: "create" | "edit";
  initialData?: Wallet;
  onSuccess: () => void;
  user: { currency?: string } | null; 
}

  // const [isOpen, setIsOpen] = useState(false);

  export function WalletFormDialog({ children, mode, initialData, onSuccess, user }: WalletFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema) as Resolver<WalletFormValues>,
    defaultValues: {
      name: initialData?.name || "",
      bank_name: initialData?.bank_name || "",
      currency: initialData?.currency || user?.currency || "IDR",
      balance: initialData?.balance || undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: WalletFormValues) => {
    try {
      if (mode === "create") {
        await api.post("/api/wallets", values);
        toast.success("Dompet baru berhasil dibuat.");
      } else {
        await api.put(`/api/wallets/${initialData?.id}`, { 
            name: values.name, 
            bank_name: values.bank_name 
        });
        toast.success("Dompet berhasil diperbarui.");
      }
      onSuccess(); // Panggil fungsi refresh
      setIsOpen(false); // Tutup dialog
      form.reset({ name: "", balance: undefined });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Terjadi kesalahan", {
        description: "Gagal menyimpan data. Silakan coba lagi.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Dompet Baru" : "Edit Dompet"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi detail dompet baru Anda di bawah ini."
              : `Mengubah detail untuk dompet: ${initialData?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Dompet</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Dompet Utama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bank (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: BCA, GoPay, Jago" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Uang</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="IDR">IDR - Rupiah</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Awal (Opsional)</FormLabel>
                    <FormControl>
                      {/* [FIX] Mengganti value dengan ?? '' untuk menangani kasus undefined */}
                      <Input type="number" placeholder="0" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

