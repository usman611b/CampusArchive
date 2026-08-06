import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';
import authRouter from './routes/auth.router';
import academicsRouter from './routes/academics.router';
import resourceRouter from './routes/resource.router';
import dashboardRouter from './routes/dashboard.router';
import adminRouter from './routes/admin.router';
import searchRouter from './routes/search.router';
import notificationsRouter from './routes/notifications.router';
import bookmarksRouter from './routes/bookmarks.router';
import interactionRouter from './routes/interaction.router';
import contactRouter from './routes/contact.router';
import { errorHandler } from './middlewares/error.middleware';
import { env } from './config/env';

const app = express();

if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');

const allowedOrigins = new Set(env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean));
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.', data: null }
});

app.use((req, res, next) => {
  res.locals.requestId = req.header('x-request-id') || randomUUID();
  res.setHeader('X-Request-ID', res.locals.requestId);
  next();
});
app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginResourcePolicy: { policy: 'same-site' }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied.'));
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-ID'],
  maxAge: 600
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    system: 'CampusArchive Node.js Express API Engine',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiLimiter);

// API v1 Domain Module Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/academics', academicsRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/bookmarks', bookmarksRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1', interactionRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
