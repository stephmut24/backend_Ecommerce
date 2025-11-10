import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET est requis"),
  PORT: z.string().default('8000'),
});

export const env = envSchema.parse(process.env);