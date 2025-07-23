import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(3, {
    message: "Nama harus memiliki minimal 3 karakter.",
  }),
  currency: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
