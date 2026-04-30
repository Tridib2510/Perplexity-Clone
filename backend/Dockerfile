# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy application files
COPY package.json tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY index.ts middleware.ts client.ts db.ts prompt.ts ./
COPY types ./types

# Install dependencies
RUN bun install

# Generate Prisma client (needs DATABASE_URL at build time for config)
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" bunx prisma generate

# Production stage
FROM oven/bun:1-alpine AS production

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY package.json tsconfig.json prisma.config.ts ./
COPY index.ts middleware.ts client.ts db.ts prompt.ts ./
COPY types ./types

# Expose port (Render uses PORT env var, defaults to 10000)
ENV PORT=10000
EXPOSE 10000

# Start the application
CMD ["bun", "index.ts"]