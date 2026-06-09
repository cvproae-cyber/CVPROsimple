# --- المرحلة الأولى: بناء واجهة Vite المستقرة ---
FROM node:20-slim AS builder
WORKDIR /app

# نسخ ملفات الحزم للجذر وتثبيتها لبناء التطبيق
COPY package*.json ./
RUN npm install

# نسخ ملفات الكود بالكامل للجذر
COPY . .

# 💡 الإصلاح الجذري التلقائي:
# الأمر يتحقق لو ملف index.html موجود في الجذر مباشرة هيبني، لو مش موجود هيدور عليه ويبني من مكانه الصحيح!
RUN if [ -f "index.html" ]; then \
      npx vite build; \
    else \
      cd $(dirname $(find . -name "index.html" | head -n 1)) && npm install && npx vite build && cp -r dist /app/dist; \
    fi

# --- المرحلة الثانية: تجهيز حاوية الإنتاج الخفيفة والموحدة ---
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# تثبيت حزم الإنتاج فقط الخاصة بالباك إند لمنع التضارب وسرعة التشغيل
COPY package*.json ./
RUN npm install --only=production

# نسخ ملفات السيرفر والاتصال بقاعدة البيانات للجذر
COPY server.js db.js ./

# نسخ مجلد dist المترجم والناجح من المرحلة الأولى لجذر الخادم
COPY --from=builder /app/dist ./dist

# فتح المنفذ الخاص بـ Cloud Run
EXPOSE 8080

# تشغيل سيرفر الـ Express الموحد
CMD ["node", "server.js"]