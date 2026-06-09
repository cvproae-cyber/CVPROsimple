const { Pool } = require('pg');

// تحقق هل التطبيق يعمل على سيرفر كلاود رن أم محلياً
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cvpro_db',
  
  // إذا كنا في الإنتاج، نستخدم المسار الداخلي الآمن لجوجل كلاود
  host: isProduction 
    ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}` 
    : (process.env.DB_HOST || '127.0.0.1'),
    
  // في الإنتاج لا نحدد بورت لأننا نستخدم Unix Socket
  port: isProduction ? undefined : (process.env.DB_PORT || 5432),
  
  max: parseInt(process.env.POOL_MAX) || 10,
  idleTimeoutMillis: parseInt(process.env.POOL_IDLE_TIMEOUT) || 30000,
});

module.exports = pool;