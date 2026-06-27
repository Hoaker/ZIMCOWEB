import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARES
// ==========================================
// Configure Cors whitelist based on .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('Cross-Origin Request Blocked by Zimco API Policy.'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// CENTRAL ROUTING PIPELINE
// ==========================================
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Zimco Cooperative Portal API Engine',
    timestamp: new Date().toISOString()
  });
});

// Fallback 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint path not discovered inside Zimco API.' });
});

// ==========================================
// GENERAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Internal System Exception:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Fatal application server runtime error.'
  });
});

// ==========================================
// BOOTSTRAP API ENGINE
// ==========================================
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 ZIMCO COOPERATIVE PORTAL FULL-STACK BACKEND SYSTEM ONLINE     `);
  console.log(`📡 Server running on Port: ${PORT}                               `);
  console.log(`🛠️  Environment mode: ${process.env.NODE_ENV || 'development'}    `);
  console.log(`================================================================`);
});
