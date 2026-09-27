import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusmart_db',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_campusmart_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  allowedCampusDomains: (process.env.CAMPUS_EMAIL_DOMAINS || 'chitkara.edu.in,edu.in,ac.in,edu,gmail.com')
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean),

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@campusmart.edu',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  uploadDir: path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
};
