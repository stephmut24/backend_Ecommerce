// src/server.ts
import { env } from './config/env';
import { connectDB } from './config/database';
import app from './app';

const PORT = env.PORT;

const startServer = async (): Promise<void> => {
  try {
    console.log('🔄 Tentative de connexion à la base de données...');
    
    // Connexion DB
    await connectDB();
    
    // Démarrage serveur
    app.listen(PORT, () => {
      console.log(`
 SERVEUR DÉMARRÉ!
 Port: ${PORT}
Base de données: CONNECTÉE

 Health Check: http://localhost:${PORT}/health
  Test DB: http://localhost:${PORT}/test-db
      `);
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('💥 ÉCHEC du démarrage:', errorMessage);
    process.exit(1);
  }
};

// Import nécessaire pour le test DB
import prisma from './config/database';

startServer();