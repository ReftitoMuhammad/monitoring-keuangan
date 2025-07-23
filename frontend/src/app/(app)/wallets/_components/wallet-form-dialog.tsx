"use client";

import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletFormValues, walletSchema } from "@/lib/schemas/wallet-schema";
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
}

interface WalletFormDialogProps {
  children: React.ReactNode; // Tombol atau link yang memicu dialog
  mode: "create" | "edit";
  initialData?: Wallet;
  onSuccess: () => void; // Fungsi untuk refresh data di halaman utama
}

export function WalletFormDialog({
  children,
  mode,
  initialData,
  onSuccess,
}: WalletFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema) as Resolver<WalletFormValues>,
    defaultValues: {
      name: initialData?.name || "",
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
        await api.put(`/api/wallets/${initialData?.id}`, { name: values.name });
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
