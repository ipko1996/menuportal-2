# ========================
# Stage 1: Builder
# ========================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy root manifest files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install all dependencies (dev included) to build the app
RUN pnpm fetch
RUN pnpm install --frozen-lockfile

# Copy the rest of the monorepo
COPY . .

# Build the API app with Nx (outputs pruned package.json + compiled code)
RUN pnpm exec nx run api:build


# ========================
# Stage 2: Production
# ========================
FROM node:20-alpine

WORKDIR /usr/src/app


RUN apk add --no-cache imagemagick ghostscript && \
    sed -i 's/rights="none" pattern="PDF"/rights="read" pattern="PDF"/' /etc/ImageMagick-7/policy.xml

# Copy pruned manifest from build output (runtime deps only)
COPY --from=builder /usr/src/app/dist/apps/api/package.json .
COPY --from=builder /usr/src/app/dist/apps/api/pnpm-lock.yaml .

RUN corepack enable && corepack prepare pnpm@latest --activate

# Install only production dependencies
RUN pnpm fetch
RUN pnpm install --prod --frozen-lockfile
RUN pnpm add tslib
RUN pnpm add drizzle-kit drizzle-orm

# Copy compiled app (no TypeScript sources)
COPY --from=builder /usr/src/app/dist/apps/api/ .

COPY --from=builder /usr/src/app/apps/api/drizzle-prod.config.ts .
COPY --from=builder /usr/src/app/apps/api/migrations ./migrations

ENV NODE_ENV=production

EXPOSE 3005

# Run the compiled app
CMD ["node", "main.js"]
