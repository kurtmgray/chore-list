import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Type-safe environment configuration
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
});

export const config = configSchema.parse(process.env);

export type Config = z.infer<typeof configSchema>;