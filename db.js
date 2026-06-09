const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

// Helper to ensure required env vars are present
function getRequiredEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

let config = {};

if (isProduction) {
  // اسم الاتصال بالـ Instance الراجع من المتغيرات بيئية Cloud Run
  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME || 'cvprosimple:me-west1:cvpro-postgres';
  
  config = {
    user: getRequiredEnvVar('DB_USER'),
    password: getRequiredEnvVar('DB_PASSWORD'),
    database: getRequiredEnvVar('DB_NAME'),
    // هذا هو المسار الفعلي والمضمون لـ Unix Socket داخل حاويات Google Cloud Run
    host: `/cloudsql/${instanceConnectionName}`,
    port: 5432,
    connectionTimeoutMillis: 5000
  };
  
  console.log(`📡 Production Mode: Connecting to Cloud SQL via Socket -> /cloudsql/${instanceConnectionName}`);
} else {
  // إعدادات التطوير المحلي (Local Development)
  config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'cvpro_db',
    password: process.env.DB_PASSWORD || (() => { throw new Error('DB_PASSWORD must be set even in development'); })(),
    port: process.env.DB_PORT || 9470,
  };
  console.log('💻 Development Mode: Connecting to Local Database');
}

const pool = new Pool(config);

// صمام أمان لالتقاط الأخطاء المفاجئة في الـ Pool ومنع انهيار الحاوية
pool.on('error', (err) => {
  console.error('🚨 Unexpected error on idle Cloud SQL client:', err.message);
});

module.exports = pool;