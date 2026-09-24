import path from 'node:path';
import fs from 'node:fs';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import { createApp } from './app';

async function main() {
  // Ensure the upload directory exists before the static route / multer need it
  const uploadDir = path.resolve(process.cwd(), config.uploadDirAbsolute);
  fs.mkdirSync(uploadDir, { recursive: true });

  await connectDatabase(config.MONGODB_URI || undefined, config.ALLOW_DB_FALLBACK);

  // In-memory dev fallback: every boot starts empty, so auto-seed the
  // design-matching demo data when the database is blank.
  const { Competition } = await import('./models/Competition');
  if (!config.MONGODB_URI && (await Competition.countDocuments()) === 0) {
    const { seedDatabase } = await import('./seed/seed');
    await seedDatabase();
  }

  const app = createApp();
  app.listen(config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Feedants API listening on http://localhost:${config.PORT} (${config.NODE_ENV})`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
