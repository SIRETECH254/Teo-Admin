# Add Tag Screen Documentation

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
import { useCreateTag } from '../../../hooks/useTags'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useCreateTag` for mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** `formData` object containing tag fields:
  - `name`: Tag name
  - `description`: Tag description (HTML from RichTextEditor)
  - `isActive`: Active status (boolean)
- **Validation state:** `validationErrors` object for field-level error messages.

**`useCreateTag` hook (from `hooks/useTags.js`):**
```javascript
export const useCreateTag = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (tagData) => {
            const response = await tagAPI.createTag(tagData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            toast.success(data.message || 'Tag created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create tag error:', error)
            toast.error(error.response?.data?.message || 'Failed to create tag')
        }
    })
}
```

## UI Structure
(Same structure as AddBrand/AddCollection)

## Planned Layout
(Same as AddBrand)

## Sketch Wireframe
(Same as AddBrand)

## Form Inputs
(Same as AddBrand)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `tagAPI.createTag`.
- **Endpoint:** `POST /api/tags`.
- **Payload:** `{ name: string, description: string, isActive: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: tag }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['tags'] })` is called.

## Components Used
(Same as AddBrand)

## Error Handling
(Same as AddBrand)

## Navigation Flow
- **Route:** `/tags/add`.
- **Entry points:**
  - From tags list page via "Add Tag" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/tags')` redirects to tags list.

## Functions Involved

- **`handleSubmit`** — Validates form and submits via mutation (same structure as AddBrand/AddCollection).
- **`validateForm`** — Validates form data (same structure as AddCollection).

(Other functions same as AddBrand)

## Future Enhancements
- Add tag color picker.
- Add tag icon selection.
- Add tag slug auto-generation.
- Add tag templates.
- Add tag duplication.
- Add tag import functionality.
- Add tag autocomplete for name field.
