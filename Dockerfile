# --- المرحلة الأولى: بناء واجهة Vite في الجذر مباشرة ---
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build

# --- المرحلة الثانية: تجهيز الحاوية التشغيلية للإنتاج ---
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm install --only=production

COPY server.js db.js ./
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "server.js"]