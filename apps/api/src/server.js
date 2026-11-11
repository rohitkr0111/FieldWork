import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { rateLimit } from 'express-rate-limit';
import router from './routes/index.js';
import { errorHandler } from './lib/errors.js';
import { prisma } from './lib/prisma.js';

const app = express();
const origins = (process.env.CORS_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
app.disable('x-powered-by');
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));
app.use(pinoHttp({ redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers.set-cookie'] }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } } }));
app.use(cors({ origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); callback(new Error('Origin is not allowed by CORS')); }, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','X-CSRF-Token'] }));
app.use(express.json({ limit: '64kb', type: 'application/json' }));
app.use(cookieParser());
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 240, standardHeaders: 'draft-8', legacyHeaders: false }));
app.get('/health', async (_req, res) => { try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok', database: 'connected' }); } catch { res.status(503).json({ status: 'unavailable' }); } });
app.get('/api/v1/openapi.json', (_req, res) => res.json(openApi));
app.use('/api/v1', router);
app.use(errorHandler);

const openApi = { openapi: '3.1.0', info: { title: 'Website Showcase API', version: '1.0.0' }, servers: [{ url: `${process.env.API_BASE_URL || 'http://localhost:4000'}/api/v1` }], paths: {
  '/industries': { get: { summary: 'List active industries', responses: { 200: { description: 'Industry catalogue' } } } },
  '/projects': { get: { summary: 'Browse published projects', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 100 } }, { name: 'industry', in: 'query', schema: { type: 'string' } }, { name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'q', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Paginated published projects' } } } },
  '/projects/{slug}': { get: { summary: 'Get a published project', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project details' }, 404: { description: 'Not found' } } } },
  '/auth/admin/login': { post: { summary: 'Admin login with MFA', responses: { 200: { description: 'Authenticated session cookies' }, 401: { description: 'Invalid credentials' } } } },
  '/enquiries': { post: { summary: 'Submit a public enquiry', responses: { 200: { description: 'Enquiry reference' }, 400: { description: 'Validation error' }, 429: { description: 'Rate limit exceeded' } } } }
} };

const port = Number(process.env.API_PORT || 4000);
if (process.env.NODE_ENV !== 'test') app.listen(port, '0.0.0.0', () => console.log(`API listening on ${port}`));
export default app;
