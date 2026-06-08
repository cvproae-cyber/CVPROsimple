const { Pool } = require('pg');

// التحقق من البيئة (Cloud Run يعرّف K_SERVICE تلقائياً)
const isProduction = process.env.K_SERVICE || process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'cvpro_db',
  password: process.env.DB_PASSWORD,
  
  // Use Unix Socket on Cloud Run (Production), otherwise respect DB_HOST from your .env
  host: isProduction 
    ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME || 'cvprosimple:me-west1:cvpro-postgres'}` 
    : (process.env.DB_HOST || '127.0.0.1'),
    
  // Use DB_PORT from your .env in development, or fallback to 9470 if using the proxy
  port: isProduction ? undefined : (process.env.DB_PORT || 9470),
  
  // إعدادات إضافية للأداء
  max: 10, // أقصى عدد للاتصالات في الـ pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
