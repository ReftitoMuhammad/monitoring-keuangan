"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Home, LogOut, Wallet as WalletIcon, Shapes, ArrowRightLeft, Plus, Settings, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionFormDialog } from '@/app/(app)/transactions/_components/transaction-form-dialog';

export default function ProtectedLayout({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    router.replace('/');
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname.startsWith(href) ? 'bg-muted text-primary' : ''}`}>
      {children}
    </Link>
  );

  const NavLinkMobile = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className={`flex flex-col items-center justify-center gap-1 transition-all ${pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground'}`}>
      {children}
    </Link>
  );

  if (!isVerified) return null;

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar Desktop */}
        <div className="hidden border-r bg-background md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <WalletIcon className="h-6 w-6" /><span>Dompet Kustom</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <NavLink href="/dashboard"><Home className="h-4 w-4" />Dashboard</NavLink>
                <NavLink href="/wallets"><WalletIcon className="h-4 w-4" />Dompet</NavLink>
                <NavLink href="/categories"><Shapes className="h-4 w-4" />Kategori</NavLink>
                <NavLink href="/transactions"><ArrowRightLeft className="h-4 w-4" />Transaksi</NavLink>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <NavLink href="/settings"><Settings className="h-4 w-4" />Pengaturan</NavLink>
            </div>
          </div>
        </div>
        
        {/* Konten Utama */}
        <div className="flex flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 font-semibold text-lg md:justify-end">
            <div className="md:hidden"> {/* Judul Halaman Mobile */}
                <h1 className="font-semibold text-lg capitalize">{pathname.split('/').pop()}</h1>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
            </Button>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 pb-24 md:pb-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* [REVISI] Navigasi Bawah Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <nav className="grid h-16 grid-cols-5 items-center text-xs">
          <NavLinkMobile href="/dashboard"><Home className="h-5 w-5" />Home</NavLinkMobile>
          <NavLinkMobile href="/wallets"><WalletIcon className="h-5 w-5" />Dompet</NavLinkMobile>
          <NavLinkMobile href="/categories"><Shapes className="h-5 w-5" />Kategori</NavLinkMobile>
          <NavLinkMobile href="/transactions"><ArrowRightLeft className="h-5 w-5" />Riwayat</NavLinkMobile>
          <NavLinkMobile href="/settings"><Settings className="h-5 w-5" />Lainnya</NavLinkMobile>
        </nav>
      </div>

      {/* [REVISI] FAB Mobile */}
      <div className="md:hidden">
        {isFabOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsFabOpen(false)}
          />
        )}
        {/* Tombol Pengeluaran */}
        <div className={`fixed bottom-56 right-4 z-50 transition-all duration-300 ease-in-out ${isFabOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <p className="rounded-md bg-background px-3 py-1.5 text-sm shadow-md">Pengeluaran</p>
            <TransactionFormDialog transactionType="expense" onSuccess={() => { setIsFabOpen(false); router.refresh(); }}>
              <Button size="icon" className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600">
                <ArrowDown className="h-6 w-6" />
              </Button>
            </TransactionFormDialog>
          </div>
        </div>
        {/* Tombol Pemasukan */}
        <div className={`fixed bottom-40 right-4 z-50 transition-all duration-300 ease-in-out ${isFabOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
           <div className="flex items-center gap-3">
            <p className="rounded-md bg-background px-3 py-1.5 text-sm shadow-md">Pemasukan</p>
            <TransactionFormDialog transactionType="income" onSuccess={() => { setIsFabOpen(false); router.refresh(); }}>
              <Button size="icon" className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600">
                <ArrowUp className="h-6 w-6" />
              </Button>
            </TransactionFormDialog>
          </div>
        </div>
        {/* Tombol FAB Utama */}
        <Button
          size="icon"
          className="fixed bottom-20 right-4 z-50 h-16 w-16 rounded-full shadow-lg transition-transform duration-200"
          onClick={() => setIsFabOpen(!isFabOpen)}
          style={{ transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0)' }}
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>
    </>
  );
}