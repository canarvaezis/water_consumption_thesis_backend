# Water Consumption Backend — Node.js (Express) + Firebase Admin
# Runtime: Node.js 20 LTS (Alpine)
# Dependencias: package.json (package-lock.json opcional; si lo versionas, cambia a `npm ci --omit=dev`)

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
# Mismo mapeo que en EC2: -p 80:8080
ENV PORT=8080

# Solo manifiesto de dependencias primero (mejor cache de capas)
COPY package.json ./

RUN npm install --omit=dev

# Código de la aplicación (ES modules)
COPY src ./src

EXPOSE 8080

CMD ["node", "src/server.js"]
