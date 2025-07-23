"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Edit } from 'lucide-react';
import { EditProfileDialog } from './_components/edit-profile-dialog';
import { ChangePasswordDialog } from './_components/change-password-dialog';

interface User {
  name: string;
  email: string;
  profile_image_url?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  
  const handleLogout = () => {
    Cookies.remove('token');
    router.replace('/');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Pengaturan</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Akun</CardTitle>
            <CardDescription>Lihat dan perbarui informasi akun Anda.</CardDescription>
          </div>
          <EditProfileDialog user={user} onSuccess={fetchUser}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </EditProfileDialog>
        </CardHeader>
        <CardContent>
          <div className="hidden md:flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://placehold.co/128x128/E2E8F0/475569?text=${user?.name.charAt(0)}`} alt={user?.name} />
              <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-xl font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center text-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://placehold.co/128x128/E2E8F0/475569?text=${user?.name.charAt(0)}`} alt={user?.name} />
              <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-xl font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Mode Gelap</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordDialog>
            <Button variant="outline" className="w-full justify-start">Ubah Password</Button>
          </ChangePasswordDialog>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={handleLogout}>Keluar dari Akun</Button>
    </div>
  );
}