"use client";

// import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormValues, registerSchema } from "@/lib/schemas/register-schema";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Registrasi berhasil!", {
        description: "Anda akan diarahkan ke halaman login.",
      });
      router.push("/"); // Arahkan ke halaman login
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error("Registrasi Gagal", { description: err.response.data.error });
      } else {
        toast.error("Registrasi Gagal", { description: "Terjadi kesalahan yang tidak terduga." });
      }
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Wallet className="mx-auto h-12 w-12" />
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>Isi form di bawah untuk mendaftar.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nama</FormLabel><FormControl><Input placeholder="Nama Lengkap Anda" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="nama@email.com" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="confirmPassword" render={({ field }) => ( <FormItem><FormLabel>Konfirmasi Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-4">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Mendaftar..." : "Daftar"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Sudah punya akun? <Link href="/login" className="underline">Masuk</Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
