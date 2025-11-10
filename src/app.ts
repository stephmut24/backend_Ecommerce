import express from 'express';
import { query } from './config/database.js';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🚀 Serveur en ligne!',
    timestamp: new Date().toISOString()
  });
});

// Test de la base de données
app.get('/test-db', async (req, res) => {
  try {
    const result = await query('SELECT version()');
    
    res.json({
      success: true,
      message: 'Database is connected',
      database: {
        version: result.rows[0].version,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({
      success: false,
      message: 'Database Error',
      error: errorMessage
    });
  }
});

// Exemple de route avec requête
app.get('/users', async (req, res) => {
  try {
    // Exemple de création de table si elle n'existe pas
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await query('SELECT * FROM users');
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Créer un utilisateur
app.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const result = await query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [email, name]
    );
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default app;