# Add Customer Screen Documentation

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
import { userAPI } from '../../api'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **API calls:** Direct API calls using `userAPI.adminCreateCustomer` (not using TanStack Query hooks).
- **Form state:** `form` object containing customer fields:
  - `name`: Customer name (optional)
  - `email`: Customer email (required)
  - `phone`: Customer phone number (required)
- **Submission state:** `isSubmitting` boolean for loading state during API call.

**API call pattern:**
```javascript
const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.phone) return
    setIsSubmitting(true)
    try {
        await userAPI.adminCreateCustomer({ name: form.name, email: form.email, phone: form.phone })
        navigate('/customers')
    } catch (err) {
        // errors are handled by interceptor/toasts upstream if any
    } finally {
        setIsSubmitting(false)
    }
}
```

## UI Structure
- **Screen shell:** Centered container with padding (`p-4`).
- **Form card:** White card with shadow and border, max-width container.
- **Form section:** Single-column form with name, email, and phone fields.
- **Form actions:** Create Customer and Cancel buttons at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────────┐                 │
│                    │  Add Customer       │                 │
│                    │                     │                 │
│                    │  Name               │                 │
│                    │  [________________]  │                 │
│                    │                     │                 │
│                    │  Email *            │                 │
│                    │  [________________]  │                 │
│                    │                     │                 │
│                    │  Number *            │                 │
│                    │  [________________]  │                 │
│                    │                     │                 │
│                    │  [Create Customer] [Cancel]          │
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
│                    │  Add Customer       │                   │
│                    │                     │                   │
│                    │  Name               │                   │
│                    │  [Customer name]    │                   │
│                    │                     │                   │
│                    │  Email *            │                   │
│                    │  [name@example.com] │                   │
│                    │                     │                   │
│                    │  Number *            │                   │
│                    │  [+2547XXXXXXXX]   │                   │
│                    │                     │                   │
│                    │  [Create Customer] [Cancel]            │
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
          placeholder="Customer name"
      />
  </div>
  ```

- **Email Input**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input"
          placeholder="name@example.com"
          required
      />
  </div>
  ```

- **Phone Input**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
      <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="input"
          placeholder="e.g. +2547XXXXXXXX"
          required
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
      {isSubmitting ? 'Creating...' : 'Create Customer'}
  </button>
  ```

- **Cancel Button**
  ```javascript
  <button 
      type="button" 
      onClick={() => navigate('/customers')} 
      className="btn-outline"
  >
      Cancel
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via `userAPI.adminCreateCustomer`.
- **Endpoint:** `POST /api/users/admin/create` (admin only).
- **Payload:** `{ name: string, email: string, phone: string }`.
- **Response contract:** Standard API response (errors handled by interceptor/toasts).
- **Navigation:** On successful creation, navigates to `/customers` list page.

## Components Used
- React + React Router DOM: `useNavigate`.
- Form elements: `input`, `button`, `form`, `label`, `div`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.input`).

## Error Handling
- **Form validation:** Basic validation checks if email and phone are not empty.
- **API errors:** Errors are handled by API interceptor/toasts upstream (no explicit error handling in component).
- **Loading state:** Submit button shows "Creating..." and is disabled during submission.

## Navigation Flow
- **Route:** `/customers/new`.
- **Entry points:**
  - From customers list page via "Add Customer" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/customers')` redirects to customers list.
- **On cancel:** `navigate('/customers')` returns to customers list.

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
      if (!form.email || !form.phone) return
      setIsSubmitting(true)
      try {
          await userAPI.adminCreateCustomer({ 
              name: form.name, 
              email: form.email, 
              phone: form.phone 
          })
          navigate('/customers')
      } catch (err) {
          // errors are handled by interceptor/toasts upstream if any
      } finally {
          setIsSubmitting(false)
      }
  }
  ```

## Future Enhancements
- Add form validation with error messages.
- Add email format validation.
- Add phone number format validation.
- Add role assignment during customer creation.
- Add customer avatar upload functionality.
- Add customer templates for quick creation.
- Add customer duplication functionality.
- Add customer import functionality.
- Add password generation and email sending.
- Add customer verification email option.
- Add customer welcome email option.
