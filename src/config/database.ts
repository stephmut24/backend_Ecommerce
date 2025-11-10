import { Pool } from 'pg';
import { env } from './env.js';

// Création du pool de connexions
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20, // nombre max de clients dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion
export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ Connect to Postgresql');
    
    // Test simple
    const result = await client.query('SELECT version()');
    console.log('📊  PostgreSQL version:', result.rows[0].version);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};