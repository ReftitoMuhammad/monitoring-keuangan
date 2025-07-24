"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      // Jika ada token, arahkan ke dashboard
      router.replace('/dashboard');
    } else {
      // Jika tidak ada token, arahkan ke halaman login
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
