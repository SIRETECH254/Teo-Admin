# Change Password Screen Documentation

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
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiSave, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'
```

## Context and State Management
- **AuthContext:** Uses `useAuth` hook to access `changePassword` function.
- **State management:** Local component state managed with `useState` hooks.
- **Password visibility:** `showPasswords` object with `{ current: boolean, new: boolean, confirm: boolean }`.
- **Form state:** `formData` object containing password fields:
  - `currentPassword`: Current password
  - `newPassword`: New password
  - `confirmPassword`: Confirmation of new password
- **Validation errors:** `errors` object with field-specific error messages.
- **Loading state:** `loading` boolean for form submission.

**`changePassword` function (from `AuthContext.jsx`):**
```javascript
const changePassword = async (passwordData) => {
    dispatch({ type: AUTH_ACTIONS.CHANGE_PASSWORD_START })
    try {
        const response = await authAPI.changePassword(passwordData)
        dispatch({
            type: AUTH_ACTIONS.CHANGE_PASSWORD_SUCCESS
        })
        toast.success('Password changed successfully!')
        return { success: true }
    } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password'
        dispatch({
            type: AUTH_ACTIONS.CHANGE_PASSWORD_FAILURE,
            payload: errorMessage
        })
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
    }
}
```

## UI Structure
- **Screen shell:** Full-width container with max-width constraint (`max-w-2xl mx-auto`) and padding (`p-6`).
- **Header section:** Back to Settings link, title with icon, and description.
- **Security notice:** Blue info banner with security tips.
- **Change password form:** White card with shadow containing password inputs, strength indicator, and requirements checklist.
- **Additional security info:** Section with two-factor authentication and login history info cards.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ← Back to Settings                                   │ │
│  │  🔒 Change Password                                    │ │
│  │  Update your account password for better security     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Security Tips                                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Change Password Form                                  │ │
│  │  Current Password: [________________] [👁]            │ │
│  │  New Password: [________________] [👁]                │ │
│  │  Password strength: [████░░] Strong                   │ │
│  │  Confirm Password: [________________] [👁]            │ │
│  │                                                       │ │
│  │  Password Requirements:                              │ │
│  │  ✓ At least 8 characters                             │ │
│  │  ✓ One lowercase letter                              │ │
│  │  ✓ One uppercase letter                              │ │
│  │  ✓ One number                                         │ │
│  │  ✓ One special character                              │ │
│  │                                                       │ │
│  │  [Cancel] [Change Password]                           │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ← Back to Settings                                           │
│                                                               │
│  🔒 Change Password                                           │
│  Update your account password for better security             │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🛡️ Security Tips                                   │   │
│  │  • Use a strong password with at least 8 characters│   │
│  │  • Include uppercase and lowercase letters         │   │
│  │  • Add numbers and special characters              │   │
│  │  • Avoid using personal information                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Current Password                                    │   │
│  │  [••••••••] [👁]                                    │   │
│  │                                                     │   │
│  │  New Password                                       │   │
│  │  [••••••••] [👁]                                    │   │
│  │  Password strength: [████░░] Strong                 │   │
│  │                                                     │   │
│  │  Confirm New Password                               │   │
│  │  [••••••••] [👁]                                    │   │
│  │                                                     │   │
│  │  Password Requirements:                             │   │
│  │  ✓ At least 8 characters long                       │   │
│  │  ✓ One lowercase letter (a-z)                       │   │
│  │  ✓ One uppercase letter (A-Z)                       │   │
│  │  ✓ One number (0-9)                                  │   │
│  │  ✓ One special character (!@#$%^&* etc.)           │   │
│  │                                                     │   │
│  │  [Cancel] [Change Password]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Current Password Input** (with show/hide toggle)
  ```javascript
  <div className="relative">
      <input
          type={showPasswords.current ? 'text' : 'password'}
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleInputChange}
          className={`input pr-10 ${errors.currentPassword ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder="Enter your current password"
      />
      <button
          type="button"
          onClick={() => togglePasswordVisibility('current')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
          {showPasswords.current ? (
              <FiEyeOff className="h-4 w-4 text-gray-400" />
          ) : (
              <FiEye className="h-4 w-4 text-gray-400" />
          )}
      </button>
  </div>
  {errors.currentPassword && (
      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
  )}
  ```

- **New Password Input** (with show/hide toggle and strength indicator)
  ```javascript
  <div className="relative">
      <input
          type={showPasswords.new ? 'text' : 'password'}
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          className={`input pr-10 ${errors.newPassword ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder="Enter your new password"
      />
      <button
          type="button"
          onClick={() => togglePasswordVisibility('new')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
          {showPasswords.new ? (
              <FiEyeOff className="h-4 w-4 text-gray-400" />
          ) : (
              <FiEye className="h-4 w-4 text-gray-400" />
          )}
      </button>
  </div>
  {formData.newPassword && (
      <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Password strength:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${strength.color}`}>
                  {strength.text}
              </span>
          </div>
          <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                  <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
                          level <= strength.level
                              ? strength.level === 1 ? 'bg-red-500'
                              : strength.level === 2 ? 'bg-yellow-500'
                              : strength.level === 3 ? 'bg-blue-500'
                              : 'bg-green-500'
                              : 'bg-gray-200'
                      }`}
                  />
              ))}
          </div>
      </div>
  )}
  ```

- **Password Requirements Checklist**
  ```javascript
  <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-2">Password Requirements:</h4>
      <ul className="text-sm text-gray-600 space-y-1">
          <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
              ✓ At least 8 characters long
          </li>
          <li className={/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One lowercase letter (a-z)
          </li>
          <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One uppercase letter (A-Z)
          </li>
          <li className={/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One number (0-9)
          </li>
          <li className={/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One special character (!@#$%^&* etc.)
          </li>
      </ul>
  </div>
  ```

- **Submit Button**
  ```javascript
  <button
      type="submit"
      className="btn btn-primary flex items-center gap-2"
      disabled={loading}
  >
      <FiSave className="h-4 w-4" />
      {loading ? 'Changing Password...' : 'Change Password'}
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `authAPI.changePassword`.
- **Change password endpoint:** `PUT /api/auth/change-password` (authenticated users only).
- **Payload:** `{ currentPassword: string, newPassword: string }`.
- **Response contract:** Standard API response (success/error message).
- **AuthContext update:** After successful change, password change action is dispatched.

## Components Used
- React + React Router DOM: `Link`.
- AuthContext: `useAuth` hook.
- Form elements: `input`, `button`, `form`, `label`, `div`, `ul`, `li`.
- `react-icons/fi` for icons (FiLock, FiEye, FiEyeOff, FiArrowLeft, FiSave, FiShield).
- Tailwind CSS classes for styling with custom classes (`.btn`, `.btn-primary`, `.btn-outline`, `.input`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Form validation:** Client-side validation with detailed error messages for each field.
- **Password strength:** Real-time strength indicator with visual feedback (Weak, Fair, Good, Strong).
- **Requirements checklist:** Visual checklist showing which requirements are met (green) or not met (gray).
- **API errors:** Handled in `changePassword` function in AuthContext, displayed via toast notification.
- **Form submission:** Submit button is disabled during submission (`loading` state).

## Navigation Flow
- **Route:** `/settings/change-password`.
- **Entry points:**
  - From settings landing page via "Change Password" card.
  - Direct URL navigation.
- **On successful change:** Form is cleared, success toast is shown, user stays on same page.
- **On cancel:** "Cancel" link ➞ `/settings`.
- **Back navigation:** "Back to Settings" link ➞ `/settings`.

## Functions Involved

- **`handleInputChange`** — Updates form data and clears field errors.
  ```javascript
  const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({
          ...prev,
          [name]: value
      }))

      // Clear error for this field when user starts typing
      if (errors[name]) {
          setErrors(prev => ({
              ...prev,
              [name]: ''
          }))
      }
  }
  ```

- **`togglePasswordVisibility`** — Toggles password visibility for a specific field.
  ```javascript
  const togglePasswordVisibility = (field) => {
      setShowPasswords(prev => ({
          ...prev,
          [field]: !prev[field]
      }))
  }
  ```

- **`validateForm`** — Validates all form fields and returns boolean.
  ```javascript
  const validateForm = () => {
      const newErrors = {}

      if (!formData.currentPassword) {
          newErrors.currentPassword = 'Current password is required'
      }

      if (!formData.newPassword) {
          newErrors.newPassword = 'New password is required'
      } else if (formData.newPassword.length < 8) {
          newErrors.newPassword = 'Password must be at least 8 characters long'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
          newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }

      if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your new password'
      } else if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
      }

      if (formData.currentPassword === formData.newPassword) {
          newErrors.newPassword = 'New password must be different from current password'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
  }
  ```

- **`handleSubmit`** — Validates form and submits via AuthContext.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()

      if (!validateForm()) {
          return
      }

      setLoading(true)

      try {
          await changePassword({
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
          })

          // Clear form
          setFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
          })

          toast.success('Password changed successfully!')
      } catch (error) {
          console.error('Password change error:', error)
          toast.error(error.message || 'Failed to change password')
      } finally {
          setLoading(false)
      }
  }
  ```

- **`passwordStrength`** — Calculates password strength based on various criteria.
  ```javascript
  const passwordStrength = (password) => {
      if (!password) return { level: 0, text: '', color: '' }

      let score = 0
      const checks = [
          password.length >= 8,
          /[a-z]/.test(password),
          /[A-Z]/.test(password),
          /\d/.test(password),
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      ]

      score = checks.filter(Boolean).length

      if (score <= 2) return { level: 1, text: 'Weak', color: 'text-red-600 bg-red-50' }
      if (score <= 3) return { level: 2, text: 'Fair', color: 'text-yellow-600 bg-yellow-50' }
      if (score <= 4) return { level: 3, text: 'Good', color: 'text-blue-600 bg-blue-50' }
      return { level: 4, text: 'Strong', color: 'text-green-600 bg-green-50' }
  }
  ```

## Future Enhancements
- Add password history check (prevent reusing recent passwords).
- Add password expiration reminder.
- Add two-factor authentication integration.
- Add password recovery options.
- Add biometric authentication support.
- Add password manager integration.
- Add password sharing (secure) for team accounts.
- Add password policy customization.
- Add password strength meter with detailed feedback.
- Add password change confirmation email.
- Add password change audit log.
- Add password change rate limiting.
