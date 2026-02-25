# Forgot Password Screen Documentation

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
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import logo from '../../assets/logo.png'
import { forgotPasswordSchema } from '../../utils/validation'
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.jsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `store/slices/authSlice.js` stores `user`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `localStorage` stores tokens and user data (not used for forgot password flow).
- **Hook usage on forgot password screen:** `const { forgotPassword } = useAuth();`
- **Form state:** `email` string managed with `useState`.
- **Additional state:** `isLoading`, `isSubmitted`, `validationErrors`.

**`forgotPassword` function (from `AuthContext.jsx`):**
```javascript
const forgotPassword = async (email) => {
    try {
        await authAPI.forgotPassword(email)
        toast.success('Password reset instructions sent to your email!')
        return { success: true }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to send reset email'
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
    }
}
```

## UI Structure
- **Screen shell:** Two-column responsive layout (`flex-col md:flex-row`) with full-height container.
- **Left side:** Logo and title section, centered vertically and horizontally.
- **Right side:** Email input form OR success message with confirmation.
- **Typography:** Uses Tailwind utility classes with custom `.title2` class for headings.
- **Branding:** Logo image displayed prominently on the left side.
- **Feedback:** Validation error displayed below email input, success state shows confirmation message.

## Planned Layout

### Form State Layout
```
┌─────────────────────────────────────────────┐
│  Left Side          │    Right Side         │
│  ┌──────────────┐   │   ┌─────────────────┐ │
│  │    Logo      │   │   │ Email address   │ │
│  │              │   │   │ [📧 Input field] │ │
│  └──────────────┘   │   ├─────────────────┤ │
│                     │   │ Validation Error│ │
│  Title:             │   │ (if any)       │ │
│  "Forgot your       │   ├─────────────────┤ │
│   password?"        │   │ Send reset      │ │
│                     │   │ instructions    │ │
│  Subtitle:          │   │ Button         │ │
│  "No worries!       │   ├─────────────────┤ │
│   Enter your email  │   │ [← Back to login]│ │
│   and we'll send    │   └─────────────────┘ │
│   you reset         │                       │
│   instructions."    │                       │
└─────────────────────────────────────────────┘
```

### Success State Layout
```
┌─────────────────────────────────────────────┐
│  Left Side          │    Right Side         │
│  ┌──────────────┐   │   ┌─────────────────┐ │
│  │    Logo      │   │   │ ✓ Success Icon  │ │
│  │              │   │   │                 │ │
│  └──────────────┘   │   │ Check your email│ │
│                     │   │                 │ │
│  Title:             │   │ We've sent      │ │
│  "Check your        │   │ password reset  │ │
│   email"            │   │ instructions to │ │
│                     │   │ user@example.com│ │
│  Subtitle:          │   │                 │ │
│  "We've sent        │   │ If you don't see│ │
│   password reset    │   │ the email, check│ │
│   instructions to"  │   │ your spam folder│ │
│                     │   │                 │ │
│  Email:             │   │ [← Back to login]│ │
│  user@example.com   │   │                 │ │
│                     │   │ Didn't receive │ │
│                     │   │ the email?      │ │
│                     │   │ [Try again]     │ │
│                     │   └─────────────────┘ │
└─────────────────────────────────────────────┘
```

## Sketch Wireframe

### Form State
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐              ┌──────────────────────────┐ │
│  │              │              │  Email address            │ │
│  │    Logo      │              │  📧 [_________________]   │ │
│  │              │              │                          │ │
│  └──────────────┘              │  Validation error         │ │
│                                 │  (if any)                │ │
│  Forgot your password?          │                          │ │
│  No worries! Enter your email   │  [Send reset instructions]│ │
│  and we'll send you reset       │                          │ │
│  instructions.                  │  [← Back to login]      │ │
│                                 └──────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Success State
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐              ┌──────────────────────────┐ │
│  │              │              │      ✓                   │ │
│  │    Logo      │              │                          │ │
│  │              │              │  Check your email        │ │
│  └──────────────┘              │                          │ │
│                                 │  We've sent password     │ │
│  Check your email                │  reset instructions to  │ │
│  We've sent password reset       │  user@example.com       │ │
│  instructions to                 │                          │ │
│  user@example.com                │  If you don't see the    │ │
│                                  │  email, check your spam │ │
│                                  │  folder.                │ │
│                                  │                          │ │
│                                  │  [← Back to login]      │ │
│                                  │                          │ │
│                                  │  Didn't receive the     │ │
│                                  │  email? [Try again]     │ │
│                                  └──────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Email Input Field**
  ```javascript
  <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email address
      </label>
      <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-primary" />
          </div>
          <input
              id="email"
              name="email"
              type="email"
              required
              className={`input pl-10 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
          />
          {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
      </div>
  </div>
  ```

- **Submit Button**
  ```javascript
  <button
      type="submit"
      disabled={isLoading || !email}
      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
  >
      {isLoading ? (
          <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
          </div>
      ) : (
          'Send reset instructions'
      )}
  </button>
  ```

- **Back to Login Link**
  ```javascript
  <Link
      to="/login"
      className="text-sm font-medium text-gray-600 hover:text-primary flex items-center justify-center mx-auto"
  >
      <FiArrowLeft className="mr-2" />
      Back to login
  </Link>
  ```

- **Success State - Back to Login Button**
  ```javascript
  <Link
      to="/login"
      className="btn-primary inline-flex items-center"
  >
      <FiArrowLeft className="mr-2" />
      Back to login
  </Link>
  ```

- **Success State - Try Again Button**
  ```javascript
  <button
      onClick={() => setIsSubmitted(false)}
      className="font-medium text-primary hover:text-secondary transition-colors"
  >
      Try again
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `authAPI.forgotPassword`.
- **Endpoint:** `POST /api/auth/forgot-password`.
- **Payload:** `{ email: string }`.
- **Response contract:** Success response typically contains `{ success: true, message: string }`.
- **Token handling:** No tokens involved in forgot password flow.
- **Error responses:** API returns message in `response.data.message`; fallback to generic message.

## Components Used
- React + React Router DOM: `Link`.
- Form elements: `input`, `button`, `label`, `div`, `p`.
- `react-icons/fi` for icons (FiMail, FiArrowLeft).
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.input`).
- Logo image from `assets/logo.png`.

## Error Handling
- **Validation errors:** Yup schema validation (`forgotPasswordSchema`) validates email format before submission.
  - Email must be valid format.
  - Email is required.
  - Errors stored in `validationErrors` state object.
  - Displayed below email input in red text.
- **API errors:** Handled in `handleSubmit` function.
  - Error message displayed via toast notification.
  - Error stored in validation errors if validation fails.
- **Form state persistence:** Email value persists in local state after validation failures.

## Navigation Flow
- **Route:** `/forgot-password`.
- **Entry points:**
  - From login page via "Forgot your password?" link.
  - Direct URL access.
- **On successful submission:** Component switches to success state (no navigation).
- **Secondary navigation:**
  - "Back to login" link ➞ `/login`.
  - "Try again" button (in success state) ➞ Resets to form state.

## Functions Involved

- **`handleSubmit`** — Validates email using Yup schema, calls `forgotPassword` API, switches to success state on success.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      setIsLoading(true)
      setValidationErrors({})

      try {
          // Validate email
          await forgotPasswordSchema.validate({ email }, { abortEarly: false })

          const result = await forgotPassword(email)

          if (result.success) {
              setIsSubmitted(true)
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

## Future Enhancements
- Add phone number option for password reset (SMS verification).
- Add security questions as alternative verification method.
- Add account recovery hints for locked or disabled accounts.
- Add rate limiting feedback when API returns rate limit errors.
- Add email delivery status tracking.
- Add option to resend reset email if not received.
- Add password reset link expiration timer display.
- Add accessibility improvements (ARIA labels, keyboard navigation).
- Add CAPTCHA to prevent abuse.
- Add email domain validation for better user experience.
