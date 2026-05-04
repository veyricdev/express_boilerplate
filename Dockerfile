# ---- Base Node ----
FROM node:22.22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Install openssl for Prisma (runtime required) and clean apt cache
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ---- Build Base ----
FROM base AS build-base
# Install build tools for native dependencies (e.g. bcrypt)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# ---- Dependencies ----
FROM build-base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY cms/package.json ./cms/
# Install all dependencies (including devDependencies)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Builder ----
FROM build-base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma Client
# We provide a dummy DATABASE_URL here because `prisma generate` doesn't connect to the DB, 
# but prisma.config.ts might complain if it's undefined.
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" pnpm db:gen

# Build Nest application and CMS frontend
RUN pnpm build

# ---- Production Dependencies ----
FROM build-base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY cms/package.json ./cms/
# Install only production dependencies for the ROOT project (--filter .)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --filter . --frozen-lockfile

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Create logs directory and set ownership so the app can write logs
RUN mkdir -p /app/logs && chown -R node:node /app

# Optional: Run as non-root user for security
# The 'node' user is already created in Debian-based node images
USER node

# Copy package.json
COPY package.json ./

# Copy node_modules with production dependencies
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules

# Copy generated Prisma Client and schema
COPY --from=builder --chown=node:node /app/src/prisma/generated ./src/prisma/generated
COPY --from=builder --chown=node:node /app/src/prisma/schema.prisma ./src/prisma/schema.prisma
COPY --from=builder --chown=node:node /app/prisma.config.ts ./prisma.config.ts

# Copy NestJS build output
COPY --from=builder --chown=node:node /app/dist ./dist

# Copy public folder (contains the Vite built CMS frontend)
COPY --from=builder --chown=node:node /app/public ./public

EXPOSE 3000

CMD ["node", "dist/main"]
