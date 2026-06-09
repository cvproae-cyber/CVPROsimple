# --- المرحلة الأولى: بناء واجهة الفرونت إند من الفولدر الصحيح ---
FROM node:20-slim AS builder
WORKDIR /app

# نسخ ملفات الحزم بالكامل للمشروع
COPY package*.json ./
RUN npm install

# نسخ كل ملفات المشروع بما فيها المجلد الداخلي
COPY . .

# 💡 الإصلاح السحري: الدخول للمجلد الفعلي حيث يوجد index.html و vite.config.ts وبناؤه هناك
RUN cd CVPROsimple && npm install && npx vite build

# --- المرحلة الثانية: تجهيز حاوية الإنتاج الخفيفة والموحدة ---
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# تثبيت حزم الإنتاج فقط الخاصة بالباك إند لمنع التضارب وضمان السرعة
COPY package*.json ./
RUN npm install --only=production

# نسخ ملفات السيرفر والاتصال بقاعدة البيانات للجذر
COPY server.js db.js ./

# سحب مجلد dist المترجم من داخل فولدر builder السابِق إلى جذر خادم الـ Express
COPY --from=builder /app/CVPROsimple/dist ./dist

# فتح المنفذ الخاص بـ Cloud Run
EXPOSE 8080

# تشغيل السيرفر الرئيسي
CMD ["node", "server.js"]