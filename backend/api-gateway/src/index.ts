import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5000, 
  message: 'Too many requests from this IP, please try again.'
});
app.use(limiter);

// Microservices routing config
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  tasks: process.env.TASK_SERVICE_URL || 'http://localhost:4002',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4003',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005',
};

// Proxies
app.use('/auth', createProxyMiddleware({ target: services.auth, changeOrigin: true }));

// For tasks, projects, sprints, we route to task-service but we MUST preserve the prefix 
// otherwise they all hit the root of task-service.
const taskProxy = createProxyMiddleware({ 
  target: services.tasks, 
  changeOrigin: true,
  pathRewrite: (path, req: any) => req.originalUrl
});

app.use('/tasks', taskProxy);
app.use('/projects', taskProxy);
app.use('/sprints', taskProxy);

app.use('/notifications', createProxyMiddleware({ target: services.notifications, changeOrigin: true }));
app.use('/analytics', createProxyMiddleware({ target: services.analytics, changeOrigin: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway ok' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'API Gateway Error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
