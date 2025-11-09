import express from "express";
import {prisma} from './config/database';


const app = express();

//Express Middleware
app.use(express.json());

//route test DB


app.get('/test-db', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    res.json({
      success: true,
      message: 'Base de données connectée!',
      database: result
    });
  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue de la base de données';
    res.status(500).json({
      success: false,
      message: ' Erreur base de données',
      error: errorMessage
    });
  }
});

// Route santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Serveur en ligne!',
    database: 'À tester sur /test-db'
  });
});

export default app;