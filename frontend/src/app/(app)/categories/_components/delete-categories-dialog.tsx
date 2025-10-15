"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppContext } from "@/contexts/AppContext";
import { toast } from "sonner";

interface DeleteCategoryDialogProps {
  children: React.ReactNode;
  categoryId: number;
  onSuccess?: () => void;
}

export function DeleteCategoryDialog({ children, categoryId, onSuccess }: DeleteCategoryDialogProps) {
  const { deleteCategory } = useAppContext();

  const handleDelete = () => {
    deleteCategory(categoryId);
    toast.success("Kategori berhasil dihapus.");
    if (onSuccess) onSuccess();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Aksi ini tidak bisa dibatalkan. Menghapus kategori ini tidak akan menghapus
            transaksi yang sudah ada yang menggunakannya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Lanjutkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}