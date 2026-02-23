# AuthContext Documentation

## Overview

This document provides comprehensive documentation for the AuthContext implementation in the TEO-ADMIN dashboard. The AuthContext provides authentication functionality by coordinating a local `useReducer` and the **Redux** store as the primary source of truth for the application.

**Location:** `src/contexts/AuthContext.jsx`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Storage Strategy](#storage-strategy)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The AuthContext provides a centralized authentication system that:

- Uses **Redux** as the primary source of truth for auth state across the app.
- Uses a local **useReducer** to manage transitionary states within the provider.
- Persists authentication state using **localStorage** and **Redux Persist**.
- Integrates with **react-router-dom** for navigation.
- Provides authentication functions (login, register, Google OAuth, OTP, etc.).
- Handles background user profile refreshing on app initialization.

### Component Structure

```
AuthProvider (Context Provider)
├── Redux Integration (useSelector, useDispatch)
├── Local Reducer (useReducer for internal flow)
├── localStorage Integration (token and user persistence)
├── Navigation Integration (useNavigate)
└── Auth Functions (login, googleAuth, register, etc.)
```

---

## State Management

### Dual State Approach

- **Redux Store**: Managed via `authSlice`. It holds the global state used by all components.
- **Local Reducer**: Used internally by `AuthProvider` to manage specific workflow states like `LOGIN_START`.

### Exposed State

The context exposes state derived from the Redux store:

- `user`: The current user object.
- `isAuthenticated`: Boolean flag for auth status.
- `isLoading`: Loading state for auth operations.
- `error`: Error messages from auth attempts.

### Redux Actions Used

The context dispatches the following actions to `src/store/slices/authSlice.js`:

- `setAuthLoading(boolean)`: Toggles loading state.
- `setAuthSuccess(user)`: Sets user and marks as authenticated.
- `setAuthFailure(error)`: Sets error message and resets auth if critical.
- `clearAuth()`: Resets all auth state to initial.

---

## Storage Strategy

### localStorage Keys

- `accessToken`: JWT access token.
- `refreshToken`: JWT refresh token.
- `user`: Serialized user object.

### Storage Flow

1. **Rehydration**: On mount, the provider reads `accessToken` and `user` from `localStorage` to immediately restore state before any API calls.
2. **Background Validation**: It calls `authAPI.getMe()` to refresh the user profile without clearing tokens on network failure.
3. **Persistence**: Tokens and user data are updated in `localStorage` during login, verification, and profile updates.
4. **Cleanup**: All keys are removed from `localStorage` on logout.

---

## API Reference

### Context Value

The `AuthContext` provides the following value:

| Name | Type | Description |
|------|------|-------------|
| `user` | Object | Current user data |
| `isAuthenticated` | Boolean | True if user is logged in |
| `isLoading` | Boolean | True during auth checks/actions |
| `error` | String | Current error message |
| `login(credentials)` | Function | Login with email/password |
| `register(userData)` | Function | New user registration |
| `verifyOTP(otpData)` | Function | Email/Phone verification |
| `resendOTP(emailData)` | Function | Resend verification code |
| `forgotPassword(email)` | Function | Request password reset |
| `resetPassword(t, p)` | Function | Reset password with token |
| `updateProfile(data)` | Function | Update user profile |
| `changePassword(data)` | Function | Change user password |
| `logout()` | Function | Clear session and navigate to login |
| `initiateGoogleAuth()` | Function | Start Google OAuth flow |
| `handleGoogleCallback(c)`| Function | Handle OAuth redirect code |
| `clearError()` | Function | Clear current error state |

---

## Integration Guide

### 1. Provider Setup

Wrap your app with `AuthProvider` inside the Redux `Provider` and `Router`:

```javascript
// src/main.jsx
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { store } from './store'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </Provider>
)
```

### 2. Using Auth in Components

```javascript
import { useAuth } from './contexts/AuthContext'

function ProfileHeader() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) return null

  return (
    <div>
      <p>Hello, {user.firstName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

## Usage Examples

### Login Flow

```javascript
const { login } = useAuth()

const handleSubmit = async (values) => {
  const result = await login(values)
  if (result.success) {
    navigate('/')
  }
}
```

### Google OAuth

```javascript
const { initiateGoogleAuth } = useAuth()

// This will redirect the browser to Google
const handleGoogleLogin = () => initiateGoogleAuth()
```

---

## Best Practices

1. **Use Context over Redux Directly**: Prefer `useAuth()` over `useSelector((s) => s.auth)` for components to ensure consistent logic.
2. **Error Handling**: Auth functions return `{ success, error }`. Always check the `success` flag in your UI components.
3. **Tokens**: Never manually manipulate `accessToken` in components; let the context and API interceptors handle it.

---

## Troubleshooting

- **State Sync**: If Redux state and Context state seem out of sync, ensure the `AuthProvider` is correctly placed within the Redux `Provider`.
- **Persistent Login**: If users are logged out on refresh, check if `localStorage` is being cleared by another script or if the `user` key is corrupted.
- **Background Refresh**: The background user refresh (`getMe`) does not log users out on failure to prevent issues with temporary network instability.

---

**Last Updated:** February 2026  
**Version:** 1.1.0 (JS Implementation)
