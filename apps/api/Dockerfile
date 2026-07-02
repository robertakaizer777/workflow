FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
# For Prisma
COPY prisma ./prisma/

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4001

# Command to run migrations and start the app
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main"]
