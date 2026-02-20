import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth.js';
import storiesRouter from './routes/stories.js';
import statsRouter from './routes/stats.js';
import publicRouter from './routes/public.js';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production (Netlify), the frontend and backend share the same origin,
// so we allow that origin plus common local dev ports.
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Netlify Functions internally)
        if (!origin) return callback(null, true);
        // Allow any Netlify domain or explicitly listed origins
        if (
            allowedOrigins.includes(origin) ||
            /\.netlify\.app$/.test(origin) ||
            /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
            /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
        ) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'storia-backend', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/public-stories', publicRouter);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
