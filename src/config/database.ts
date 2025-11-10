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
    console.log('✅ Connexion à PostgreSQL établie avec succès');
    
    // Test simple
    const result = await client.query('SELECT version()');
    console.log('📊 Version PostgreSQL:', result.rows[0].version);
    
    client.release();
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
};

// Fonction utilitaire pour exécuter des requêtes
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};