import 'dotenv/config';
import { env } from './config/env.js';
import { connectDB } from './config/database.js';
import app from './app.js';

const PORT = env.PORT;

const startServer = async (): Promise<void> => {
  try {
    console.log('Try to connect...');
    
    // Connexion à la base de données
    await connectDB();
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`
Server run
 Port: ${PORT}
  Data Base: PostgreSQL

 Health Check: http://localhost:${PORT}/health
  Test DB: http://localhost:${PORT}/test-db
 Users API: http://localhost:${PORT}/users
      `);
    });

  } catch (error) {
    console.error('failed', error);
    process.exit(1);
  }
};

startServer();