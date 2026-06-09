# --- المرحلة الأولى: بناء واجهة الفرونت إند (Vite) ---
FROM node:20-slim AS builder
WORKDIR /app

# نسخ ملفات الحزم للجذر وتثبيتها لبناء الفرونت إند
COPY package*.json ./
RUN npm install

# نسخ ملفات المشروع بالكامل (بما فيها index.html, App.tsx, constants.ts, vite.config.ts)
COPY . .

# تنفيذ أمر بناء الفرونت إند لإنتاج مجلد dist الثابت
RUN npx vite build

# --- المرحلة الثانية: تجهيز الحاوية النهائية للإنتاج ---
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# نسخ ملفات الحزم لتثبيت حزم الإنتاج فقط (Express, pg, dotenv, cors)
COPY package*.json ./
RUN npm install --only=production

# نسخ ملفات السيرفر وقاعدة البيانات من الجذر
COPY server.js db.js ./

# نسخ المجلد المترجم dist من المرحلة الأولى لخدمته عبر Express
COPY --from=builder /app/dist ./dist

# فتح منفذ الحاوية المتوافق مع إعدادات Cloud Run
EXPOSE 8080

# تشغيل السيرفر الموحد
CMD ["node", "server.js"]