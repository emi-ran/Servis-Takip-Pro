import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET en az 32 karakter olmalıdır"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  PORT: z.coerce.number().default(3000),
});

function validateEnv() {
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return {
      DATABASE_URL: "postgresql://build:build@localhost:5432/build",
      JWT_SECRET: "build-time-placeholder-secret-32-chars",
      NEXT_PUBLIC_APP_URL: undefined,
      PORT: 3000,
    };
  }

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
