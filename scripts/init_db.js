#!/usr/bin/env node
/*
  Simple DB initializer for the project.
  Usage: set DATABASE_URL in .env (e.g. postgres://user:pass@host:5432/dbname)
  Then run: node ./scripts/init_db.js  (or npm run db:init)
*/
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in environment. Create a .env file with DATABASE_URL.');
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const args = process.argv.slice(2);
  const doReset = args.includes('--reset');
  const sqlFile = doReset ? path.join(__dirname, 'full_reset.sql') : path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(sqlFile, 'utf8');

  console.log(`Running ${doReset ? 'full reset' : 'schema'}...`);
  await client.query(schemaSql);
  console.log('SQL applied.');

  // No automatic seeding: schema applied only. Seeds should be inserted manually.
  console.log('Schema applied. No automatic seed executed.');

  await client.end();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
