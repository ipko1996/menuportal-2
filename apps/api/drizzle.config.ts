import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}

export default defineConfig({
  schema: './apps/api/src/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
  out: './apps/api/migrations',
});
