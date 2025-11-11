import express from 'express';
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import {createResponse} from './utils/response.js'

const app = express();

app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 E-commerce API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

//Route 404
app.use('*', (req, res)=>{
  res.status(404).json(
    createResponse(false, 'Endpoint not found', null, ['The requested endpoint does not exist'])
  )
})

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  res.status(500).json(
    createResponse(false, 'Internal server error', null, ['An unexpected error occurred'])
  );
});



export default app;