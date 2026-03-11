# Login Screen Documentation

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
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import logo from '../../assets/logo.png'
import { loginSchema } from '../../utils/validation'
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.jsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `store/slices/authSlice.js` stores `user`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `localStorage` stores `accessToken`, `refreshToken`, and serialized `user` data.
- **Hook usage on login screen:** `const { login } = useAuth();`
- **Form state:** `formData` object `{ email, password }` managed with `useState`.
- **Additional state:** `showPassword`, `isLoading`, `error`, `validationErrors`.

**`login` function (from `AuthContext.jsx`):**
```javascript
const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    reduxDispatch(setAuthLoading(true))
    
    try {
        const response = await authAPI.login(credentials)
        const { user, accessToken, refreshToken } = response.data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))

        dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user }
        })
        reduxDispatch(setAuthSuccess(user))

        toast.success('Login successful!')
        return { success: true }
    } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Login failed'
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
- **Screen shell:** Two-column responsive layout (`flex-col lg:flex-row`) with full-height container.
- **Left side:** Logo and title section, centered vertically and horizontally.
- **Right side:** Login form with email and password inputs.
- **Typography:** Uses Tailwind utility classes with custom `.title2` class for headings.
- **Branding:** Logo image displayed prominently on the left side.
- **Feedback:** Error banner shown above submit button, validation errors below inputs.

## Planned Layout
```
┌─────────────────────────────────────────────┐
│  Left Side          │    Right Side         │
│  ┌──────────────┐   │   ┌─────────────────┐ │
│  │    Logo      │   │   │ Email Input     │ │
│  │              │   │   │ Field           │ │
│  └──────────────┘   │   ├─────────────────┤ │
│                     │   │ Password Input │ │
│  Title:             │   │ (with toggle)   │ │
│  "Sign in to        │   ├─────────────────┤ │
│   your account"     │   │ Error Message  │ │
│                     │   │ (if any)       │ │
│  Subtitle:          │   ├─────────────────┤ │
│  "Welcome back!     │   │ Forgot Password │ │
│   Please enter      │   ├─────────────────┤ │
│   your details."    │   │ Sign in Button │ │
│                     │   └─────────────────┘ │
└─────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐              ┌──────────────────────────┐ │
│  │              │              │                          │ │
│  │    Logo      │              │  📧 Email Input          │ │
│  │              │              │                          │ │
│  └──────────────┘              │  🔒 Password [👁]        │ │
│                                 │                          │ │
│  Sign in to your account        │  Error message (if any)  │ │
│  Welcome back! Please enter     │                          │ │
│  your details.                  │  Forgot your password?   │ │
│                                 │                          │ │
│                                 │  [  Sign in  ]          │ │
│                                 └──────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Email Input Field**
  ```javascript
  <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiMail className="h-5 w-5 text-primary" />
      </div>
      <input
          id="email"
          name="email"
          type="email"
          required
          className={`input pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
      />
      {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
      )}
  </div>
  ```

- **Password Field** (with show/hide toggle)
  ```javascript
  <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiLock className="h-5 w-5 text-primary" />
      </div>
      <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          className={`input pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-primary hover:text-secondary"
          >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
      </div>
      {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
      )}
  </div>
  ```

- **Submit Button**
  ```javascript
  <button
      type="submit"
      disabled={isLoading}
      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
  >
      {isLoading ? (
          <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
          </div>
      ) : (
          'Sign in'
      )}
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `authAPI.login`.
- **Endpoint:** `POST /api/auth/login`.
- **Payload:** `{ email: string, password: string }`.
- **Response contract:** `response.data.data` contains `{ user, accessToken, refreshToken }`.
- **Token handling:** Tokens saved to `localStorage`; Redux receives `setAuthSuccess` action.
- **Error responses:** API returns message in `response.data.message`; fallback to generic message.

## Components Used
- React + React Router DOM: `useNavigate`, `Link`.
- Form elements: `input`, `button`, `label`, `div`, `p`.
- `react-icons/fi` for icons (FiMail, FiLock, FiEye, FiEyeOff).
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.input`).
- Logo image from `assets/logo.png`.

## Error Handling
- **Validation errors:** Yup schema validation (`loginSchema`) validates form data before submission.
  - Errors stored in `validationErrors` state object.
  - Displayed below each input field in red text.
- **API errors:** Handled in `handleSubmit` function.
  - Error message displayed in red banner above submit button.
  - Error stored in local `error` state.
- **Input change handling:** `handleInputChange` updates form data and clears validation errors.
- **Form state persistence:** Input values persist in local state after validation failures.

## Navigation Flow
- **Route:** `/login`.
- **On app launch:** `/` redirects based on auth state:
  - Authenticated ➞ `/` (Dashboard).
  - Not authenticated ➞ `/login`.
- **Successful login:** `navigate('/')` (root route, which shows Dashboard for authenticated users).
- **Secondary navigation:**
  - "Forgot your password?" link ➞ `/forgot-password`.

## Functions Involved

- **`handleSubmit`** — Validates form data using Yup schema, calls `login` API, handles navigation on success.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      setIsLoading(true)
      setError('')
      setValidationErrors({})

      try {
          // Validate form data
          await loginSchema.validate(formData, { abortEarly: false })

          const credentials = {
              email: formData.email,
              password: formData.password
          }

          const result = await login(credentials)
          
          if (result.success) {
              navigate('/')
          } else {
              setError(result.error)
          }
      } catch (validationError) {
          if (validationError.name === 'ValidationError') {
              const errors = {}
              validationError.inner.forEach((error) => {
                  errors[error.path] = error.message
              })
              setValidationErrors(errors)
          } else {
              setError('An unexpected error occurred')
          }
      } finally {
          setIsLoading(false)
      }
  }
  ```

- **`handleInputChange`** — Updates form data state when user types in input fields.
  ```javascript
  const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({
          ...prev,
          [name]: value
      }))
  }
  ```

## Future Enhancements
- Add "Remember me" functionality if needed.
- Add rate limiting feedback when API returns rate limit errors.
- Add account lockout handling for multiple failed login attempts.
- Add biometric authentication support (fingerprint, face ID) for mobile devices.
- Add two-factor authentication (2FA) support.
- Add password strength indicator.
- Add login history tracking.
