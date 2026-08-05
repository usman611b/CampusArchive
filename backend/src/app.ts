import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth.router';
import academicsRouter from './routes/academics.router';
import resourceRouter from './routes/resource.router';
import dashboardRouter from './routes/dashboard.router';
import adminRouter from './routes/admin.router';
import searchRouter from './routes/search.router';
import notificationsRouter from './routes/notifications.router';
import bookmarksRouter from './routes/bookmarks.router';
import interactionRouter from './routes/interaction.router';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    system: 'CampusArchive Node.js Express API Engine',
    timestamp: new Date().toISOString()
  });
});

// API v1 Domain Module Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/academics', academicsRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/bookmarks', bookmarksRouter);
app.use('/api/v1', interactionRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
