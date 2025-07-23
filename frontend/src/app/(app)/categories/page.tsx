"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { CategoryFormDialog } from './_components/category-form-dialog';
import { DeleteCategoryDialog } from './_components/delete-categories-dialog'; 
import { EditCategoryDialog } from './_components/edit-category-dialog';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Gagal memuat data kategori.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/api/categories/${categoryId}`);
      toast.success("Kategori berhasil dihapus.");
      fetchCategories();
    } catch (error: unknown) {
        if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { error?: string } } };
        const errorMsg = err.response?.data?.error || "Kategori tidak bisa dihapus.";
        toast.error("Gagal menghapus", { description: errorMsg });
    } else {
    toast.error("Gagal menghapus", { description: "Terjadi kesalahan tidak diketahui." });
  }
}
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelola Kategori</h1>
        <CategoryFormDialog onSuccess={fetchCategories}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        </CategoryFormDialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge variant={category.type === 'income' ? 'default' : 'destructive'}>
                    {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditCategoryDialog category={category} onSuccess={fetchCategories}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenuItem>
                      </EditCategoryDialog>
                      <DeleteCategoryDialog onConfirm={() => handleDelete(category.id)}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                          Hapus
                        </DropdownMenuItem>
                      </DeleteCategoryDialog>
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