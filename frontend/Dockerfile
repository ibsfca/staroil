# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Runtime stage
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built artifacts from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx config for SPA
COPY nginx.conf.spa /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/index.html || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
