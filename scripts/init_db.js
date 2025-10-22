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

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  console.log('Running schema...');
  await client.query(schemaSql);
  console.log('Schema applied.');

  // Minimal seed: insert a couple of employees and requests if employees table is empty
  const res = await client.query('SELECT count(*)::int as cnt FROM employees');
  const count = res.rows[0].cnt;
  if (count === 0) {
    console.log('Seeding demo employees and vacation requests...');

    const insertEmployeeText = `INSERT INTO employees (id, name, position, department, accumulated_days, used_days, pending_days, monthly_rate)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`;

    const e1 = await client.query(insertEmployeeText, ['11111111-1111-1111-1111-111111111111','Juan Francisco Moreno','Oficial de Crédito','Créditos',12.5,7.5,5.0,2.5]);
    const e2 = await client.query(insertEmployeeText, ['22222222-2222-2222-2222-222222222222','María González','Analista','Operaciones',9.83,5.5,4.33,2.5]);

    const insertRequestText = `INSERT INTO vacation_requests (employee_id, start_date, end_date, days, status, reason)
      VALUES ($1,$2,$3,$4,$5,$6)`;

    await client.query(insertRequestText, [e1.rows[0].id, '2025-10-10', '2025-10-15', 5, 'approved', 'Vacaciones programadas']);
    await client.query(insertRequestText, [e2.rows[0].id, '2025-11-01', '2025-11-05', 5, 'pending', 'Viaje familiar']);

    console.log('Seed complete.');
  } else {
    console.log('Employees already present, skipping seed.');
  }

  await client.end();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
