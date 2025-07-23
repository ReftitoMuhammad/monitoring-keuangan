"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet as WalletIcon, Shapes, ArrowRightLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function DesktopSidebar({ isSidebarOpen, setIsSidebarOpen }: DesktopSidebarProps) {
  const pathname = usePathname();

  const NavLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string; }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        pathname.startsWith(href) && "text-primary",
        pathname.startsWith(href) && isSidebarOpen && "bg-muted"
      )}
    >
      {icon}
      <span className={cn("whitespace-nowrap transition-opacity", !isSidebarOpen && "opacity-0 pointer-events-none")}>{text}</span>
    </Link>
  );

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-10 hidden h-full border-r bg-background transition-all duration-300 ease-in-out md:block",
        isSidebarOpen ? "w-[280px]" : "w-[72px]"
      )}
      onMouseEnter={() => setIsSidebarOpen(true)}
      onMouseLeave={() => setIsSidebarOpen(false)}
    >
      <div className="flex h-full max-h-screen flex-col justify-between">
        <div> {/* Grup Atas: Header & Navigasi Utama */}
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <WalletIcon className="h-6 w-6" />
              <span className={cn("whitespace-nowrap transition-opacity", !isSidebarOpen && "opacity-0 pointer-events-none")}>Dompet Kustom</span>
            </Link>
          </div>
          <div className="py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink href="/dashboard" icon={<Home className="h-5 w-5" />} text="Dashboard" />
              <NavLink href="/wallets" icon={<WalletIcon className="h-5 w-5" />} text="Dompet" />
              <NavLink href="/categories" icon={<Shapes className="h-5 w-5" />} text="Kategori" />
              <NavLink href="/transactions" icon={<ArrowRightLeft className="h-5 w-5" />} text="Transaksi" />
            </nav>
          </div>
        </div>
        
        <div> {/* Grup Bawah: Pengaturan */}
          <div className="px-2 py-4 lg:px-4">
            <NavLink href="/settings" icon={<Settings className="h-5 w-5" />} text="Pengaturan" />
          </div>
        </div>
      </div>
    </div>
  );
}