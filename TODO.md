# Authentication Integration TODO

## Approved Plan Steps:

### 1. Create/Update RouteConfig.js with new auth routes (base: http://localhost:8081/api/v1)

- [x] Update base URL and add AUTH routes (LOGIN, SIGNUP, GOOGLE, REFRESH_TOKEN, LOGOUT, etc.)

### 2. Refactor apiRoute.js functions

- [x] Update login() to POST /api/v1/auth/login {username_or_email, password, remember_me}
- [x] Update signup() to POST /api/v1/auth/signup (derive username, first_name, etc.)
- [x] Add googleAuth({id_token})
- [x] Add refreshToken({refresh_token})
- [x] Add logout()

### 3. Update useApi.js with React Query hooks

- [x] Add useGoogleAuth(), useRefreshToken(), useLogout()

### 4. Install Keycloak packages

- [x] Run `npm install @react-keycloak/web keycloak-js`

### 5. Minor UI updates (Login/Signup.jsx)

- [ ] Add remember_me checkbox to Login
- [ ] Add terms/privacy checkboxes to Signup

### 6. Test & Complete

- [ ] Verify login/signup with backend
- [ ] Update AuthContext if needed for Keycloak init
- [ ] Mark complete
