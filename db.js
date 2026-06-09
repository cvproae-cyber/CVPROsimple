const { Pool } = require('pg');

// تحقق هل التطبيق يعمل على سيرفر كلاود رن أم محلياً
const isProduction = process.env.NODE_ENV === 'production';

let config = {};

if (isProduction) {
  // إعدادات الإنتاج على Cloud Run باستخدام Unix Domain Socket
  // نقرأ اسم الـ Instance مباشرة من البيئة لتفادي أي اختلاف في الحروف
  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME || 'cvprosimple:me-west1:cvpro-postgres';
  
  config = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'CvproN8nSecure2026',
    database: process.env.DB_NAME || 'cvpro_db',
    // المسار القياسي للـ Sockets داخل حاويات جوجل سحابياً
    host: `/cloudsql/${instanceConnectionName}`,
    port: 5432
  };
  
  console.log(`📡 محاولة الاتصال بـ Cloud SQL عبر الـ Socket: /cloudsql/${instanceConnectionName}`);
} else {
  // إعدادات التطوير المحلي (Local)
  config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'cvpro_db',
    password: process.env.DB_PASSWORD || 'CvproN8nSecure2026',
    port: process.env.DB_PORT || 9470,
  };
  console.log('💻 الاتصال بقاعدة البيانات محلياً (Local Development Mode)');
}

const pool = new Pool(config);

// التعامل مع الأخطاء المفاجئة للـ Client لمنع انهيار الخادم
pool.on('error', (err) => {
  console.error('🚨 خطأ غير متوقع في الـ PostgreSQL Pool Client:', err.message);
});

module.exports = pool;