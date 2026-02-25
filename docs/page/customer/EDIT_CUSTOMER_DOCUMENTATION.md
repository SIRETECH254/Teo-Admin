# Edit Customer Screen Documentation

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
import { useParams, useNavigate } from 'react-router-dom'
import { useGetUserById, useUpdateUserStatus } from '../../hooks/useUsers'
import { useGetRoles } from '../../hooks/useRoles'
```

## Context and State Management
- **TanStack Query hooks:** `useGetUserById`, `useUpdateUserStatus` for data fetching and mutations, `useGetRoles` for role options.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Form state:** `form` object containing user fields:
  - `name`: User name (read-only, displayed)
  - `email`: User email (read-only, displayed)
  - `isActive`: Active status (boolean, editable)
  - `isVerified`: Verified status (boolean, not editable in form but displayed)
  - `roles`: Array of selected role IDs (editable via checkboxes)
- **Loading state:** `isLoading` from `useGetUserById` hook.

**`useGetUserById` hook (from `hooks/useUsers.js`):**
```javascript
export const useGetUserById = (userId) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const response = await userAPI.getUserById(userId)
            return response.data
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdateUserStatus` hook (from `hooks/useUsers.js`):**
```javascript
export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, data }) => {
            const response = await userAPI.updateUserStatus(userId, data)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['user'] })
            toast.success(data.message || 'User updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update user error:', error)
            toast.error(error.response?.data?.message || 'Failed to update user')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Form card:** White card with shadow and border, max-width container.
- **Form section:** Single-column form with read-only name/email fields, active status checkbox, and role selection checkboxes.
- **Form actions:** Save button at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Edit Customer                                        │ │
│  │                                                       │ │
│  │  Name                                                │ │
│  │  [John Doe] (disabled)                               │ │
│  │                                                       │ │
│  │  Email                                               │ │
│  │  [john@example.com] (disabled)                        │ │
│  │                                                       │ │
│  │  ☑ Active                                            │ │
│  │                                                       │ │
│  │  Roles                                               │ │
│  │  ☑ Admin  ☐ Manager  ☐ Viewer                       │ │
│  │                                                       │ │
│  │  [Save]                                              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Edit Customer                                     │   │
│  │                                                     │   │
│  │  Name                                              │   │
│  │  [John Doe] (disabled)                             │   │
│  │                                                     │   │
│  │  Email                                             │   │
│  │  [john@example.com] (disabled)                      │   │
│  │                                                     │   │
│  │  ☑ Active                                          │   │
│  │                                                     │   │
│  │  Roles                                             │   │
│  │  ☑ Admin    ☐ Manager    ☐ Viewer                 │   │
│  │                                                     │   │
│  │  [Save]                                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Name Input** (read-only)
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700">Name</label>
      <input 
          disabled 
          value={form.name} 
          className="input mt-1" 
      />
  </div>
  ```

- **Email Input** (read-only)
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700">Email</label>
      <input 
          disabled 
          value={form.email} 
          className="input mt-1" 
      />
  </div>
  ```

- **Active Status Checkbox**
  ```javascript
  <div className="flex items-center gap-4">
      <label className="inline-flex items-center gap-2">
          <input 
              type="checkbox" 
              checked={form.isActive} 
              onChange={() => handleToggle('isActive')} 
          />
          <span>Active</span>
      </label>
  </div>
  ```

- **Role Selection Checkboxes**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
      <div className="flex flex-wrap gap-2">
          {(rolesData?.data?.roles || []).map((role) => (
              <label key={role._id} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm">
                  <input
                      type="checkbox"
                      checked={form.roles.includes(role._id)}
                      onChange={() => toggleRole(role._id)}
                  />
                  <span>{role.name}</span>
              </label>
          ))}
      </div>
  </div>
  ```

- **Submit Button**
  ```javascript
  <button 
      type="submit" 
      className="btn-primary" 
      disabled={updateUser.isPending}
  >
      Save
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `userAPI.getUserById` and `userAPI.updateUserStatus`.
- **Get user endpoint:** `GET /api/users/:id` (admin only).
- **Update user endpoint:** `PUT /api/users/:id/status` (admin only).
- **Payload:** `{ isActive: boolean, roles: string[] }` (only active status and roles can be updated).
- **Response contract:** `response.data.data.user` contains the user object.
- **Cache invalidation:** After successful update, both `['users']` and `['user', id]` queries are invalidated.

## Components Used
- React + React Router DOM: `useNavigate`, `useParams`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `button`, `form`, `label`, `div`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.input`).

## Error Handling
- **Loading states:** "Loading..." message displayed while `isLoading` is true.
- **Error state:** "User not found" message displayed if user doesn't exist.
- **API errors:** Handled in `useUpdateUserStatus` hook's `onError` callback, displayed via toast notification.
- **Form submission:** Submit button is disabled during submission (`updateUser.isPending`).

## Navigation Flow
- **Route:** `/customers/:id/edit`.
- **Entry points:**
  - From customers list page via "Edit" button.
  - Direct URL navigation with user ID.
- **On mount:** User data is fetched and form is pre-populated.
- **On successful update:** `navigate('/customers')` redirects to customers list.

## Functions Involved

- **User data loading effect** — Loads user data and populates form.
  ```javascript
  useEffect(() => {
      if (user) {
          setForm({
              name: user.name || '',
              email: user.email || '',
              isActive: !!user.isActive,
              isVerified: !!user.isVerified,
              roles: (user.roles || []).map(r => r._id || r),
          })
      }
  }, [user])
  ```

- **`handleToggle`** — Toggles boolean form fields (isActive).
  ```javascript
  const handleToggle = (key) => {
      setForm(prev => ({ ...prev, [key]: !prev[key] }))
  }
  ```

- **`toggleRole`** — Adds or removes role from roles array.
  ```javascript
  const toggleRole = (roleId) => {
      setForm(prev => {
          const has = prev.roles.includes(roleId)
          return { 
              ...prev, 
              roles: has 
                  ? prev.roles.filter(r => r !== roleId) 
                  : [...prev.roles, roleId] 
          }
      })
  }
  ```

- **`handleSubmit`** — Validates form and submits via mutation.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      await updateUser.mutateAsync({ 
          userId: id, 
          data: { 
              isActive: form.isActive, 
              roles: form.roles 
          } 
      })
      navigate('/customers')
  }
  ```

## Future Enhancements
- Add form validation with error messages.
- Add role permissions preview.
- Add user activity logs display.
- Add user login history.
- Add user avatar upload functionality.
- Add user email/phone editing (currently read-only).
- Add user password reset functionality.
- Add user verification status toggle.
- Add user account lock/unlock functionality.
- Add user notes/comments field.
- Add user tags/categories.
- Add user export functionality.
