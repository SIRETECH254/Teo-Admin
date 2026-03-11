# Profile Screen Documentation

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
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiUser, FiMail, FiPhone, FiEdit, FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
```

## Context and State Management
- **AuthContext:** Uses `useAuth` hook to access `user` object and `updateProfile` function.
- **State management:** Local component state managed with `useState` hooks.
- **Edit mode:** `isEditing` boolean to toggle between view and edit modes.
- **Form state:** `formData` object containing profile fields:
  - `name`: Full name
  - `email`: Email address
  - `phone`: Phone number
- **Loading state:** `loading` boolean for form submission.

**`updateProfile` function (from `AuthContext.jsx`):**
```javascript
const updateProfile = async (profileData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE_START })
    try {
        const response = await authAPI.updateProfile(profileData)
        const updatedUser = response.data.data.user
        
        dispatch({
            type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
            payload: { user: updatedUser }
        })
        reduxDispatch(setAuthSuccess(updatedUser))
        
        toast.success('Profile updated successfully!')
        return { success: true }
    } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile'
        dispatch({
            type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE,
            payload: errorMessage
        })
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
    }
}
```

## UI Structure
- **Screen shell:** Full-width container with max-width constraint (`max-w-4xl mx-auto`) and padding (`p-6`).
- **Header section:** Back to Settings link, title, description, and Edit Profile button (when not editing).
- **Profile card:** White card with shadow and border containing profile information.
- **View mode:** Displays avatar, name, email, phone, and account status.
- **Edit mode:** Form with name, email, and phone inputs, plus Cancel and Save buttons.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ← Back to Settings                                   │ │
│  │  Profile                    [Edit Profile]            │ │
│  │  Manage your personal information                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Profile Card                                         │ │
│  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │  [Avatar]  Name                                │ │ │
│  │  │            Email                                │ │ │
│  │  │            Role                                 │ │ │
│  │  └───────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  Name: [Value]                                       │ │
│  │  Email: [Value]                                      │ │
│  │  Phone: [Value]                                      │ │
│  │                                                       │ │
│  │  Account Status: Active                              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ← Back to Settings                                           │
│                                                               │
│  Profile                                    [Edit Profile]    │
│  Manage your personal information                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  [👤 Avatar]  John Doe                             │   │
│  │              john@example.com                      │   │
│  │              Role: Admin                            │   │
│  │                                                     │   │
│  │  ────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │  👤 Name                                           │   │
│  │     John Doe                                       │   │
│  │                                                     │   │
│  │  📧 Email                                          │   │
│  │     john@example.com                               │   │
│  │                                                     │   │
│  │  📱 Phone                                          │   │
│  │     +254712345678                                  │   │
│  │                                                     │   │
│  │  ────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │  Account Status                                    │   │
│  │  Your account is active and verified                │   │
│  │                                    [Active]         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Edit Profile Button** (view mode only)
  ```javascript
  {!isEditing && (
      <button
          onClick={() => setIsEditing(true)}
          className="btn btn-primary flex items-center gap-2"
      >
          <FiEdit className="h-4 w-4" />
          Edit Profile
      </button>
  )}
  ```

- **Avatar Display** (view mode)
  ```javascript
  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
      {user.avatar ? (
          <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-full h-full object-cover"
          />
      ) : (
          <div className="w-full h-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
              {(user.name || 'U')?.charAt(0)?.toUpperCase()}
          </div>
      )}
  </div>
  ```

- **Name Input** (edit mode)
  ```javascript
  <input
      type="text"
      id="name"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      className="input"
      required
  />
  ```

- **Email Input** (edit mode)
  ```javascript
  <input
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      className="input"
      required
  />
  ```

- **Phone Input** (edit mode)
  ```javascript
  <input
      type="tel"
      id="phone"
      name="phone"
      value={formData.phone}
      onChange={handleInputChange}
      className="input"
  />
  ```

- **Save Button** (edit mode)
  ```javascript
  <button
      type="submit"
      className="btn btn-primary flex items-center gap-2"
      disabled={loading}
  >
      <FiSave className="h-4 w-4" />
      {loading ? 'Saving...' : 'Save Changes'}
  </button>
  ```

- **Cancel Button** (edit mode)
  ```javascript
  <button
      type="button"
      onClick={handleCancel}
      className="btn btn-outline flex items-center gap-2"
      disabled={loading}
  >
      <FiX className="h-4 w-4" />
      Cancel
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `authAPI.updateProfile`.
- **Update profile endpoint:** `PUT /api/auth/profile` (authenticated users only).
- **Payload:** `{ name: string, email: string, phone: string }`.
- **Response contract:** `response.data.data.user` contains the updated user object.
- **AuthContext update:** After successful update, user data is updated in both AuthContext and Redux store.

## Components Used
- React + React Router DOM: `Link`.
- AuthContext: `useAuth` hook.
- Form elements: `input`, `button`, `form`, `label`, `div`, `img`.
- `react-icons/fi` for icons (FiUser, FiMail, FiPhone, FiEdit, FiArrowLeft, FiSave, FiX).
- Tailwind CSS classes for styling with custom classes (`.btn`, `.btn-primary`, `.btn-outline`, `.input`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Spinner displayed while `loading` is true, buttons disabled.
- **User not found:** Loading spinner displayed if user is not available.
- **API errors:** Handled in `updateProfile` function in AuthContext, displayed via toast notification.
- **Form validation:** HTML5 validation (required fields, email format).

## Navigation Flow
- **Route:** `/settings/profile`.
- **Entry points:**
  - From settings landing page via "Profile" card.
  - Direct URL navigation.
- **On successful update:** Stays on same page, switches to view mode, shows success toast, user data is refreshed.
- **On cancel:** Switches back to view mode, resets form data to original user values.
- **Back navigation:** "Back to Settings" link ➞ `/settings`.

## Functions Involved

- **User data loading effect** — Loads user data and populates form.
  ```javascript
  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name || user.firstName + ' ' + user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
          })
      }
  }, [user])
  ```

- **`handleInputChange`** — Updates form data when user types.
  ```javascript
  const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({
          ...prev,
          [name]: value
      }))
  }
  ```

- **`handleSubmit`** — Validates form and submits via AuthContext.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)

      try {
          await updateProfile(formData)
          setIsEditing(false)
      } catch (error) {
          console.error('Profile update error:', error)
      } finally {
          setLoading(false)
      }
  }
  ```

- **`handleCancel`** — Cancels editing and resets form data.
  ```javascript
  const handleCancel = () => {
      if (user) {
          setFormData({
              name: user.name || user.firstName + ' ' + user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
          })
      }
      setIsEditing(false)
  }
  ```

## Future Enhancements
- Add avatar upload functionality.
- Add profile picture cropping/editing.
- Add profile completion progress indicator.
- Add profile verification badges.
- Add profile privacy settings.
- Add profile activity log.
- Add profile export functionality.
- Add profile backup/restore.
- Add profile sharing options.
- Add profile themes/preferences.
- Add profile notification preferences.
- Add profile two-factor authentication settings.
