# CSRF Protection Implementation

## Overview

This document describes the CSRF (Cross-Site Request Forgery) protection implementation for the superadmin platform. CSRF protection is critical since we use httpOnly cookies for authentication, which are automatically sent with every request to the server.

**Requirements Addressed:** 8.7, 9.6

## What is CSRF?

CSRF is an attack that tricks a user's browser into making unwanted requests to a web application where the user is authenticated. Since browsers automatically send cookies with requests, an attacker can craft a malicious website that makes requests to our API using the victim's authentication cookies.

## Implementation Details

### Library Used

We use `csrf-csrf` package, which implements the **Double Submit Cookie** pattern:
- A CSRF token is generated and stored in a cookie
- The same token must be sent in the request header/body
- The server validates that both tokens match

### Middleware Components

#### 1. CSRF Token Generation (`csrfTokenGenerator`)
- Generates a new CSRF token
- Sets it in a cookie and makes it available in `res.locals.csrfToken`
- Used on routes that need to provide tokens to clients

#### 2. CSRF Protection (`csrfProtection`)
- Validates CSRF tokens on state-changing requests
- Automatically applied to POST, PUT, PATCH, DELETE routes
- Returns 403 error if token is invalid or missing

#### 3. CSRF Token Endpoint (`getCsrfToken`)
- Route handler at `/api/v1/superadmin/auth/csrf-token`
- Clients call this to obtain a CSRF token before making state-changing requests

### Configuration

```javascript
{
  cookieName: "x-csrf-token",
  cookieOptions: {
    httpOnly: true,        // Prevents JavaScript access
    sameSite: "strict",    // Prevents cross-site requests
    secure: true,          // HTTPS only in production
    path: "/"
  },
  size: 64,                // Token size in bytes
  ignoredMethods: ["GET", "HEAD", "OPTIONS"]
}
```

### Token Sources

The middleware checks for CSRF tokens in the following order:
1. `x-csrf-token` header (preferred)
2. `_csrf` field in request body
3. `_csrf` query parameter (fallback)

## Protected Routes

All state-changing superadmin routes are protected:

### Authentication Routes
- `POST /api/v1/superadmin/auth/login`
- `POST /api/v1/superadmin/auth/logout`

### Restaurant Management
- `POST /api/v1/superadmin/restaurants` - Create restaurant
- `PATCH /api/v1/superadmin/restaurants/:id` - Update restaurant
- `DELETE /api/v1/superadmin/restaurants/:id` - Deactivate restaurant

### Subscription Management
- `POST /api/v1/superadmin/subscriptions/plans` - Create plan
- `PATCH /api/v1/superadmin/subscriptions/plans/:id` - Update plan
- `DELETE /api/v1/superadmin/subscriptions/plans/:id` - Deactivate plan
- `POST /api/v1/superadmin/subscriptions/assignments` - Assign subscription
- `PATCH /api/v1/superadmin/subscriptions/assignments/:id` - Change subscription

### User Management
- `POST /api/v1/superadmin/users` - Create user
- `PATCH /api/v1/superadmin/users/:id` - Update user
- `DELETE /api/v1/superadmin/users/:id` - Deactivate user
- `POST /api/v1/superadmin/users/:id/reset-password` - Reset password

### Menu Management
- `PATCH /api/v1/superadmin/menus/items/:id` - Update menu item
- `DELETE /api/v1/superadmin/menus/items/:id` - Delete menu item
- `POST /api/v1/superadmin/menus/categories` - Create category
- `PATCH /api/v1/superadmin/menus/bulk` - Bulk update items

### Staff Management
- `POST /api/v1/superadmin/staff` - Create staff
- `PATCH /api/v1/superadmin/staff/:id` - Update staff
- `DELETE /api/v1/superadmin/staff/:id` - Deactivate staff

## Client Integration

### Step 1: Obtain CSRF Token

Before making any state-changing request, the client must obtain a CSRF token:

```javascript
// Get CSRF token
const response = await fetch('/api/v1/superadmin/auth/csrf-token', {
  method: 'GET',
  credentials: 'include' // Important: include cookies
});

const { csrfToken } = await response.json();
```

### Step 2: Include Token in Requests

Include the CSRF token in the `x-csrf-token` header:

```javascript
// Make authenticated request with CSRF token
const response = await fetch('/api/v1/superadmin/restaurants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken  // Include CSRF token
  },
  credentials: 'include',  // Include cookies
  body: JSON.stringify(restaurantData)
});
```

### Example: Complete Flow

```javascript
// 1. Get CSRF token
async function getCsrfToken() {
  const response = await fetch('/api/v1/superadmin/auth/csrf-token', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.csrfToken;
}

// 2. Make protected request
async function createRestaurant(restaurantData) {
  const csrfToken = await getCsrfToken();
  
  const response = await fetch('/api/v1/superadmin/restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(restaurantData)
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      // CSRF token invalid - get new token and retry
      throw new Error('CSRF token invalid');
    }
    throw new Error('Request failed');
  }
  
  return response.json();
}
```

### Axios Integration

For Axios users, you can create an interceptor:

```javascript
import axios from 'axios';

// Store CSRF token
let csrfToken = null;

// Function to get CSRF token
async function fetchCsrfToken() {
  const response = await axios.get('/api/v1/superadmin/auth/csrf-token', {
    withCredentials: true
  });
  csrfToken = response.data.csrfToken;
  return csrfToken;
}

// Request interceptor to add CSRF token
axios.interceptors.request.use(async (config) => {
  // Only add CSRF token for state-changing methods
  if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    // Get token if we don't have one
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

// Response interceptor to handle CSRF errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && 
        error.response?.data?.error?.includes('CSRF')) {
      // CSRF token invalid - get new token and retry
      await fetchCsrfToken();
      error.config.headers['x-csrf-token'] = csrfToken;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Testing CSRF Protection

### Test 1: Valid Request with CSRF Token

```bash
# Get CSRF token
TOKEN=$(curl -c cookies.txt -b cookies.txt \
  http://localhost:3000/api/v1/superadmin/auth/csrf-token \
  | jq -r '.csrfToken')

# Make request with token
curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -X POST \
  -d '{"name":"Test Restaurant","address":"123 Main St",...}' \
  http://localhost:3000/api/v1/superadmin/restaurants
```

### Test 2: Request Without CSRF Token (Should Fail)

```bash
curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"name":"Test Restaurant","address":"123 Main St",...}' \
  http://localhost:3000/api/v1/superadmin/restaurants

# Expected: 403 Forbidden with error message
```

### Test 3: Request with Invalid CSRF Token (Should Fail)

```bash
curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: invalid-token-12345" \
  -X POST \
  -d '{"name":"Test Restaurant","address":"123 Main St",...}' \
  http://localhost:3000/api/v1/superadmin/restaurants

# Expected: 403 Forbidden with error message
```

## Security Considerations

### Why Double Submit Cookie Pattern?

1. **Automatic Cookie Sending**: Browsers automatically send cookies with requests
2. **JavaScript Access**: Attacker's JavaScript cannot read httpOnly cookies
3. **Cross-Origin Restrictions**: Attacker cannot read cookies from another domain
4. **Token Validation**: Server validates that cookie token matches header token

### Additional Security Measures

1. **SameSite Cookie Attribute**: Set to "strict" to prevent cross-site requests
2. **Secure Cookie**: Only sent over HTTPS in production
3. **HttpOnly Cookie**: Prevents JavaScript access to the cookie
4. **Token Rotation**: New token generated for each session
5. **Rate Limiting**: Combined with rate limiting to prevent brute force

### Limitations

CSRF protection does NOT protect against:
- XSS (Cross-Site Scripting) attacks - use input sanitization
- Man-in-the-middle attacks - use HTTPS
- Compromised client devices - use additional authentication factors

## Environment Configuration

Add to your `.env` file:

```env
# CSRF Protection Secret (minimum 32 characters)
CSRF_SECRET=your-secure-random-string-here-minimum-32-characters
```

Generate a secure secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Troubleshooting

### Error: "Invalid or missing CSRF token"

**Causes:**
1. No CSRF token in request
2. Token expired or invalid
3. Cookie not sent with request

**Solutions:**
1. Ensure you call `/csrf-token` endpoint first
2. Include `credentials: 'include'` in fetch requests
3. Add `withCredentials: true` in Axios config
4. Check that cookies are enabled in browser

### Error: "CSRF token generation error"

**Causes:**
1. Missing CSRF_SECRET in environment
2. Invalid secret configuration

**Solutions:**
1. Add CSRF_SECRET to .env file
2. Ensure secret is at least 32 characters
3. Restart server after adding secret

## Monitoring and Logging

CSRF validation errors are logged with:
- Error message
- Request URL
- Request method
- Timestamp

Monitor these logs for:
- Unusual spike in CSRF errors (possible attack)
- Legitimate users experiencing issues
- Configuration problems

## Future Enhancements

1. **Token Rotation**: Implement automatic token rotation after each use
2. **Per-Session Tokens**: Generate unique tokens per user session
3. **Token Expiration**: Add time-based token expiration
4. **Metrics**: Track CSRF validation success/failure rates
5. **Alerts**: Alert on suspicious CSRF error patterns

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetsecurity.github.io/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [csrf-csrf Documentation](https://github.com/Psifi-Solutions/csrf-csrf)
- [Double Submit Cookie Pattern](https://cheatsheetsecurity.github.io/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
