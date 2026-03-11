# Edit Role Screen Documentation

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
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **API calls:** Direct API calls using `api` instance (not using TanStack Query hooks).
- **Form state:** `form` object containing role fields:
  - `name`: Role name
  - `description`: Role description
  - `isActive`: Active status (boolean)
- **Loading states:** `loading` for initial data fetch, `saving` for form submission.

**Data loading pattern:**
```javascript
useEffect(() => {
    const load = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/roles/${id}`)
            const role = res.data?.data?.role
            setForm({ 
                name: role?.name || '', 
                description: role?.description || '', 
                isActive: !!role?.isActive 
            })
        } finally {
            setLoading(false)
        }
    }
    load()
}, [id])
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Form card:** White card with shadow and border, max-width container.
- **Form section:** Single-column form with name, description, and active status checkbox.
- **Form actions:** Save button at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Edit Role                                            │ │
│  │                                                       │ │
│  │  Name                                                │ │
│  │  [_________________________________]                 │ │
│  │                                                       │ │
│  │  Description                                         │ │
│  │  [_________________________________]                 │ │
│  │  [_________________________________]                 │ │
│  │                                                       │ │
│  │  ☑ Active                                            │ │
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
│  │  Edit Role                                         │   │
│  │                                                     │   │
│  │  Name                                              │   │
│  │  [Admin]                                           │   │
│  │                                                     │   │
│  │  Description                                       │   │
│  │  [Full access to all features]                    │   │
│  │                                                     │   │
│  │  ☑ Active                                          │   │
│  │                                                     │   │
│  │  [Save]                                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Name Input**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700">Name</label>
      <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className="input mt-1" 
      />
  </div>
  ```

- **Description Textarea**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700">Description</label>
      <textarea 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" 
          rows={3} 
      />
  </div>
  ```

- **Active Status Checkbox**
  ```javascript
  <label className="inline-flex items-center gap-2">
      <input 
          type="checkbox" 
          name="isActive" 
          checked={form.isActive} 
          onChange={handleChange} 
      />
      <span>Active</span>
  </label>
  ```

- **Submit Button**
  ```javascript
  <button 
      type="submit" 
      className="btn-primary" 
      disabled={saving}
  >
      {saving ? 'Saving...' : 'Save'}
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via direct `api.get` and `api.put` calls.
- **Get role endpoint:** `GET /api/roles/:id`.
- **Update role endpoint:** `PUT /api/roles/:id`.
- **Payload:** `{ name: string, description: string, isActive: boolean }`.
- **Response contract:** `response.data.data.role` contains the role object.
- **Navigation:** On successful update, navigates to `/roles` list page.

## Components Used
- React + React Router DOM: `useNavigate`, `useParams`.
- Form elements: `input`, `textarea`, `button`, `form`, `label`, `div`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.input`).

## Error Handling
- **Loading states:** "Loading..." message displayed while `loading` is true.
- **API errors:** Errors are silently caught (no error display or toast notification).
- **Form submission:** Submit button shows "Saving..." and is disabled during submission.

## Navigation Flow
- **Route:** `/roles/:id/edit`.
- **Entry points:**
  - From roles list page via "Edit" button.
  - Direct URL navigation with role ID.
- **On mount:** Role data is fetched and form is pre-populated.
- **On successful update:** `navigate('/roles')` redirects to roles list.

## Functions Involved

- **`load`** — Fetches role data and populates form.
  ```javascript
  useEffect(() => {
      const load = async () => {
          setLoading(true)
          try {
              const res = await api.get(`/roles/${id}`)
              const role = res.data?.data?.role
              setForm({ 
                  name: role?.name || '', 
                  description: role?.description || '', 
                  isActive: !!role?.isActive 
              })
          } finally {
              setLoading(false)
          }
      }
      load()
  }, [id])
  ```

- **`handleChange`** — Updates form data when user types or toggles checkbox.
  ```javascript
  const handleChange = (e) => {
      const { name, value, type, checked } = e.target
      setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }
  ```

- **`handleSubmit`** — Validates form and submits via API.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      setSaving(true)
      try {
          await api.put(`/roles/${id}`, { 
              name: form.name, 
              description: form.description, 
              isActive: form.isActive 
          })
          navigate('/roles')
      } finally {
          setSaving(false)
      }
  }
  ```

## Future Enhancements
- Add form validation with error messages.
- Add toast notifications for success/error states.
- Add role permissions management.
- Add role usage statistics display.
- Add role change history/audit log.
- Add role preview functionality.
- Add role validation (e.g., unique name check).
- Add cancel button to return to list without saving.
- Add unsaved changes warning when navigating away.
- Add role duplication functionality.
