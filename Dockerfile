# استخدام نسخة مستقرة من Node.js
FROM node:20-slim

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات تعريف المكتبات من مجلد frontend
COPY frontend/package*.json ./

# تثبيت المكتبات
RUN npm install

# نسخ كود المشروع بالكامل من مجلد frontend إلى مجلد العمل
COPY frontend/ .

# بناء ملفات الفرونت-إند (Vite build) لإنشاء مجلد dist
RUN npm run build

# تحديد البيئة كإنتاج
ENV NODE_ENV=production

# فتح المنفذ الذي يستخدمه السيرفر
EXPOSE 8080

# أمر التشغيل الرئيسي
CMD ["node", "server.js"]