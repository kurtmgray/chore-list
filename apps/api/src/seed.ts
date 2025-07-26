import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from './config';

async function runSeedData() {
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
  });

  try {
    // Read the seed data file
    const seedDataPath = path.join(__dirname, '../../../seed_data.sql');
    const seedSQL = await fs.readFile(seedDataPath, 'utf-8');

    console.log('Running seed data...');
    await pool.query(seedSQL);
    console.log('Seed data executed successfully!');
  } catch (error) {
    console.error('Error running seed data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// CLI usage
if (require.main === module) {
  runSeedData();
}

export { runSeedData };