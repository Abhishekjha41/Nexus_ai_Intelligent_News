// lib/db/src/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use local database URL, fallback to default local postgres
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:20062003@localhost:5432/intelligent_news';

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export * from './schema';