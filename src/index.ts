import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const BODY_LIMIT = process.env.MAX_BODY_SIZE || '5mb';

// Middleware
app.use(helmet()); // Security headers

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://campus-x-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowedOrigin => allowedOrigin && origin.startsWith(allowedOrigin))) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); // Enable CORS with configuration
app.use(express.json({ limit: BODY_LIMIT })); // Parse JSON bodies with larger limit
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT })); // Parse URL-encoded bodies with larger limit

// Routes
import userRoutes from './module/user/user.route';
import uploadRoutes from './module/upload/upload.route';
import offeringRoutes from './module/offering/offering.route';
import bookingRoutes from './module/booking/booking.route';
import reviewRoutes from './module/review/review.route';

app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/offerings', offeringRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
