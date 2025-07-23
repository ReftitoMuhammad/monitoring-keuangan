import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(3, {
    message: "Nama kategori harus memiliki minimal 3 karakter.",
  }),
  type: z.enum(["income", "expense"])
    .refine(val => !!val, {
    message: "Anda harus memilih tipe kategori.",
  })
});

export type CategoryFormValues = z.infer<typeof categorySchema>;