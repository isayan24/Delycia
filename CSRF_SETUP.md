# CSRF Protection Setup

## Overview
The superadmin platform now has CSRF (Cross-Site Request Forgery) protection enabled using the Double Submit Cookie Pattern.

## How It Works

### Backend (Server)
1. **CSRF Token Endpoint**: `GET /api/v1/superadmin/auth/csrf-token`
   - Returns a CSRF token in the response body
   - Sets an httpOnly cookie containing the token hash
   - No authentication required

2. **Protected Endpoints**: All POST, PUT, PATCH, DELETE requests require:
   - The CSRF token cookie (automatically sent by browser)
   - The CSRF token in the `x-csrf-token` header

3. **Login Endpoint**: `POST /api/v1/superadmin/auth/login`
   - Requires CSRF token in header
   - Protected by rate limiting (5 requests per 15 minutes)

### Frontend (Superadmin App)
The axios instance (`superadmin/src/lib/axios.ts`) automatically handles CSRF tokens:

1. **Automatic Token Fetching**: Before any POST/PUT/PATCH/DELETE request, it fetches a CSRF token if one doesn't exist
2. **Automatic Token Inclusion**: Adds the token to the `x-csrf-token` header
3. **Automatic Token Refresh**: If a 403 error with CSRF message is received, it fetches a new token and retries

## Testing with Postman

### Important Postman Settings
1. Go to Settings (⚙️ icon) → General
2. Enable "Automatically follow redirects"
3. Enable "Send cookies with requests"
4. Disable "SSL certificate verification" (for local development only)

### Step 1: Get CSRF Token
Create a new request:
```
Method: GET
URL: http://localhost:8020/api/v1/superadmin/auth/csrf-token
```

Click "Send". You should see:
```json
{
  "status": true,
  "csrfToken": "long-token-string-here"
}
```

**Important**: Check the "Cookies" tab in the response. You should see a cookie named `x-csrf-token` was set.

### Step 2: Login with CSRF Token

**CRITICAL**: You must use the SAME Postman tab/request for login, or the cookie won't be sent!

**Method 1: Using the same Postman tab (Recommended)**
1. After getting the CSRF token in Step 1, stay in the same tab
2. Change the method to POST
3. Change the URL to: `http://localhost:8020/api/v1/superadmin/auth/login`
4. Go to Headers tab and add:
   - Key: `x-csrf-token`
   - Value: (paste the token from Step 1 response)
5. Go to Body tab, select "raw" and "JSON", then paste:
```json
{
  "username": "superadmin",
  "password": "SuperAdmin@2024"
}
```
6. Click Send

**Method 2: Using a new tab (Advanced)**
If you must use a new tab:
1. After Step 1, go to Cookies (below the Send button)
2. Copy the `x-csrf-token` cookie value
3. In your new POST request tab, go to Cookies
4. Manually add the cookie with the same domain (localhost:8020)
5. Then add the token to headers and send the request

**Expected Success Response**:
```json
{
  "statusCode": 200,
  "message": "Authentication successful",
  "data": {
    "_id": "user-uid-here",
    "username": "superadmin",
    "email": "superadmin@delycia.com",
    "role": 1000
  }
}
```

**Common Issues**:
1. **"Invalid CSRF token"**: The cookie wasn't sent. Check:
   - You're using the same Postman tab
   - Cookies are enabled in Postman settings
   - The cookie domain matches (localhost)

2. **"Invalid credentials"**: Wrong username/password. Use:
   - Username: `superadmin`
   - Password: `SuperAdmin@2024`
   - Or Email: `superadmin@delycia.com`

3. **Token expired**: Get a fresh token from Step 1 and try again immediately

## Testing with cURL

### Get CSRF Token
```bash
curl -c cookies.txt http://localhost:8020/api/v1/superadmin/auth/csrf-token
```

### Login with CSRF Token
```bash
# Extract token from response
TOKEN="your-token-here"

curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  http://localhost:8020/api/v1/superadmin/auth/login
```

## Configuration

### Creating the Superadmin User

Before you can login, you need to create a superadmin user. Run this script:

```bash
cd server
node src/scripts/create_superadmin.js
```

This will create a superadmin user with:
- **Username**: `superadmin`
- **Email**: `superadmin@delycia.com`
- **Password**: `SuperAdmin@2024`

**⚠️ IMPORTANT**: Change this password after first login!

### Environment Variables
- `CSRF_SECRET`: Secret key for HMAC generation (set in `server/.env`)
- `NODE_ENV`: Set to "production" to enable secure cookies (HTTPS only)

### Cookie Settings
- Name: `x-csrf-token`
- HttpOnly: `true` (prevents JavaScript access)
- SameSite: `strict` (prevents cross-site requests)
- Secure: `true` in production (HTTPS only)
- Path: `/`

## Security Notes

1. **Never expose CSRF tokens in URLs** - Always use headers or request body
2. **Never return the cookie value in `getCsrfTokenFromRequest`** - This would bypass protection
3. **Rotate tokens on privilege elevation** - Generate new token after login/logout
4. **Use HTTPS in production** - Required for secure cookies

## Troubleshooting

### Error: "Invalid or missing CSRF token"
- Ensure you're sending the CSRF token in the `x-csrf-token` header
- Ensure cookies are enabled and being sent with the request
- Check that the token hasn't expired or been invalidated

### Error: "Failed to generate CSRF token"
- Check that `CSRF_SECRET` is set in `server/.env`
- Verify the csrf-csrf package is installed: `npm list csrf-csrf`

### Frontend automatically handles CSRF
If you're using the superadmin frontend, you don't need to manually handle CSRF tokens. The axios instance does it automatically.
