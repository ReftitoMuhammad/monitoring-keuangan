"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Home, LogOut, Wallet as WalletIcon, Shapes, ArrowRightLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionFormDialog } from '@/app/(app)/transactions/_components/transaction-form-dialog'; // Impor dialog transaksi

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  // const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

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

  // Komponen untuk Navigasi Desktop
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
        pathname === href ? 'bg-muted text-primary' : ''
      }`}
    >
      {children}
    </Link>
  );

  // Komponen untuk Navigasi Mobile
  const NavLinkMobile = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 transition-all ${
        pathname === href ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      {children}
    </Link>
  );

  if (!isVerified) {
    return null; // Atau tampilkan komponen loading halaman penuh
  }

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar untuk Desktop */}
        <div className="hidden border-r bg-background md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <WalletIcon className="h-6 w-6" />
                <span>Dompet Kustom</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <NavLink href="/dashboard"><Home className="h-4 w-4" />Dashboard</NavLink>
                <NavLink href="/wallets"><WalletIcon className="h-4 w-4" />Dompet</NavLink>
                <NavLink href="/categories"><Shapes className="h-4 w-4" />Kategori</NavLink>
                <NavLink href="/transactions"><ArrowRightLeft className="h-4 w-4" />Transaksi</NavLink>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Konten Utama */}
        <div className="flex flex-col">
          <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
            </Button>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Navigasi Bawah untuk Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <nav className="grid h-16 grid-cols-4 items-center text-xs">
          <NavLinkMobile href="/dashboard"><Home className="h-5 w-5" />Dashboard</NavLinkMobile>
          <NavLinkMobile href="/wallets"><WalletIcon className="h-5 w-5" />Dompet</NavLinkMobile>
          <NavLinkMobile href="/categories"><Shapes className="h-5 w-5" />Kategori</NavLinkMobile>
          <NavLinkMobile href="/transactions"><ArrowRightLeft className="h-5 w-5" />Transaksi</NavLinkMobile>
        </nav>
      </div>

      {/* Floating Action Button (FAB) untuk Mobile */}
      <div className="md:hidden">
        <TransactionFormDialog onSuccess={() => router.refresh()}>
            <Button size="icon" className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
                <Plus className="h-6 w-6" />
            </Button>
        </TransactionFormDialog>
      </div>
    </>
  );
}