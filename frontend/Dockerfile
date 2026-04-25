# Digo Frontend (Next.js) Dockerfile
# Multi-stage: builder → runner (standalone)

# ---- Stage 1: Builder ----
FROM node:20-slim AS builder

WORKDIR /app

ARG INTERNAL_API_URL=http://backend:3004

ENV BUILD_STANDALONE=true
ENV NEXT_PUBLIC_API_URL=""
ENV INTERNAL_API_URL=${INTERNAL_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---- Stage 2: Runner ----
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3003

CMD ["node", "server.js"]
