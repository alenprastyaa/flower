require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  db: {
    host: required('DB_HOST', '127.0.0.1'),
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: required('DB_NAME', 'flower_marketplace'),
    user: required('DB_USER', 'flower_user'),
    password: required('DB_PASSWORD', 'flower_pass'),
  },
  jwt: {
    secret: required('JWT_SECRET', 'dev-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  uploadServiceUrl: process.env.UPLOAD_SERVICE_URL || 'https://upload-file.applicationservice.id/api/upload-file',
  regionApiBaseUrl: process.env.REGION_API_BASE_URL || 'https://wilayah.id/api',
  defaultCommissionRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE || '15.00'),
  superadmin: {
    email: process.env.SUPERADMIN_EMAIL || 'admin@flowermarket.local',
    password: process.env.SUPERADMIN_PASSWORD || 'ChangeMe123!',
  },
};
