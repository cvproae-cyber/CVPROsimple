# المرحلة الأولى: بناء تطبيق React
FROM node:18-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# تمرير متغيرات Supabase أثناء وقت البناء (Build-time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# المرحلة الثانية: إعداد خادم التشغيل
FROM node:18-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
COPY package*.json ./
RUN npm install --production

EXPOSE 8080
CMD ["node", "server.js"]