# Ciclo Leve API (dev-friendly)
# Build: docker compose build api
# Run:   docker compose up -d

FROM node:22-bullseye-slim

WORKDIR /app

# Install dependencies (includes dev deps for ts-node-dev)
COPY package.json package-lock.json ./
RUN npm ci

# Prisma client generation needs schema
COPY prisma ./prisma
RUN npx prisma generate

# App sources
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]
