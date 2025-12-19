# Deployment Guide / دليل النشر

## Build for Production / البناء للإنتاج

### 1. Install Dependencies / تثبيت التبعيات
```bash
cd c:\dspace-vue
npm install
```

### 2. Build for IDR folder / البناء لمجلد IDR
```bash
npm run build:idr
```

This will create the `idr` folder with all production files.

## Deploy to Nginx / النشر على Nginx

### Windows Nginx Setup / إعداد Nginx على Windows

1. **Copy built files / نسخ الملفات المبنية**
```bash
# Copy the idr folder to nginx html directory
xcopy /E /I idr C:\nginx\html\idr
```

2. **Configure Nginx / تكوين Nginx**
```bash
# Copy the nginx config
copy nginx-idr.conf C:\nginx\conf\nginx.conf
```

3. **Update nginx.conf if needed / تحديث التكوين إذا لزم الأمر**

Edit `C:\nginx\conf\nginx.conf`:
```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

    # Include IDR configuration
    include conf.d/*.conf;

    # Or paste the server block from nginx-idr.conf directly
}
```

4. **Test and Start Nginx / اختبار وتشغيل Nginx**
```bash
# Test configuration
C:\nginx\nginx.exe -t

# Start Nginx
C:\nginx\nginx.exe

# Or reload if already running
C:\nginx\nginx.exe -s reload
```

5. **Access the application / الوصول للتطبيق**
```
http://localhost/idr
```

## DSpace API Configuration / تكوين واجهة DSpace

Make sure DSpace is running on `http://localhost:8080`

The application expects the API at:
- `http://localhost:8080/server/api`

### Authentication / المصادقة
Default credentials configured:
- Email: ali@ali.com
- API: http://localhost:8080/server/api

## Environment Variables / المتغيرات البيئية

Create `.env` file before building:
```env
VITE_API_URL=http://localhost:8080/server/api
VITE_APP_TITLE=المستودع الرقمي - مكتبة الملك فهد الوطنية
VITE_DEFAULT_LOCALE=ar
```

## Troubleshooting / استكشاف الأخطاء

### 404 Errors on Refresh
Make sure `try_files` directive is configured in nginx to fallback to index.html

### CORS Errors
Check that the proxy configuration in nginx is correct and DSpace allows the origin

### API Connection Failed
1. Verify DSpace is running: `http://localhost:8080/server/api`
2. Check nginx proxy settings
3. Verify CORS headers are being sent

## File Structure After Build / هيكل الملفات بعد البناء

```
C:\nginx\html\idr\
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   ├── vue-vendor-[hash].js
│   └── ...
└── favicon.ico
```
