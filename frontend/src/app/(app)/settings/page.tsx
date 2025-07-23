"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// TODO: Tambahkan form untuk ubah nama, currency, dan password nanti

export default function SettingsPage() {
  const router = useRouter();
  
  const handleLogout = () => {
    Cookies.remove('token');
    router.replace('/');
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Pengaturan</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Sesuaikan tampilan aplikasi sesuai preferensi Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Mode Gelap</p>
              <p className="text-xs text-muted-foreground">Aktifkan atau non-aktifkan mode gelap.</p>
            </div>
            <ThemeToggle />
          </div>
          {/* Opsi Currency bisa ditambahkan di sini */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Ubah Nama & Profil</Button>
          <Button variant="outline" className="ml-4">Ubah Password</Button>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={handleLogout}>Keluar dari Akun</Button>
    </div>
  );
}