"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Home, Wallet as WalletIcon, Shapes, ArrowRightLeft, Plus, Settings, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionFormDialog } from '@/app/(app)/transactions/_components/transaction-form-dialog';
import { DesktopSidebar } from './_components/desktop-sidebar'; 

export default function ProtectedLayout({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  const NavLinkMobile = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className={`flex flex-col items-center justify-center gap-1 transition-all ${pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground'}`}>
      {children}
    </Link>
  );

  if (!isVerified) return null;

  return (
    <>
      <DesktopSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex flex-col md:ml-[72px]">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 font-semibold text-lg md:justify-end">
          <div className="md:hidden">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5" />
              <h1 className="font-semibold text-lg">Atur Uang</h1>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <nav className="grid h-16 grid-cols-5 items-center text-xs">
          <NavLinkMobile href="/dashboard"><Home className="h-5 w-5" />Home</NavLinkMobile>
          <NavLinkMobile href="/wallets"><WalletIcon className="h-5 w-5" />Dompet</NavLinkMobile>
          <NavLinkMobile href="/categories"><Shapes className="h-5 w-5" />Kategori</NavLinkMobile>
          <NavLinkMobile href="/transactions"><ArrowRightLeft className="h-5 w-5" />Riwayat</NavLinkMobile>
          <NavLinkMobile href="/settings"><Settings className="h-5 w-5" />Lainnya</NavLinkMobile>
        </nav>
      </div>
      <div className="md:hidden">
        {isFabOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsFabOpen(false)}
          />
        )}
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