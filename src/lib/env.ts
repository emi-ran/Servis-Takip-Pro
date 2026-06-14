import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET en az 32 karakter olmalıdır"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12),
  ADMIN_NAME: z.string().min(1),
  ADMIN_SURNAME: z.string().min(1),
  COMPANY_NAME: z.string().min(1),
  COMPANY_SLUG: z.string().min(1),
  PORT: z.coerce.number().default(3000),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "[env.ts] Geçersiz çevre değişkenleri:",
      result.error.flatten().fieldErrors
    );
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
