# Add Category Screen Documentation

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
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useCreateCategory } from '../../../hooks/useCategories'
import { categorySchema } from '../../../utils/validation'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useCreateCategory` for mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** `formData` object containing category fields:
  - `name`: Category name
  - `description`: Category description (HTML from RichTextEditor)
  - `status`: Status ('active' or 'inactive')
- **Validation state:** `validationErrors` object for field-level error messages.

**`useCreateCategory` hook (from `hooks/useCategories.js`):**
```javascript
export const useCreateCategory = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (categoryData) => {
            const response = await categoryAPI.createCategory(categoryData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.success(data.message || 'Category created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create category error:', error)
            toast.error(error.response?.data?.message || 'Failed to create category')
        }
    })
}
```

## UI Structure
(Same structure as AddBrand, but with status as 'active'/'inactive' string instead of boolean)

## Planned Layout
(Same as AddBrand)

## Sketch Wireframe
(Same as AddBrand)

## Form Inputs
(Same as AddBrand, but status uses ToggleSwitch that toggles between 'active' and 'inactive' string values)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `categoryAPI.createCategory`.
- **Endpoint:** `POST /api/categories`.
- **Payload:** `{ name: string, description: string, status: 'active'|'inactive' }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: category }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['categories'] })` is called.

## Components Used
(Same as AddBrand, plus Yup validation schema)

## Error Handling
- **Form validation:** Yup schema validation with `categorySchema`.
- **Field-level errors:** Validation errors displayed below each input field.
- **Character count:** Description has 500 character limit with counter display.
- **API errors:** Handled in `useCreateCategory` hook's `onError` callback.

## Navigation Flow
- **Route:** `/categories/add`.
- **Entry points:**
  - From categories list page via "Add Category" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/categories')` redirects to categories list.
- **On cancel:** `navigate('/categories')` returns to categories list.

## Functions Involved

- **`handleSubmit`** — Validates form with Yup schema and submits via mutation.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      
      try {
          await categorySchema.validate(formData, { abortEarly: false })
          
          const payload = {
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              status: formData.status
          }
          
          await createCategoryMutation.mutateAsync(payload)
          toast.success('Category created successfully!')
          navigate('/categories')
      } catch (validationError) {
          if (validationError.name === 'ValidationError') {
              const errors = {}
              validationError.inner.forEach((error) => {
                  errors[error.path] = error.message
              })
              setValidationErrors(errors)
          } else {
              toast.error(validationError.response?.data?.message || 'Failed to create category')
          }
      }
  }
  ```

- **`handleDescriptionChange`** — Updates description from RichTextEditor.
- **`getPlainTextLength`** — Gets plain text length for character count display.

## Future Enhancements
- Add category parent/child hierarchy.
- Add category image upload.
- Add category slug auto-generation.
- Add category SEO fields.
- Add category templates.
- Add category duplication.
- Add category import functionality.
