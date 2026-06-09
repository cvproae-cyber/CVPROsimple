const { Pool } = require('pg');

// التحقق هل التطبيق يعمل على سيرفر كلاود رن أم محلياً
const isProduction = process.env.K_SERVICE || process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'cvpro_db',
  password: process.env.DB_PASSWORD,
  
  // إذا كنا في الإنتاج نستخدم مسار الـ Socket الخاص بجوجل، محلياً نستخدم الـ IP
  host: isProduction 
    ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME || 'cvprosimple:me-west1:cvpro-postgres'}` 
    : (process.env.DB_HOST || '127.0.0.1'),
    
  // البورت يتم إلغاؤه في السحاب لأن الاتصال عبر الـ Socket لا يحتاج بورت
  port: isProduction ? undefined : (process.env.DB_PORT || 5432),
  
  max: parseInt(process.env.POOL_MAX) || 10,
  idleTimeoutMillis: parseInt(process.env.POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('⚠️ خطأ غير متوقع في قاعدة البيانات:', err.message);
});

module.exports = pool;