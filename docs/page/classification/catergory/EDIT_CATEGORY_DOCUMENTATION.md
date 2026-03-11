# Edit Category Screen Documentation

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
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useGetCategoryById, useUpdateCategory } from '../../../hooks/useCategories'
import { categorySchema } from '../../../utils/validation'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetCategoryById`, `useUpdateCategory` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Form state:** `formData` object (same structure as AddCategory, pre-populated from API).

**`useGetCategoryById` hook (from `hooks/useCategories.js`):**
```javascript
export const useGetCategoryById = (categoryId) => {
    return useQuery({
        queryKey: ['category', categoryId],
        queryFn: async () => {
            const response = await categoryAPI.getCategoryById(categoryId)
            return response.data
        },
        enabled: !!categoryId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdateCategory` hook (from `hooks/useCategories.js`):**
```javascript
export const useUpdateCategory = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ categoryId, categoryData }) => {
            const response = await categoryAPI.updateCategory(categoryId, categoryData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            queryClient.invalidateQueries({ queryKey: ['category'] })
            toast.success(data.message || 'Category updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update category error:', error)
            toast.error(error.response?.data?.message || 'Failed to update category')
        }
    })
}
```

## UI Structure
(Same as AddCategory, with loading and error states)

## Planned Layout
(Same as AddCategory)

## Sketch Wireframe
(Same as AddCategory)

## Form Inputs
(Same as AddCategory, but with pre-populated values)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `categoryAPI.getCategoryById` and `categoryAPI.updateCategory`.
- **Get category endpoint:** `GET /api/categories/:id`.
- **Update category endpoint:** `PUT /api/categories/:id`.
- **Payload:** `{ name: string, description: string, status: 'active'|'inactive' }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: category }`.
- **Cache invalidation:** After successful update, both `['categories']` and `['category', id]` queries are invalidated.

## Components Used
(Same as AddCategory)

## Error Handling
- **Loading states:** Spinner displayed while `isLoading` is true.
- **Error state:** Error message displayed if category doesn't exist.
- **Form validation:** Same as AddCategory (Yup schema).
- **API errors:** Handled in `useUpdateCategory` hook's `onError` callback.

## Navigation Flow
- **Route:** `/categories/:id/edit`.
- **Entry points:**
  - From categories list page via "Edit" button.
  - Direct URL navigation with category ID.
- **On mount:** Category data is fetched and form is pre-populated.
- **On successful update:** `navigate('/categories')` redirects to categories list.
- **On cancel:** Back button navigates to `/categories`.

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
          await updateCategory.mutateAsync({ categoryId: id, categoryData: payload })
          toast.success('Category updated successfully!')
          navigate('/categories')
      } catch (validationError) {
          if (validationError.name === 'ValidationError') {
              const errors = {}
              validationError.inner.forEach((error) => { errors[error.path] = error.message })
              setValidationErrors(errors)
          } else {
              toast.error(validationError.response?.data?.message || 'Failed to update category')
          }
      }
  }
  ```

- **Category data loading effect** — Loads category data and populates form.
  ```javascript
  useEffect(() => {
      if (category) {
          setFormData({
              name: category.name || '',
              description: category.description || '',
              status: category.status || (category.isActive ? 'active' : 'inactive')
          })
      }
  }, [category])
  ```

(Other functions same as AddCategory)

## Future Enhancements
(Same as AddCategory)
