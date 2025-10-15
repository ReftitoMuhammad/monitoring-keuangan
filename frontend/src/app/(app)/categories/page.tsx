"use client";

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CategoryFormDialog } from './_components/category-form-dialog';
import { DeleteCategoryDialog } from './_components/delete-categories-dialog'; 
import { EditCategoryDialog } from './_components/edit-category-dialog';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { useAppContext } from '@/contexts/AppContext';

export default function CategoriesPage() {
  const { categories, isLoading } = useAppContext();

  // Handler dummy, implementasikan di context jika ingin hapus kategori
  const handleDelete = (categoryId: number) => {
    alert('Fitur hapus kategori belum diimplementasikan di context.');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelola Kategori</h1>
        <CategoryFormDialog onSuccess={() => {}}>
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
                      <EditCategoryDialog category={category} onSuccess={() => {}}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenuItem>
                      </EditCategoryDialog>
                      <DeleteCategoryDialog categoryId={category.id}>
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