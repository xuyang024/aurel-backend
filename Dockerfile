# Medusa backend image — BUILT BY GITHUB ACTIONS (not Railway).
# GitHub's CI has ample time/RAM, so the heavy npm ci + medusa build runs there.
# Railway then just pulls and runs this image (no build → no 20-min timeout).
# Build context = repo root (the aurel-backend repo).
#
# ---------- Build stage ----------
FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Deps first (cache-friendly): only re-runs npm ci when manifests change.
COPY package*.json turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci

COPY . .
WORKDIR /app/apps/backend
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npx medusa build

# ---------- Runtime stage ----------
FROM node:20-slim AS runner
ENV NODE_ENV=production
WORKDIR /app/server
RUN apt-get update && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Install prod deps first, keyed on the built server's package.json — this layer
# is cached across builds when deps don't change (skips the slow ~15min install).
COPY --from=builder /app/apps/backend/.medusa/server/package.json ./package.json
RUN npm install --omit=dev

# Then the built server + the boot-time settings loader.
COPY --from=builder /app/apps/backend/.medusa/server ./
COPY --from=builder /app/apps/backend/src/lib/load-settings.cjs ./src/lib/load-settings.cjs

EXPOSE 9000
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
