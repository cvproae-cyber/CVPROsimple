const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

let config = {};

if (isProduction) {
  // اسم الاتصال بالـ Instance الراجع من المتغيرات بيئية Cloud Run
  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME || 'cvprosimple:me-west1:cvpro-postgres';
  
  config = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'CvproN8nSecure2026',
    database: process.env.DB_NAME || 'cvpro_db',
    // هذا هو المسار الفعلي والمضمون لـ Unix Socket داخل حاويات Google Cloud Run
    host: `/cloudsql/${instanceConnectionName}`, 
    port: 5432,
    // تحديد مهلة للاتصال لعدم تعليق الطلبات
    connectionTimeoutMillis: 5000 
  };
  
  console.log(`📡 Production Mode: Connecting to Cloud SQL via Socket -> /cloudsql/${instanceConnectionName}`);
} else {
  // إعدادات التطوير المحلي (Local Development)
  config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'cvpro_db',
    password: process.env.DB_PASSWORD || 'CvproN8nSecure2026',
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