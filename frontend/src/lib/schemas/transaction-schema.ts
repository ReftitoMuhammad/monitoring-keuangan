import { z } from "zod";

export const transactionSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Jumlah harus lebih dari 0." }),
  wallet_id: z.string().min(1, { message: "Dompet harus dipilih." }),
  category_id: z.string().min(1, { message: "Kategori harus dipilih." }),
  transaction_date: z.date(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;