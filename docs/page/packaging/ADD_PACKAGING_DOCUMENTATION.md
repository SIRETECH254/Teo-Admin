# Add Packaging Screen Documentation

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
import { useCreatePackaging } from '../../hooks/usePackaging'
```

## Context and State Management
- **TanStack Query hooks:** `useCreatePackaging` for mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Individual state variables:
  - `name`: Packaging name (e.g., "Standard", "Gift", "Premium")
  - `price`: Packaging price (number, default '0')
  - `isActive`: Active status (boolean, default true)
  - `isDefault`: Default status (boolean, default false, disabled if not active)

**`useCreatePackaging` hook (from `hooks/usePackaging.js`):**
```javascript
export const useCreatePackaging = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (packagingData) => {
            const response = await packagingAPI.createPackaging(packagingData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success(data.message || 'Packaging created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create packaging error:', error)
            toast.error(error.response?.data?.message || 'Failed to create packaging')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`container mx-auto py-6`).
- **Header section:** Title in white card.
- **Form section:** Single-column form with name, price, and checkboxes.
- **Form actions:** Cancel and Save buttons at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Add Packaging                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Name                                                 │ │
│  │  [_________________________________]                  │ │
│  │                                                         │ │
│  │  Price                                                 │ │
│  │  [0.00________________________________]               │ │
│  │                                                         │ │
│  │  ☑ Active                                             │ │
│  │  ☐ Make standard (disabled if not active)             │ │
│  │                                                         │ │
│  │  [Cancel]                    [Save]                    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Add Packaging                                                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Name                                                │   │
│  │  [e.g. Standard, Gift, Premium]                     │   │
│  │                                                       │   │
│  │  Price                                               │   │
│  │  [0.00]                                              │   │
│  │                                                       │   │
│  │  ☑ Active                                            │   │
│  │  ☐ Make standard                                     │   │
│  │                                                       │   │
│  │  [Cancel]                    [Save]                   │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Name Input**
  ```javascript
  <input 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
      className="input" 
      placeholder="e.g. Standard, Gift, Premium" 
  />
  ```

- **Price Input**
  ```javascript
  <input 
      type="number" 
      min="0" 
      step="0.01" 
      value={price} 
      onChange={(e) => setPrice(e.target.value)} 
      className="input" 
  />
  ```

- **Active Checkbox**
  ```javascript
  <label className="inline-flex items-center gap-2">
      <input 
          type="checkbox" 
          checked={isActive} 
          onChange={(e) => setIsActive(e.target.checked)} 
      />
      <span>Active</span>
  </label>
  ```

- **Default Checkbox** (disabled if not active)
  ```javascript
  <label className="inline-flex items-center gap-2">
      <input 
          type="checkbox" 
          checked={isDefault} 
          onChange={(e) => setIsDefault(e.target.checked)} 
          disabled={!isActive} 
      />
      <span>Make standard</span>
  </label>
  ```

- **Form Actions**
  ```javascript
  <div className="flex gap-3">
      <button 
          type="submit" 
          disabled={!isValid || createMutation.isPending} 
          className="btn-primary"
      >
          {createMutation.isPending ? 'Saving...' : 'Save'}
      </button>
      <button 
          type="button" 
          onClick={() => navigate('/packaging')} 
          className="btn-outline"
      >
          Cancel
      </button>
  </div>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `packagingAPI.createPackaging`.
- **Endpoint:** `POST /api/packaging`.
- **Payload:** `{ name: string, price: number, isActive: boolean, isDefault: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: packaging }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['packaging'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useMutation`, `useQueryClient`.
- Form elements: `input`, `button`, `form`, `label`.
- Tailwind CSS classes for styling with custom classes (`.btn-primary`, `.btn-outline`, `.input`).

## Error Handling
- **Form validation:** Simple validation checks (`isValid` computed from name and price).
- **API errors:** Handled in `useCreatePackaging` hook's `onError` callback.
- **Disabled state:** Default checkbox is disabled when packaging is not active.

## Navigation Flow
- **Route:** `/packaging/add`.
- **Entry points:**
  - From packaging list page via "Add Packaging" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/packaging')` redirects to packaging list.
- **On cancel:** `navigate('/packaging')` returns to packaging list without saving.

## Functions Involved

- **`onSubmit`** — Validates form and submits via mutation.
  ```javascript
  const onSubmit = async (e) => {
      e.preventDefault()
      if (!isValid) return
      await createMutation.mutateAsync({ name, price: Number(price), isActive, isDefault })
      navigate('/packaging')
  }
  ```

- **`isValid`** — Computed validation state.
  ```javascript
  const isValid = name.trim().length > 0 && Number(price) >= 0
  ```

## Future Enhancements
- Add packaging description field.
- Add packaging image/icon upload.
- Add packaging weight/dimensions fields.
- Add packaging color/style options.
- Add packaging templates for quick creation.
- Add form validation with error messages.
- Add packaging preview functionality.
- Add packaging usage statistics preview.
- Add packaging duplication functionality.
- Add bulk packaging creation.
