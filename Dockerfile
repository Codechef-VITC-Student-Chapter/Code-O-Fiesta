FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Route modules read JWT_SECRET at import time, so the build needs a value.
# This placeholder is only used during `next build`; the real secret is
# injected at runtime and is never baked into the image.
ENV JWT_SECRET=build-time-placeholder \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Full node_modules is kept (not `output: standalone`) because the AST parser
# loads .wasm files from node_modules at runtime, and the seed scripts need tsx.
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts /app/tsconfig.json ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["npm", "run", "start"]
