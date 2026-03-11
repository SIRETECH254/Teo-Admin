# Add Role Screen Documentation

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
import { useNavigate } from 'react-router-dom'
import api from '../../api'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **API calls:** Direct API calls using `api` instance (not using TanStack Query hooks).
- **Form state:** `form` object containing role fields:
  - `name`: Role name (required)
  - `description`: Role description (optional)
- **Submission state:** `isSubmitting` boolean for loading state during API call.

**API call pattern:**
```javascript
const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setIsSubmitting(true)
    try {
        await api.post('/roles', { name: form.name, description: form.description })
        navigate('/roles')
    } finally {
        setIsSubmitting(false)
    }
}
```

## UI Structure
- **Screen shell:** Full-height centered container with gray background (`bg-gray-50`).
- **Form card:** White card with shadow and border, centered on screen.
- **Form section:** Single-column form with name and description fields.
- **Form actions:** Create Role and Cancel buttons at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────────┐                 │
│                    │  Add Role           │                 │
│                    │                     │                 │
│                    │  Name *             │                 │
│                    │  [________________]  │                 │
│                    │                     │                 │
│                    │  Description        │                 │
│                    │  [________________]  │                 │
│                    │  [________________]  │                 │
│                    │                     │                 │
│                    │  [Create Role] [Cancel]              │
│                    └─────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    ┌─────────────────────┐                   │
│                    │                     │                   │
│                    │  Add Role           │                   │
│                    │                     │                   │
│                    │  Name *             │                   │
│                    │  [e.g. manager]      │                   │
│                    │                     │                   │
│                    │  Description         │                   │
│                    │  [What can this     │                   │
│                    │   role do?]         │                   │
│                    │                     │                   │
│                    │  [Create Role] [Cancel]                │
│                    │                     │                   │
│                    └─────────────────────┘                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Name Input**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input 
          type="text" 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className="input" 
          placeholder="e.g. manager" 
          required 
      />
  </div>
  ```

- **Description Textarea**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" 
          rows={3} 
          placeholder="What can this role do?" 
      />
  </div>
  ```

- **Submit Button**
  ```javascript
  <button 
      type="submit" 
      className="btn-primary flex-1" 
      disabled={isSubmitting}
  >
      {isSubmitting ? 'Saving...' : 'Create Role'}
  </button>
  ```

- **Cancel Button**
  ```javascript
  <button 
      type="button" 
      onClick={() => navigate('/roles')} 
      className="btn-outline"
  >
      Cancel
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via direct `api.post` call.
- **Endpoint:** `POST /api/roles`.
- **Payload:** `{ name: string, description: string }`.
- **Response contract:** Standard API response (no specific response structure documented).
- **Navigation:** On successful creation, navigates to `/roles` list page.

## Components Used
- React + React Router DOM: `useNavigate`.
- Form elements: `input`, `textarea`, `button`, `form`, `label`, `div`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.input`).

## Error Handling
- **Form validation:** Basic validation checks if name is not empty (trimmed).
- **API errors:** Errors are silently caught (no error display or toast notification).
- **Loading state:** Submit button shows "Saving..." and is disabled during submission.

## Navigation Flow
- **Route:** `/roles/add`.
- **Entry points:**
  - From roles list page via "Add Role" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/roles')` redirects to roles list.
- **On cancel:** `navigate('/roles')` returns to roles list.

## Functions Involved

- **`handleChange`** — Updates form data when user types.
  ```javascript
  const handleChange = (e) => {
      const { name, value } = e.target
      setForm((p) => ({ ...p, [name]: value }))
  }
  ```

- **`handleSubmit`** — Validates form and submits via API.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      if (!form.name.trim()) return
      setIsSubmitting(true)
      try {
          await api.post('/roles', { name: form.name, description: form.description })
          navigate('/roles')
      } finally {
          setIsSubmitting(false)
      }
  }
  ```

## Future Enhancements
- Add form validation with error messages.
- Add toast notifications for success/error states.
- Add role permissions selection during creation.
- Add role templates for quick creation.
- Add role duplication from existing role.
- Add character limits for name and description fields.
- Add role slug auto-generation.
- Add role preview functionality.
- Add role validation (e.g., unique name check).
- Add role import functionality.
