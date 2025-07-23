import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().min(3, {
    message: "Nama dompet harus memiliki minimal 3 karakter.",
  }),
  balance: z.coerce.number().optional(),
});

export type WalletFormValues = z.infer<typeof walletSchema>;