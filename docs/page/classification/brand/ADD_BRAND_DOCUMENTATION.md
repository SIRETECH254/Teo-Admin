# Add Brand Screen Documentation

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
import { FiPlus, FiLoader } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useCreateBrand } from '../../../hooks/useBrands'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useCreateBrand` for mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** `formData` object containing brand fields:
  - `name`: Brand name
  - `description`: Brand description (HTML from RichTextEditor)
  - `isActive`: Active status (boolean)
- **Validation state:** `validationErrors` object for field-level error messages.

**`useCreateBrand` hook (from `hooks/useBrands.js`):**
```javascript
export const useCreateBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (brandData) => {
            const response = await brandAPI.createBrand(brandData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            toast.success(data.message || 'Brand created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create brand error:', error)
            toast.error(error.response?.data?.message || 'Failed to create brand')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-height container with gray background (`bg-gray-50`).
- **Header section:** Title and description in white card.
- **Form section:** Single-column form with name, description (RichTextEditor), and status toggle.
- **Form actions:** Add Brand button at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Add New Brand                                        │ │
│  │  Create a new product brand                          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Brand Name *                                         │ │
│  │  [_________________________________]                  │ │
│  │                                                         │ │
│  │  Description                                           │ │
│  │  [Rich Text Editor]                                    │ │
│  │                                                         │ │
│  │  Status                                                │ │
│  │  [Toggle: Active/Inactive]                            │ │
│  │                                                         │ │
│  │  [Add Brand]                                           │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Add New Brand                                                 │
│  Create a new product brand                                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Brand Name *                                        │   │
│  │  [Enter brand name]                                  │   │
│  │                                                       │   │
│  │  Description                                         │   │
│  │  [Rich Text Editor with formatting toolbar]          │   │
│  │                                                       │   │
│  │  Status                                              │   │
│  │  [Toggle Switch: Active/Inactive]                   │   │
│  │  Active brands will be available for use in products │   │
│  │                                                       │   │
│  │  [➕ Add Brand]                                      │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Brand Name Input**
  ```javascript
  <input
      type="text"
      id="name"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
      placeholder="Enter brand name"
  />
  ```

- **Description RichTextEditor**
  ```javascript
  <RichTextEditor
      content={formData.description}
      onChange={handleDescriptionChange}
      placeholder="Enter brand description..."
      className={validationErrors.description ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : ''}
  />
  ```

- **Status ToggleSwitch**
  ```javascript
  <ToggleSwitch
      isActive={formData.isActive}
      onToggle={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
      disabled={createBrandMutation.isPending}
      description="Active brands will be available for use in products"
  />
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `brandAPI.createBrand`.
- **Endpoint:** `POST /api/brands`.
- **Payload:** `{ name: string, description: string, isActive: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: brand }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['brands'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useMutation`, `useQueryClient`.
- Form elements: `input`, `button`, `form`, `label`.
- `react-icons/fi` for icons (FiPlus, FiLoader).
- Custom components: `RichTextEditor`, `ToggleSwitch`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.input`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Form validation:** Custom validation function checks for required name field.
- **Field-level errors:** Validation errors displayed below each input field.
- **API errors:** Handled in `useCreateBrand` hook's `onError` callback, displayed via toast notification.
- **Server validation errors:** Handles validation errors from server response.

## Navigation Flow
- **Route:** `/brands/add`.
- **Entry points:**
  - From brands list page via "Add Brand" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/brands')` redirects to brands list.
- **On cancel:** No explicit cancel button, but can navigate back via browser.

## Functions Involved

- **`handleSubmit`** — Validates form and submits via mutation.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()

      if (!validateForm()) {
          toast.error('Please fix the validation errors')
          return
      }

      try {
          const brandData = {
              ...formData,
              description: formData.description || ''
          }

          await createBrandMutation.mutateAsync(brandData)
          toast.success('Brand created successfully!')
          navigate('/brands')
      } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create brand'
          toast.error(errorMessage)
          
          if (error.response?.data?.errors) {
              setValidationErrors(error.response.data.errors)
          }
      }
  }
  ```

- **`handleInputChange`** — Updates form data and clears errors.
- **`handleDescriptionChange`** — Updates description from RichTextEditor.
- **`validateForm`** — Validates form data.

## Future Enhancements
- Add brand logo upload functionality.
- Add brand slug auto-generation.
- Add brand SEO fields (meta title, meta description).
- Add brand website/social media links.
- Add brand country/origin field.
- Add brand preview functionality.
- Add brand templates for quick creation.
- Add brand duplication functionality.
- Add brand import functionality.
