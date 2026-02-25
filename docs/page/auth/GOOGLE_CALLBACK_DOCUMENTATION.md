# Google Callback Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```javascript
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.jsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `store/slices/authSlice.js` stores `user`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `localStorage` stores `accessToken`, `refreshToken`, and serialized `user` data after successful authentication.
- **Hook usage on Google callback screen:** `const { handleGoogleCallback } = useAuth();`
- **Component state:** `error` string, `isLoading` boolean managed with `useState`.
- **URL params:** OAuth callback parameters extracted from URL search params using `useSearchParams()`.

**`handleGoogleCallback` function (from `AuthContext.jsx`):**
```javascript
const handleGoogleCallback = async (code) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    reduxDispatch(setAuthLoading(true))

    try {
        const response = await authAPI.googleAuthCallback({ code })
        const { user, tokens } = response.data.data

        // Store tokens and user data
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(user))

        dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user }
        })
        reduxDispatch(setAuthSuccess(user))

        toast.success('Google authentication successful!')
        return { success: true }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Google authentication failed'
        dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: errorMessage
        })
        reduxDispatch(setAuthFailure(errorMessage))
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
    }
}
```

## UI Structure
- **Screen shell:** Full-height centered container with loading or error states.
- **Loading state:** Centered spinner with loading message.
- **Error state:** Centered error message with "Back to Login" button.
- **Success state:** Component returns `null` and navigates automatically (no UI shown).
- **Typography:** Uses Tailwind utility classes for text styling.
- **No branding:** No logo or branding elements (minimal UI for callback processing).

## Planned Layout

### Loading State Layout
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│              [Spinner]                      │
│                                             │
│     Completing Google authentication...    │
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

### Error State Layout
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│     ┌─────────────────────────────────┐   │
│     │  Authentication Failed          │   │
│     │                                 │   │
│     │  Error message details...       │   │
│     └─────────────────────────────────┘   │
│                                             │
│          [  Back to Login  ]               │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

## Sketch Wireframe

### Loading State
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                                                               │
│                                                               │
│                    ⭕ (spinning)                              │
│                                                               │
│          Completing Google authentication...                 │
│                                                               │
│                                                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Error State
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                                                               │
│                                                               │
│     ┌───────────────────────────────────────────────────┐   │
│     │                                                   │   │
│     │  Authentication Failed                           │   │
│     │                                                   │   │
│     │  No authorization code received from Google      │   │
│     │  (or other error message)                        │   │
│     │                                                   │   │
│     └───────────────────────────────────────────────────┘   │
│                                                               │
│                    [  Back to Login  ]                       │
│                                                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **No form inputs:** This page does not contain any form inputs. It automatically processes the OAuth callback from URL parameters.

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `authAPI.googleAuthCallback`.
- **Endpoint:** `POST /api/auth/google/callback`.
- **Payload:** `{ code: string }` (authorization code from Google OAuth).
- **URL parameters:** Extracted from URL search params:
  - `code`: Authorization code from Google (required for success).
  - `error`: Error code from Google OAuth (if authentication failed).
  - `state`: State parameter for CSRF protection (optional).
- **Response contract:** `response.data.data` contains `{ user, tokens: { accessToken, refreshToken } }` on successful authentication.
- **Token handling:** Tokens saved to `localStorage`; Redux receives `setAuthSuccess` action.
- **Error responses:** API returns message in `response.data.message`; fallback to generic message.

## Components Used
- React + React Router DOM: `useNavigate`, `useSearchParams`.
- UI elements: `div`, `button`, `p`.
- Tailwind CSS classes for styling (`.btn-primary`, spinner classes).
- No icons or images used (minimal UI).

## Error Handling
- **URL parameter errors:** Checks for `error` parameter in URL search params.
  - If present, displays error message from Google OAuth.
  - Sets error state and stops processing.
- **Missing code:** Checks if `code` parameter exists in URL.
  - If missing, displays error message and stops processing.
- **API errors:** Handled in `handleGoogleCallback` function.
  - Error message displayed in error state UI.
  - Error also shown via toast notification.
- **Loading state:** Shows spinner while processing OAuth callback.
- **Automatic retry:** No automatic retry mechanism (user must click "Back to Login" and try again).

## Navigation Flow
- **Route:** `/auth/google/callback`.
- **Entry points:**
  - Automatic redirect from Google OAuth after user authorizes.
  - URL contains OAuth callback parameters (`code`, `error`, `state`).
- **On mount:** Component automatically processes callback in `useEffect`.
- **Successful authentication:** `navigate('/', { replace: true })` (root route, which shows Dashboard for authenticated users).
- **Error state:** User can click "Back to Login" button ➞ `/login`.

## Functions Involved

- **`handleCallback` (useEffect)** — Main function that processes OAuth callback on component mount.
  ```javascript
  useEffect(() => {
      const handleCallback = async () => {
          try {
              console.log('Google callback initiated')
              console.log('Search params:', Object.fromEntries(searchParams.entries()))

              const code = searchParams.get('code')
              const error = searchParams.get('error')
              const state = searchParams.get('state')

              console.log('OAuth callback details:', { code: !!code, error, state })

              if (error) {
                  console.error('OAuth error received:', error)
                  setError(`Authentication failed: ${error}`)
                  setIsLoading(false)
                  return
              }

              if (!code) {
                  console.error('No authorization code received')
                  setError('No authorization code received from Google')
                  setIsLoading(false)
                  return
              }

              console.log('Processing authorization code...')
              const result = await handleGoogleCallback(code)

              if (result.success) {
                  navigate('/', { replace: true })
              } else {
                  setError(result.error || 'Authentication failed')
              }
          } catch (err) {
              console.error('Google callback error:', err)
              setError('Authentication failed. Please try again.')
          } finally {
              setIsLoading(false)
          }
      }

      handleCallback()
  }, [searchParams, handleGoogleCallback, navigate])
  ```

- **Loading state render** — Displays spinner while processing.
  ```javascript
  if (isLoading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Completing Google authentication...</p>
              </div>
          </div>
      )
  }
  ```

- **Error state render** — Displays error message with back to login button.
  ```javascript
  if (error) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="max-w-md mx-auto text-center">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                      <p className="font-medium">Authentication Failed</p>
                      <p className="text-sm mt-1">{error}</p>
                  </div>
                  <button
                      onClick={() => navigate('/login')}
                      className="btn-primary"
                  >
                      Back to Login
                  </button>
              </div>
          </div>
      )
  }
  ```

- **Success state** — Returns null and navigates automatically (no UI).
  ```javascript
  return null
  ```

## Future Enhancements
- Add retry mechanism for failed authentication attempts.
- Add option to select different Google account if multiple accounts available.
- Add state parameter validation for CSRF protection.
- Add logging/analytics for OAuth callback success/failure rates.
- Add timeout handling for slow network connections.
- Add option to cancel OAuth flow and return to login.
- Add support for other OAuth providers (Apple, Instagram, etc.).
- Add email verification step after OAuth authentication.
- Add account linking for users who already have accounts.
- Add accessibility improvements (ARIA labels, keyboard navigation).
- Add loading progress indicator with estimated time.
- Add option to remember OAuth provider preference.
