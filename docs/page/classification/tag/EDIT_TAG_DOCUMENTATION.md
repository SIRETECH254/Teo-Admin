# Edit Tag Screen Documentation

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
import { FiEdit, FiLoader } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useGetTagById, useUpdateTag } from '../../../hooks/useTags'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetTagById`, `useUpdateTag` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Form state:** `formData` object (same structure as AddTag, pre-populated from API).

**`useGetTagById` hook (from `hooks/useTags.js`):**
```javascript
export const useGetTagById = (tagId) => {
    return useQuery({
        queryKey: ['tag', tagId],
        queryFn: async () => {
            const response = await tagAPI.getTagById(tagId)
            return response.data
        },
        enabled: !!tagId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdateTag` hook (from `hooks/useTags.js`):**
```javascript
export const useUpdateTag = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ tagId, ...tagData }) => {
            const response = await tagAPI.updateTag(tagId, tagData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            queryClient.invalidateQueries({ queryKey: ['tag'] })
            toast.success(data.message || 'Tag updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update tag error:', error)
            toast.error(error.response?.data?.message || 'Failed to update tag')
        }
    })
}
```

## UI Structure
(Same as AddTag, with loading and error states)

## Planned Layout
(Same as AddTag)

## Sketch Wireframe
(Same as AddTag)

## Form Inputs
(Same as AddTag, but with pre-populated values)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `tagAPI.getTagById` and `tagAPI.updateTag`.
- **Get tag endpoint:** `GET /api/tags/:id`.
- **Update tag endpoint:** `PUT /api/tags/:id`.
- **Payload:** `{ name: string, description: string, isActive: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: tag }`.
- **Cache invalidation:** After successful update, both `['tags']` and `['tag', id]` queries are invalidated.

## Components Used
(Same as AddTag)

## Error Handling
(Same as AddTag, with loading and error states)

## Navigation Flow
- **Route:** `/tags/:id/edit`.
- **Entry points:**
  - From tags list page via "Edit" button.
  - Direct URL navigation with tag ID.
- **On mount:** Tag data is fetched and form is pre-populated.
- **On successful update:** `navigate('/tags')` redirects to tags list.

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
          const tagData = {
              tagId: id,
              ...formData,
              description: formData.description || ''
          }

          await updateTagMutation.mutateAsync(tagData)
          toast.success('Tag updated successfully!')
          navigate('/tags')
      } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update tag'
          toast.error(errorMessage)
          
          if (error.response?.data?.errors) {
              setValidationErrors(error.response.data.errors)
          }
      }
  }
  ```

- **Tag data loading effect** — Loads tag data and populates form.
  ```javascript
  useEffect(() => {
      if (data?.data?.data?.tag) {
          const tag = data.data.data.tag
          setFormData({
              name: tag.name || '',
              description: tag.description || '',
              isActive: tag.isActive !== undefined ? tag.isActive : true
          })
      }
  }, [data])
  ```

(Other functions same as AddTag)

## Future Enhancements
(Same as AddTag)
