import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL for standard production integrations (Render, Railway, Heroku, Supabase)
// Otherwise construct from discrete config fields
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Event listener for pool connection establishment
pool.on('connect', () => {
  console.log('PostgreSQL Connection Pool initialized successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export default pool;
