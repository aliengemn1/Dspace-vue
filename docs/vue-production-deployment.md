# Vue Production Deployment Guide

## Build for Production

```bash
# Build for production
npm run build

# Output goes to /dist folder
```

## Server Options

### 1. Static Hosting with Nginx (Recommended)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/dist;
    index index.html;

    # Handle Vue Router history mode
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (JS, CSS, images)
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
}
```

### 2. HTTPS with SSL (Required for Production)

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Node.js with serve

```bash
# Install serve globally
npm install -g serve

# Serve the dist folder
serve -s dist -l 4000
```

### 4. PM2 Process Manager (Recommended for Node.js)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 serve dist 4000 --spa --name "dspace-vue"

# Auto-restart on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs dspace-vue

# Restart application
pm2 restart dspace-vue
```

### 5. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

```bash
# Build and run Docker container
docker build -t dspace-vue .
docker run -d -p 80:80 --name dspace-vue dspace-vue
```

## Best Practices Checklist

| Practice | Description |
|----------|-------------|
| **Use HTTPS** | Required for security and modern browser features |
| **Enable Gzip/Brotli** | Reduces bundle size by 60-80% |
| **Set Cache Headers** | Assets are hashed, can be cached forever |
| **Use CDN** | Faster global delivery (Cloudflare, AWS CloudFront) |
| **Environment Variables** | Use `.env.production` for production API URLs |
| **History Mode Fallback** | Always return index.html for client-side routing |
| **Security Headers** | Add CSP, X-Frame-Options, etc. |

## Environment Configuration

### .env.production

```env
VITE_API_URL=https://your-dspace-api.com/server/api
VITE_APP_TITLE=KFNL Digital Repository
```

### Preview Build Locally

```bash
# Build and preview
npm run build
npm run preview
```

## Security Headers (Nginx)

```nginx
# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';" always;
```

## Apache Configuration (Alternative)

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/dist

    <Directory /var/www/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Handle Vue Router history mode
    FallbackResource /index.html

    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
    </IfModule>

    # Cache static assets
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</VirtualHost>
```

## Monitoring & Logs

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs dspace-vue --lines 100

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Deployment Script Example

```bash
#!/bin/bash
# deploy.sh

echo "Building application..."
npm run build

echo "Copying to server..."
rsync -avz --delete dist/ user@server:/var/www/dspace-vue/

echo "Restarting Nginx..."
ssh user@server "sudo systemctl reload nginx"

echo "Deployment complete!"
```
