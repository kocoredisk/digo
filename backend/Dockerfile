# Digo Backend (NestJS) Dockerfile
# Multi-stage: builder → runner

# ---- Stage 1: Builder ----
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --production


# ---- Stage 2: Runner ----
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3004

CMD ["node", "dist/main"]
