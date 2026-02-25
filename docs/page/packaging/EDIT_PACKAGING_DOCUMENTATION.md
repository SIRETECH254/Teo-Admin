# Edit Packaging Screen Documentation

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
import { useGetPackagingById, useUpdatePackaging } from '../../hooks/usePackaging'
```

## Context and State Management
- **TanStack Query hooks:** `useGetPackagingById`, `useUpdatePackaging` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Form state:** Individual state variables (same as AddPackaging, pre-populated from API).

**`useGetPackagingById` hook (from `hooks/usePackaging.js`):**
```javascript
export const useGetPackagingById = (packagingId) => {
    return useQuery({
        queryKey: ['packaging', packagingId],
        queryFn: async () => {
            const response = await packagingAPI.getPackagingById(packagingId)
            return response.data
        },
        enabled: !!packagingId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdatePackaging` hook (from `hooks/usePackaging.js`):**
```javascript
export const useUpdatePackaging = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await packagingAPI.updatePackaging(id, data)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            queryClient.invalidateQueries({ queryKey: ['packaging', id] })
            toast.success(data.message || 'Packaging updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update packaging error:', error)
            toast.error(error.response?.data?.message || 'Failed to update packaging')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`container mx-auto py-6`).
- **Header section:** Title in white card.
- **Form section:** Single-column form with name, price, and checkboxes (pre-populated).
- **Form actions:** Cancel and Save buttons at bottom.
- **Loading state:** Skeleton loader displayed while packaging data is loading.

## Planned Layout
(Same as AddPackaging, but with pre-populated values)

## Sketch Wireframe
(Same as AddPackaging)

## Form Inputs
(Same as AddPackaging, but with pre-populated values)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `packagingAPI.getPackagingById` and `packagingAPI.updatePackaging`.
- **Get packaging endpoint:** `GET /api/packaging/:id`.
- **Update packaging endpoint:** `PUT /api/packaging/:id`.
- **Payload:** `{ name: string, price: number, isActive: boolean, isDefault: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: packaging }`.
- **Cache invalidation:** After successful update, both `['packaging']` and `['packaging', id]` queries are invalidated.

## Components Used
(Same as AddPackaging)

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Form validation:** Same as AddPackaging.
- **API errors:** Handled in `useUpdatePackaging` hook's `onError` callback.

## Navigation Flow
- **Route:** `/packaging/:id/edit`.
- **Entry points:**
  - From packaging list page via "Edit" button.
  - Direct URL navigation with packaging ID.
- **On mount:** Packaging data is fetched and form is pre-populated.
- **On successful update:** `navigate('/packaging')` redirects to packaging list.
- **On cancel:** `navigate('/packaging')` returns to packaging list without saving.

## Functions Involved

- **`onSubmit`** — Validates form and submits via mutation.
  ```javascript
  const onSubmit = async (e) => {
      e.preventDefault()
      if (!isValid) return
      await updateMutation.mutateAsync({ id, data: { name, price: Number(price), isActive, isDefault } })
      navigate('/packaging')
  }
  ```

- **Data loading effect** — Loads packaging data and populates form.
  ```javascript
  useEffect(() => {
      if (record) {
          setName(record.name || '')
          setPrice(String(record.price ?? '0'))
          setIsActive(Boolean(record.isActive))
          setIsDefault(Boolean(record.isDefault))
      }
  }, [record])
  ```

## Future Enhancements
(Same as AddPackaging)
