# Add Collection Screen Documentation

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
import { useCreateCollection } from '../../../hooks/useCollections'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useCreateCollection` for mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** `formData` object containing collection fields:
  - `name`: Collection name
  - `description`: Collection description (HTML from RichTextEditor)
  - `isActive`: Active status (boolean)
- **Validation state:** `validationErrors` object for field-level error messages.

**`useCreateCollection` hook (from `hooks/useCollections.js`):**
```javascript
export const useCreateCollection = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (collectionData) => {
            const response = await collectionAPI.createCollection(collectionData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] })
            toast.success(data.message || 'Collection created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create collection error:', error)
            toast.error(error.response?.data?.message || 'Failed to create collection')
        }
    })
}
```

## UI Structure
(Same structure as AddBrand)

## Planned Layout
(Same as AddBrand)

## Sketch Wireframe
(Same as AddBrand)

## Form Inputs
(Same as AddBrand)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `collectionAPI.createCollection`.
- **Endpoint:** `POST /api/collections`.
- **Payload:** `{ name: string, description: string, isActive: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: collection }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['collections'] })` is called.

## Components Used
(Same as AddBrand)

## Error Handling
- **Form validation:** Custom validation function checks for required name field.
- **Field-level errors:** Validation errors displayed below each input field.
- **API errors:** Handled in `useCreateCollection` hook's `onError` callback.
- **Server validation errors:** Handles validation errors from server response.

## Navigation Flow
- **Route:** `/collections/add`.
- **Entry points:**
  - From collections list page via "Add Collection" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/collections')` redirects to collections list.

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
          const collectionData = {
              ...formData,
              description: formData.description || ''
          }

          await createCollectionMutation.mutateAsync(collectionData)
          toast.success('Collection created successfully!')
          navigate('/collections')
      } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create collection'
          toast.error(errorMessage)
          
          if (error.response?.data?.errors) {
              setValidationErrors(error.response.data.errors)
          }
      }
  }
  ```

- **`validateForm`** — Validates form data.
  ```javascript
  const validateForm = () => {
      const errors = {}
      if (!formData.name.trim()) {
          errors.name = 'Collection name is required'
      }
      setValidationErrors(errors)
      return Object.keys(errors).length === 0
  }
  ```

(Other functions same as AddBrand)

## Future Enhancements
- Add collection image/banner upload.
- Add collection featured products selection.
- Add collection display order.
- Add collection templates.
- Add collection duplication.
- Add collection import functionality.
