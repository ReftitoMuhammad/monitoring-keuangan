import { z } from "zod";

export const passwordSchema = z.object({
  current_password: z.string().min(1, { message: "Password saat ini wajib diisi." }),
  new_password: z.string().min(8, {
    message: "Password baru harus memiliki minimal 8 karakter.",
  }),
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;