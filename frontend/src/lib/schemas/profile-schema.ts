import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(3, {
    message: "Nama harus memiliki minimal 3 karakter.",
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
