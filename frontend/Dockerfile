# Frontend Dockerfile per Server ARM64 (Vite + React build then serve static with nginx)
FROM node:20-alpine AS build
WORKDIR /app

# Build-time arguments per configurazione API
ARG VITE_API_URL=http://localhost:8001/api/v1
ARG VITE_API_BASE_URL=http://localhost:8001/api/v1
ARG VITE_BACKEND_URL=http://localhost:8001

# Set environment variables per build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copy package files first for better caching
COPY package.json ./
# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application con configurazione API corretta
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
# Copy nginx config with security headers and API proxy
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "no-referrer";
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'self'; font-src 'self' https://cdnjs.cloudflare.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';";
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
EXPOSE 80
