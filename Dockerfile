# --- المرحلة الأولى: بناء ملفات الـ Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app

# نسخ ملفات package.json الخاصة بالفرونت إند وتثبيت حزمه
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# نسخ كود الفرونت إند بالكامل وعمل Build لإنتاج مجلد dist
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# --- المرحلة الثانية: تجهيز سيرفر الإنتاج المشترك ---
FROM node:20-slim
WORKDIR /app

# تعيين متغير البيئة للإنتاج
ENV NODE_ENV=production
ENV PORT=8080

# نسخ ملفات package.json الخاصة بالجذر (الباك إند) وتثبيت الحزم الأساسية للإنتاج
COPY package*.json ./
RUN npm install --only=production

# نسخ ملفات السيرفر والاتصال بقاعدة البيانات من الجذر
COPY server.js db.js ./

# نسخ المجلد المترجم (dist) من المرحلة الأولى إلى المكان الذي يتوقعه سيرفر Express
COPY --from=frontend-builder /app/frontend/dist ./dist

# فتح البورت المتوقع من Cloud Run
EXPOSE 8080

# تشغيل السيرفر الرئيسي اللي بيربط كل حاجة ببعض
CMD ["node", "server.js"]