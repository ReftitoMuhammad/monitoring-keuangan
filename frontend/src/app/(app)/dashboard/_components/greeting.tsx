"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon, CloudSun } from 'lucide-react';

// [UBAH] Tambahkan 'name' ke dalam props
interface DynamicGreetingProps {
  name?: string;
}

export function DynamicGreeting({ name }: DynamicGreetingProps) {
  const [greeting, setGreeting] = useState({ text: 'Selamat Datang', icon: <Sun /> });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({ text: 'Selamat Pagi', icon: <CloudSun className="h-8 w-8 text-yellow-500" /> });
    } else if (hour >= 12 && hour < 15) {
      setGreeting({ text: 'Selamat Siang', icon: <Sun className="h-8 w-8 text-orange-500" /> });
    } else if (hour >= 15 && hour < 18) {
      setGreeting({ text: 'Selamat Sore', icon: <CloudSun className="h-8 w-8 text-amber-600" /> });
    } else {
      setGreeting({ text: 'Selamat Malam', icon: <Moon className="h-8 w-8 text-slate-400" /> });
    }
  }, []);

  if (!isMounted) {
    return <div className="h-[52px] w-[250px] animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="flex items-center gap-4">
      {greeting.icon}
      <div>
        <h1 className="text-2xl font-bold">{greeting.text},</h1>
        {/* [UBAH] Tampilkan nama pengguna di sini */}
        <p className="text-lg text-muted-foreground">{name || 'Pengguna'}</p>
      </div>
    </div>
  );
}