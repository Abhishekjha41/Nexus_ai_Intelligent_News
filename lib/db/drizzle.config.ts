// lib/db/drizzle.config.ts
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Load from root

export default {
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/intelligent_news',
  },
} satisfies Config;