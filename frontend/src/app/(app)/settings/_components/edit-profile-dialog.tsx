"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormValues, profileSchema } from "@/lib/schemas/profile-schema";
import api from "@/lib/api";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";

interface EditProfileDialogProps {
  children: React.ReactNode;
  user: { name: string; email: string; } | null;
  onSuccess: () => void;
}

export function EditProfileDialog({ children, user, onSuccess }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // [REVISI] Buat satu payload dinamis
      const payload: { name: string; profile_image_url?: string } = {
        name: values.name,
      };

      if (imagePreview) {
        payload.profile_image_url = imagePreview;
      }

      // [REVISI] Lakukan satu panggilan API saja
      await api.put("/api/profile", payload);

      toast.success("Profil berhasil diperbarui.");
      onSuccess();
      setIsOpen(false);
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error("Gagal memperbarui profil.", { description: error.response.data.error });
      } else {
        toast.error("Gagal memperbarui profil.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Profil</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={imagePreview || `https://placehold.co/128x128/E2E8F0/475569?text=${user?.name.charAt(0)}`} alt={user?.name} />
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Ubah Foto
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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