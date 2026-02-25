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
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiChevronDown } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaApple, FaInstagram } from 'react-icons/fa'
import logo from '../../assets/logo.png'
import { loginSchema } from '../../utils/validation'
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.jsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `store/slices/authSlice.js` stores `user`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `localStorage` stores `accessToken`, `refreshToken`, and serialized `user` data.
- **Hook usage on login screen:** `const { login, initiateGoogleAuth } = useAuth();`
- **Form state:** `formData` object `{ email, phone, password, loginMethod }` managed with `useState`.
- **Additional state:** `countryCode`, `showPassword`, `isLoading`, `error`, `validationErrors`.

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
- **Right side:** Login form with email/phone toggle, inputs, and social login buttons.
- **Typography:** Uses Tailwind utility classes with custom `.title2` class for headings.
- **Branding:** Logo image displayed prominently on the left side.
- **Feedback:** Error banner shown above submit button, validation errors below inputs.

## Planned Layout
```
┌─────────────────────────────────────────────┐
│  Left Side          │    Right Side         │
│  ┌──────────────┐   │   ┌─────────────────┐ │
│  │    Logo      │   │   │ Email/Phone     │ │
│  │              │   │   │ Toggle Buttons  │ │
│  └──────────────┘   │   ├─────────────────┤ │
│                     │   │ Email/Phone     │ │
│  Title:             │   │ Input Field    │ │
│  "Sign in to        │   ├─────────────────┤ │
│   your account"     │   │ Password Input │ │
│                     │   │ (with toggle)   │ │
│  Subtitle:          │   ├─────────────────┤ │
│  "Welcome back!     │   │ Error Message  │ │
│   Please enter      │   │ (if any)       │ │
│   your details."    │   ├─────────────────┤ │
│                     │   │ Forgot Password │ │
│                     │   ├─────────────────┤ │
│                     │   │ Sign in Button │ │
│                     │   ├─────────────────┤ │
│                     │   │ Divider: "Or    │ │
│                     │   │  continue with" │ │
│                     │   ├─────────────────┤ │
│                     │   │ Google Button  │ │
│                     │   │ Apple Button   │ │
│                     │   │ Instagram Btn  │ │
│                     │   └─────────────────┘ │
└─────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐              ┌──────────────────────────┐ │
│  │              │              │  [Email] [Phone]         │ │
│  │    Logo      │              │                          │ │
│  │              │              │  📧 Email/Phone Input    │ │
│  └──────────────┘              │                          │ │
│                                 │  🔒 Password [👁]        │ │
│  Sign in to your account        │                          │ │
│  Welcome back! Please enter     │  Error message (if any)  │ │
│  your details.                  │                          │ │
│                                 │  Forgot your password?   │ │
│                                 │                          │ │
│                                 │  [  Sign in  ]          │ │
│                                 │                          │ │
│                                 │  ─── Or continue with ── │ │
│                                 │                          │ │
│                                 │  [🔵 Continue with Google]│ │
│                                 │  [⚫ Continue with Apple] │ │
│                                 │  [📷 Continue w/ Instagram]│ │
│                                 └──────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Login Method Toggle** (Email/Phone)
  ```javascript
  <div className="flex rounded-lg shadow-sm overflow-hidden">
      <button
          type="button"
          onClick={() => handleLoginMethodChange('email')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
              formData.loginMethod === 'email'
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-primary'
          }`}
      >
          <FiMail className="inline mr-2" />
          Email
      </button>
      <button
          type="button"
          onClick={() => handleLoginMethodChange('phone')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
              formData.loginMethod === 'phone'
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-primary'
          }`}
      >
          <FiPhone className="inline mr-2" />
          Phone
      </button>
  </div>
  ```

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

- **Phone Input Field** (with Country Code Selector)
  ```javascript
  <div className="flex">
      <div className="relative flex-shrink-0">
          <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="h-full px-3 py-3 border border-gray-300 rounded-l-lg"
          >
              {countryCodes.map((country, index) => (
                  <option key={index} value={country.code}>
                      {country.flag} {country.code}
                  </option>
              ))}
          </select>
      </div>
      <div className="flex-1 relative">
          <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={`w-full px-4 py-3 border border-gray-300 rounded-r-lg ${validationErrors.phone ? 'border-red-500' : ''}`}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
          />
      </div>
      {validationErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
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

- **Social Login Buttons**
  ```javascript
  {/* Google Login */}
  <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
  >
      <FcGoogle className="w-5 h-5 mr-3" />
      <span className="font-medium">Continue with Google</span>
  </button>

  {/* Apple Login */}
  <button
      onClick={handleAppleLogin}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-black text-white hover:bg-gray-900"
  >
      <FaApple className="w-5 h-5 mr-3" />
      <span className="font-medium">Continue with Apple</span>
  </button>

  {/* Instagram Login */}
  <button
      onClick={handleInstagramLogin}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white"
  >
      <FaInstagram className="w-5 h-5 mr-3" />
      <span className="font-medium">Continue with Instagram</span>
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `authAPI.login`.
- **Endpoint:** `POST /api/auth/login`.
- **Payload:** `{ email: string, password: string }` OR `{ phone: string, password: string }`.
  - Phone number includes country code (e.g., `+254712345678`).
- **Response contract:** `response.data.data` contains `{ user, accessToken, refreshToken }`.
- **Token handling:** Tokens saved to `localStorage`; Redux receives `setAuthSuccess` action.
- **Error responses:** API returns message in `response.data.message`; fallback to generic message.

## Components Used
- React + React Router DOM: `useNavigate`, `Link`.
- Form elements: `input`, `button`, `label`, `div`, `p`, `select`, `option`.
- `react-icons/fi` for icons (FiMail, FiPhone, FiLock, FiEye, FiEyeOff).
- `react-icons/fc` for Google icon (FcGoogle).
- `react-icons/fa` for Apple and Instagram icons (FaApple, FaInstagram).
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
  - Social login buttons redirect to OAuth providers (Google redirects to Google OAuth page).

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
          const validationData = {
              ...formData,
              email: formData.loginMethod === 'email' ? formData.email : undefined,
              phone: formData.loginMethod === 'phone' ? formData.phone : undefined
          }
          
          await loginSchema.validate(validationData, { abortEarly: false })

          const credentials = {
              password: formData.password
          }

          if (formData.loginMethod === 'email') {
              credentials.email = formData.email
          } else {
              // Combine country code with phone number
              credentials.phone = countryCode + formData.phone
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

- **`handleLoginMethodChange`** — Switches between email and phone login methods.
  ```javascript
  const handleLoginMethodChange = (method) => {
      setFormData(prev => ({
          ...prev,
          loginMethod: method,
          email: method === 'email' ? prev.email : '',
          phone: method === 'phone' ? prev.phone : ''
      }))
  }
  ```

- **`handleGoogleLogin`** — Initiates Google OAuth flow.
  ```javascript
  const handleGoogleLogin = async () => {
      setIsLoading(true)
      setError('')

      try {
          await initiateGoogleAuth()
          // Note: The page will redirect to Google, so this code won't execute
      } catch (error) {
          console.error('Google login error:', error)
          setError('Failed to initiate Google authentication.')
          setIsLoading(false)
      }
  }
  ```

- **`handleAppleLogin`** — Placeholder for Apple OAuth (TODO: Implement).
  ```javascript
  const handleAppleLogin = () => {
      console.log('Apple login clicked')
      // TODO: Implement Apple OAuth
  }
  ```

- **`handleInstagramLogin`** — Placeholder for Instagram OAuth (TODO: Implement).
  ```javascript
  const handleInstagramLogin = () => {
      console.log('Instagram login clicked')
      // TODO: Implement Instagram OAuth
  }
  ```

## Future Enhancements
- Implement Apple OAuth authentication.
- Implement Instagram OAuth authentication.
- Add "Remember me" functionality if needed.
- Add rate limiting feedback when API returns rate limit errors.
- Add account lockout handling for multiple failed login attempts.
- Add biometric authentication support (fingerprint, face ID) for mobile devices.
- Add two-factor authentication (2FA) support.
- Add password strength indicator.
- Add login history tracking.
