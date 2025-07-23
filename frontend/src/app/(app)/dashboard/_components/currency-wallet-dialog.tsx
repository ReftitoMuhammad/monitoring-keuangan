"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface Wallet { id: number; name: string; balance: number; bank_name?: string; currency: string; }
interface CurrencyWalletsDialogProps { currency: string; wallets: Wallet[]; }

const formatCurrency = (value: number, currency: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);

export function CurrencyWalletsDialog({ currency, wallets }: CurrencyWalletsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Eye className="h-4 w-4 text-muted-foreground" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Rincian Dompet ({currency})</DialogTitle></DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
          {wallets.map(wallet => (
            <Card key={wallet.id}>
              <CardHeader className="p-4">
                <CardTitle className="text-base">{wallet.name}</CardTitle>
                {wallet.bank_name && <CardDescription>{wallet.bank_name}</CardDescription>}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="font-bold text-lg">{formatCurrency(wallet.balance, wallet.currency)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}