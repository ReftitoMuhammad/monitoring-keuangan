import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Wallet { id: number; name: string; }
interface Category { id: number; name: string; type: 'income' | 'expense'; }
interface Transaction {
  id: number;
  description: string;
  amount: number;
  transaction_date: string;
  wallet: Wallet;
  category: Category;
}

interface TransactionCardProps {
  transaction: Transaction;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export function TransactionCard({ transaction: tx }: TransactionCardProps) {
  const isIncome = tx.category.type === 'income';

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 flex-grow min-w-0">
          <p className="font-semibold truncate">{tx.description || tx.category.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={isIncome ? 'default' : 'destructive'} className="text-xs">
              {tx.category.name}
            </Badge>
            <span>•</span>
            <span>{tx.wallet.name}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(tx.transaction_date)}</p>
        </div>
      </CardContent>
    </Card>
  );
}