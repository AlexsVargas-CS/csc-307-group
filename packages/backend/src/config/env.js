import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  MONGODB_URI: z.string().min(1),
  TMDB_API_KEY: z.string().default('TMDB_API_KEY'),
  JWT_SECRET: z.string().min(8).default('dev_jwt_secret_please_change'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().default('google_client_id'),
  GOOGLE_CLIENT_SECRET: z.string().default('google_client_secret'),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:3001/api/auth/google/callback')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = parsed.data;
