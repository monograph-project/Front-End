# Authentication & Login Guide

## Overview

The User Microservice provides comprehensive authentication with three methods:
1. **Email/Username + Password Login**
2. **Signup/Registration**
3. **Google OAuth2 "Sign in with Google"**

---

## 1. Traditional Login (Email/Username + Password)

### Endpoint
```
POST /api/v1/auth/login
```

### Request
```json
{
  "username_or_email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "remember_me": false
}
```

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzUxMiJ9...",
  "refresh_token": "eyJhbGciOiJIUzUxMiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "ACTIVE",
    "email_verified": true,
    "two_factor_enabled": false,
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Login successful"
}
```

### Features
- ✅ Email or username login
- ✅ Secure password hashing (BCrypt)
- ✅ Failed login attempt tracking
- ✅ Account locking after 5 failed attempts
- ✅ IP address and user agent logging
- ✅ JWT token generation

### Example cURL
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "remember_me": false
  }'
```

---

## 2. User Signup/Registration

### Endpoint
```
POST /api/v1/auth/signup
```

### Request
```json
{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "terms_agreed": true,
  "privacy_agreed": true
}
```

### Password Requirements
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzUxMiJ9...",
  "refresh_token": "eyJhbGciOiJIUzUxMiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "ACTIVE",
    "email_verified": false,
    "two_factor_enabled": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Signup successful. Please verify your email"
}
```

### Features
- ✅ Email validation
- ✅ Username uniqueness check
- ✅ Strong password requirements
- ✅ Terms and privacy agreement enforcement
- ✅ Automatic Keycloak user creation
- ✅ Default role assignment (USER)
- ✅ Email verification required
- ✅ Immediate token generation

### Example cURL
```bash
curl -X POST http://localhost:8081/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "terms_agreed": true,
    "privacy_agreed": true
  }'
```

---

## 3. Google OAuth2 ("Sign in with Google")

### Setup Instructions

#### Step 1: Create Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - http://localhost:3000/auth/google/callback (local development)
     - https://yourdomain.com/auth/google/callback (production)
5. Copy Client ID and Client Secret

#### Step 2: Configure Environment Variables

```bash
# .env file
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Step 3: Frontend Implementation (React Example)

```html
<!-- Add Google's sign-in script -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- Google Sign-In Button -->
<div id="g_id_onload"
  data-client_id="YOUR_GOOGLE_CLIENT_ID"
  data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
function handleCredentialResponse(response) {
  // Send ID token to backend
  const idToken = response.credential;
  
  fetch('/api/v1/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id_token: idToken,
      device_id: generateDeviceId()
    })
  })
  .then(res => res.json())
  .then(data => {
    // Store token and redirect to dashboard
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    window.location.href = '/dashboard';
  })
  .catch(err => console.error('Authentication failed:', err));
}

function generateDeviceId() {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
</script>
```

### Endpoint
```
POST /api/v1/auth/google
```

### Request
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiOTRjNjQ4MzBmMDk4OWYwNDg3OGQzZmEwN2FjZjEzN2ZjY2FkMDQiLCJ0eXAiOiJKV1QifQ...",
  "access_token": "ya29.a0AfH6SMBx...",
  "device_id": "device_1705318200000_abc123def456"
}
```

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzUxMiJ9...",
  "refresh_token": "eyJhbGciOiJIUzUxMiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john.doe_1705318200000",
    "email": "john.doe@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "ACTIVE",
    "email_verified": true,
    "two_factor_enabled": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Google login successful"
}
```

### Features
- ✅ Secure Google ID token verification
- ✅ Automatic user creation from Google profile
- ✅ Pre-verified email from Google
- ✅ Unique username generation
- ✅ Device tracking
- ✅ Login attempt logging
- ✅ Existing user detection and login
- ✅ First and last name extraction from Google profile

### Google ID Token Payload Example
```json
{
  "iss": "https://accounts.google.com",
  "azp": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "aud": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "sub": "1234567890",
  "email": "john.doe@gmail.com",
  "email_verified": true,
  "at_hash": "abc123",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "iat": 1705318200,
  "exp": 1705321800
}
```

### Example cURL
```bash
curl -X POST http://localhost:8081/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "id_token": "eyJhbGciOiJSUzI1NiIs...",
    "device_id": "device_123"
  }'
```

---

## Token Management

### Refresh Access Token

When access token expires, use refresh token to get a new one.

**Endpoint:**
```
POST /api/v1/auth/refresh-token
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzUxMiJ9...",
  "refresh_token": "eyJhbGciOiJIUzUxMiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": { ... },
  "message": "Token refreshed successfully"
}
```

**Token Lifetimes:**
- Access Token: 1 hour (3600 seconds)
- Refresh Token: 7 days

### Example cURL
```bash
curl -X POST http://localhost:8081/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzUxMiJ9..."
  }'
```

---

## Password Management

### Change Password

**Endpoint:**
```
POST /api/v1/auth/change-password/{userId}
```

**Request:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully",
  "status": "success"
}
```

### Forgot Password

**Endpoint:**
```
POST /api/v1/auth/forgot-password
```

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent. Check your email for instructions",
  "status": "success"
}
```

### Reset Password with Token

**Endpoint:**
```
POST /api/v1/auth/reset-password
```

**Request:**
```json
{
  "reset_token": "eyJhbGciOiJIUzUxMiJ9...",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully",
  "status": "success"
}
```

---

## Email Verification

### Verify Email with Token

**Endpoint:**
```
POST /api/v1/auth/verify-email
```

**Request:**
```json
{
  "verification_token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

### Resend Verification Email

**Endpoint:**
```
POST /api/v1/auth/resend-verification-email
```

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

---

## Logout

### Endpoint
```
POST /api/v1/auth/logout
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Logout successful. Please clear the token on client side",
  "status": "success"
}
```

---

## Security Features

### Password Security
- ✅ BCrypt hashing (salted and adaptive)
- ✅ Minimum 8 characters
- ✅ Complexity requirements (uppercase, lowercase, number, special char)
- ✅ Password history (cannot reuse recent passwords)
- ✅ Secure password reset with time-limited tokens

### Account Security
- ✅ Failed login attempt tracking
- ✅ Account locking after 5 failed attempts (30-minute lockout)
- ✅ Account status management (active, inactive, suspended, deleted)
- ✅ Last login tracking
- ✅ IP address logging
- ✅ User agent logging
- ✅ Device tracking

### Token Security
- ✅ JWT with HS512 signing algorithm
- ✅ Token expiration (1 hour access, 7 days refresh)
- ✅ Token signature verification
- ✅ Claims validation (user ID, roles, permissions)
- ✅ Automatic token expiration

### Google OAuth2 Security
- ✅ Google ID token signature verification
- ✅ Audience validation
- ✅ Issuer validation
- ✅ Token expiration checking
- ✅ No sensitive data in transit (uses server-side verification)

### Audit & Compliance
- ✅ All login attempts logged
- ✅ Success and failure tracking
- ✅ IP address and device information
- ✅ Account change tracking
- ✅ Password change history
- ✅ Email verification history

---

## Error Handling

### Common Error Responses

#### Invalid Credentials
```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Invalid email/username or password"
}
```

#### User Not Found
```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "User not found with email: john@example.com"
}
```

#### Duplicate Email
```json
{
  "status": 409,
  "error": "CONFLICT",
  "message": "A user already exists with email: john@example.com"
}
```

#### Account Locked
```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Account is locked. Please try again later"
}
```

#### Invalid Token
```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

---

## Frontend Implementation Example

### React Login Component
```jsx
import { useState } from 'react';
import axios from 'axios';

export default function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/auth/login', {
        username_or_email: email,
        password: password,
        remember_me: true
      });

      // Store tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email or Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## API Token Usage

All authenticated requests require the Authorization header:

```
Authorization: Bearer {access_token}
```

### Example
```bash
curl -X GET http://localhost:8081/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

---

## Troubleshooting

### Google OAuth2 Issues

**"Invalid Google ID token"**
- Verify Google Client ID matches frontend and backend
- Check token hasn't expired (valid for ~1 hour)
- Ensure ID token, not access token, is being sent

**"Audience validation failed"**
- Verify GOOGLE_CLIENT_ID environment variable is set correctly
- Check Google OAuth2 credentials in Cloud Console

### Login Issues

**"Account is locked"**
- Wait 30 minutes for automatic unlock
- Admin can unlock with: `POST /api/v1/users/{id}/activate`

**"Invalid email/username or password"**
- Check email or username spelling
- Verify password is correct
- Ensure account is not deleted

**"Account is suspended"**
- Contact administrator
- Admin can activate with: `POST /api/v1/users/{id}/activate`

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (HttpOnly cookies recommended)
3. **Refresh tokens proactively** before expiration
4. **Clear tokens on logout** on both client and server
5. **Validate token expiration** on the client
6. **Use strong passwords** (14+ characters recommended)
7. **Enable two-factor authentication** for sensitive accounts
8. **Monitor failed login attempts** and account lockouts
9. **Regularly review audit logs** for suspicious activity
10. **Rotate JWT secrets** periodically in production

---

## Support

For questions or issues:
- Check API_DOCUMENTATION.md
- Review ARCHITECTURE.md
- See DEPLOYMENT.md for environment setup
