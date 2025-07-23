import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama harus diisi minimal 3 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(8, { message: "Password harus diisi minimal 8 karakter." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok.",
  path: ["confirmPassword"], 
});

export type RegisterFormValues = z.infer<typeof registerSchema>;