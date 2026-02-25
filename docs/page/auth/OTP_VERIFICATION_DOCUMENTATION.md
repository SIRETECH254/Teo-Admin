# OTP Verification Screen Documentation

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
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import logo from '../../assets/logo.png'
import { otpSchema } from '../../utils/validation'
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.jsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `store/slices/authSlice.js` stores `user`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `localStorage` stores `accessToken`, `refreshToken`, serialized `user` data, and `pendingEmail`.
- **Hook usage on OTP screen:** `const { verifyOTP, resendOTP } = useAuth();`
- **Form state:** `otp` array `['', '', '', '', '', '']` managed with `useState` (6 digits).
- **Additional state:** `isLoading`, `resendLoading`, `countdown`, `email`, `validationErrors`.

**`verifyOTP` function (from `AuthContext.jsx`):**
```javascript
const verifyOTP = async (otpData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    
    try {
        const response = await authAPI.verifyOTP(otpData)
        const { user, accessToken, refreshToken } = response.data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))

        dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user }
        })

        toast.success('Email verified successfully!')
        return { success: true }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'OTP verification failed'
        dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: errorMessage
        })
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
    }
}
```

**`resendOTP` function (from `AuthContext.jsx`):**
```javascript
const resendOTP = async (emailData) => {
    try {
        await authAPI.resendOTP(emailData)
        toast.success('OTP has been resent to your email!')
        return { success: true }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to resend OTP'
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
    }
}
```

## UI Structure
- **Screen shell:** Two-column responsive layout (`flex-col md:flex-row`) with full-height container.
- **Left side:** Logo and title section, centered vertically and horizontally.
- **Right side:** OTP input form with 6 individual input fields, resend button, and back to login link.
- **Typography:** Uses Tailwind utility classes with custom `.title2` class for headings.
- **Branding:** Logo image displayed prominently on the left side.
- **Feedback:** Validation error banner shown below OTP inputs.

## Planned Layout
```
┌─────────────────────────────────────────────┐
│  Left Side          │    Right Side         │
│  ┌──────────────┐   │   ┌─────────────────┐ │
│  │    Logo      │   │   │ Enter 6-digit   │ │
│  │              │   │   │ code            │ │
│  └──────────────┘   │   │ [0][0][0][0][0][0]│ │
│                     │   ├─────────────────┤ │
│  Title:             │   │ Validation Error│ │
│  "Verify your       │   │ (if any)       │ │
│   email"            │   ├─────────────────┤ │
│                     │   │ Verify Email   │ │
│  Subtitle:          │   │ Button         │ │
│  "We've sent a      │   ├─────────────────┤ │
│   verification      │   │ Didn't receive │ │
│   code to"          │   │ the code?      │ │
│                     │   │ [Resend code]   │ │
│  Email:             │   ├─────────────────┤ │
│  user@example.com   │   │ [← Back to login]│ │
│                     │   └─────────────────┘ │
└─────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐              ┌──────────────────────────┐ │
│  │              │              │  Enter the 6-digit code  │ │
│  │    Logo      │              │                          │ │
│  │              │              │  [0] [0] [0] [0] [0] [0] │ │
│  └──────────────┘              │                          │ │
│                                 │  Validation error        │ │
│  Verify your email              │  (if any)               │ │
│  We've sent a verification      │                          │ │
│  code to                        │  [  Verify Email  ]     │ │
│  user@example.com               │                          │ │
│                                 │  Didn't receive the code?│ │
│                                 │  [🔄 Resend code]        │ │
│                                 │  (or "Resend in 60s")   │ │
│                                 │                          │ │
│                                 │  [← Back to login]      │ │
│                                 └──────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **OTP Input Fields** (6 individual inputs)
  ```javascript
  <div className="flex justify-between space-x-2">
      {otp.map((digit, index) => (
          <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="0"
          />
      ))}
  </div>
  ```

- **Validation Error Display**
  ```javascript
  {validationErrors.otp && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">{validationErrors.otp}</p>
      </div>
  )}
  ```

- **Submit Button**
  ```javascript
  <button
      type="submit"
      disabled={isLoading || otp.join('').length !== 6}
      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
  >
      {isLoading ? (
          <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
          </div>
      ) : (
          'Verify Email'
      )}
  </button>
  ```

- **Resend OTP Button**
  ```javascript
  <button
      type="button"
      onClick={handleResendOTP}
      disabled={resendLoading || countdown > 0}
      className="mt-2 text-sm font-medium text-primary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
  >
      {resendLoading ? (
          <div className="flex items-center">
              <FiRefreshCw className="animate-spin mr-2" />
              Sending...
          </div>
      ) : countdown > 0 ? (
          `Resend in ${countdown}s`
      ) : (
          <div className="flex items-center">
              <FiRefreshCw className="mr-2" />
              Resend code
          </div>
      )}
  </button>
  ```

- **Back to Login Button**
  ```javascript
  <button
      type="button"
      onClick={handleBackToLogin}
      className="text-sm font-medium text-gray-600 hover:text-primary flex items-center justify-center mx-auto"
  >
      <FiArrowLeft className="mr-2" />
      Back to login
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `authAPI.verifyOTP` and `authAPI.resendOTP`.
- **Verify OTP endpoint:** `POST /api/auth/verify-otp`.
- **Resend OTP endpoint:** `POST /api/auth/resend-otp`.
- **Verify OTP payload:** `{ email: string, otp: string }` (6-digit OTP string).
- **Resend OTP payload:** `{ email: string }`.
- **Response contract:** `response.data.data` contains `{ user, accessToken, refreshToken }` on successful verification.
- **Token handling:** Tokens saved to `localStorage`; Redux receives `setAuthSuccess` action.
- **Error responses:** API returns message in `response.data.message`; fallback to generic message.

## Components Used
- React + React Router DOM: `useNavigate`, `useLocation`, `Link`.
- Form elements: `input`, `button`, `label`, `div`, `p`.
- `react-icons/fi` for icons (FiMail, FiArrowLeft, FiRefreshCw).
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`).
- Logo image from `assets/logo.png`.

## Error Handling
- **Validation errors:** Yup schema validation (`otpSchema`) validates OTP format before submission.
  - OTP must be exactly 6 digits.
  - OTP must contain only numbers.
  - Email must be valid.
  - Errors stored in `validationErrors` state object.
  - Displayed in red banner below OTP inputs.
- **API errors:** Handled in `handleSubmit` function.
  - Error message displayed via toast notification.
  - Error stored in validation errors if validation fails.
- **Email retrieval:** Email retrieved from `location.state` or `localStorage.getItem('pendingEmail')`.
  - If no email found, user is redirected to `/login`.
- **Countdown timer:** Prevents spam resend requests with 60-second countdown.

## Navigation Flow
- **Route:** `/otp-verification`.
- **Entry points:**
  - From registration flow (email passed via `location.state`).
  - Direct access (email retrieved from `localStorage.getItem('pendingEmail')`).
- **On mount:** If no email found in state or localStorage, redirects to `/login`.
- **Successful verification:** `navigate('/dashboard')` (Note: actual code navigates to `/dashboard`, but based on App.jsx, it should be `/`).
- **Secondary navigation:**
  - "Back to login" button ➞ `/login` (clears `pendingEmail` from localStorage).
  - After successful verification, `pendingEmail` is removed from localStorage.

## Functions Involved

- **`handleSubmit`** — Validates OTP using Yup schema, calls `verifyOTP` API, handles navigation on success.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      setIsLoading(true)
      setValidationErrors({})

      try {
          const otpString = otp.join('')
          
          // Validate OTP
          await otpSchema.validate({
              otp: otpString,
              email
          }, { abortEarly: false })

          const result = await verifyOTP({
              email,
              otp: otpString
          })

          if (result.success) {
              localStorage.removeItem('pendingEmail')
              navigate('/dashboard')
          }
      } catch (validationError) {
          if (validationError.name === 'ValidationError') {
              const errors = {}
              validationError.inner.forEach((error) => {
                  errors[error.path] = error.message
              })
              setValidationErrors(errors)
          }
      } finally {
          setIsLoading(false)
      }
  }
  ```

- **`handleOtpChange`** — Updates individual OTP digit and auto-focuses next input.
  ```javascript
  const handleOtpChange = (index, value) => {
      if (value.length > 1) return // Only allow single digit
      
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
          const nextInput = document.getElementById(`otp-${index + 1}`)
          if (nextInput) nextInput.focus()
      }
  }
  ```

- **`handleKeyDown`** — Handles backspace to move focus to previous input.
  ```javascript
  const handleKeyDown = (index, e) => {
      // Handle backspace
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          const prevInput = document.getElementById(`otp-${index - 1}`)
          if (prevInput) prevInput.focus()
      }
  }
  ```

- **`handleResendOTP`** — Resends OTP code and starts countdown timer.
  ```javascript
  const handleResendOTP = async () => {
      setResendLoading(true)
      
      const result = await resendOTP({ email })
      
      if (result.success) {
          setCountdown(60) // 60 seconds countdown
      }
      
      setResendLoading(false)
  }
  ```

- **`handleBackToLogin`** — Clears pending email and navigates to login.
  ```javascript
  const handleBackToLogin = () => {
      localStorage.removeItem('pendingEmail')
      navigate('/login')
  }
  ```

- **Email retrieval effect** — Retrieves email from location state or localStorage on mount.
  ```javascript
  useEffect(() => {
      const emailFromState = location.state?.email
      const emailFromStorage = localStorage.getItem('pendingEmail')
      
      if (emailFromState) {
          setEmail(emailFromState)
          localStorage.setItem('pendingEmail', emailFromState)
      } else if (emailFromStorage) {
          setEmail(emailFromStorage)
      } else {
          // No email found, redirect to login
          navigate('/login')
      }
  }, [location, navigate])
  ```

- **Countdown timer effect** — Manages resend countdown timer.
  ```javascript
  useEffect(() => {
      if (countdown > 0) {
          const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
          return () => clearTimeout(timer)
      }
  }, [countdown])
  ```

## Future Enhancements
- Add SMS OTP support in addition to email OTP.
- Add voice call OTP option.
- Add OTP expiration timer display.
- Add auto-paste OTP from clipboard support.
- Add biometric verification option after OTP verification.
- Add rate limiting feedback for resend requests.
- Add option to change email address if OTP not received.
- Add accessibility improvements (ARIA labels, keyboard navigation).
- Add OTP verification attempts counter with account lockout after multiple failures.
