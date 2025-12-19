# Security Policy / سياسة الأمان

## Security Features / ميزات الأمان

This digital repository implements the following security measures:

### 1. Input Validation & Sanitization / التحقق من المدخلات وتعقيمها
- All user inputs are sanitized before processing
- Search queries are cleaned to prevent XSS attacks
- Email addresses are validated before authentication
- UUID parameters are validated to prevent injection

### 2. Authentication Security / أمان المصادقة
- Rate limiting on login attempts (5 attempts per 5 minutes)
- Session tokens stored in sessionStorage (not localStorage)
- CSRF token handling for all API requests
- Automatic token cleanup on logout

### 3. API Security / أمان واجهة البرمجة
- CORS configured for API communication
- HTTPS recommended for production
- Request timeouts to prevent hanging connections
- Response interceptors for handling authentication errors

### 4. Frontend Security / أمان الواجهة الأمامية
- Content Security Policy headers
- X-Frame-Options to prevent clickjacking
- X-XSS-Protection headers
- No inline scripts (CSP compliant)

## Development Guidelines / إرشادات التطوير

### Do's / افعل
- Always sanitize user inputs
- Use parameterized queries
- Validate all external data
- Keep dependencies updated
- Run `npm audit` regularly

### Don'ts / لا تفعل
- Never store passwords in client-side storage
- Never expose API keys in frontend code
- Never trust user input without validation
- Never disable CSRF protection

## Reporting Vulnerabilities / الإبلاغ عن الثغرات

If you discover a security vulnerability, please:
1. Do not create a public GitHub issue
2. Contact the security team directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for a fix before disclosure

## Dependencies / التبعيات

All dependencies are regularly audited for known vulnerabilities.
Run `npm run security-check` to verify.

## Environment Variables / المتغيرات البيئية

Sensitive configuration should be stored in environment variables:
- `VITE_API_URL` - DSpace API endpoint
- Never commit `.env` files with real credentials

## Supported Versions / الإصدارات المدعومة

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
