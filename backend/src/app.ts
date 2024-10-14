// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import { bookingsRouter } from './routes/bookings';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingsRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
