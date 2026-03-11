# Edit Brand Screen Documentation

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
import { useGetBrandById, useUpdateBrand } from '../../../hooks/useBrands'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetBrandById`, `useUpdateBrand` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Form state:** `formData` object (same structure as AddBrand, pre-populated from API).
- **Validation state:** `validationErrors` object for field-level error messages.

**`useGetBrandById` hook (from `hooks/useBrands.js`):**
```javascript
export const useGetBrandById = (brandId) => {
    return useQuery({
        queryKey: ['brand', brandId],
        queryFn: async () => {
            const response = await brandAPI.getBrandById(brandId)
            return response.data
        },
        enabled: !!brandId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdateBrand` hook (from `hooks/useBrands.js`):**
```javascript
export const useUpdateBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ brandId, ...brandData }) => {
            const response = await brandAPI.updateBrand(brandId, brandData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            queryClient.invalidateQueries({ queryKey: ['brand'] })
            toast.success(data.message || 'Brand updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update brand error:', error)
            toast.error(error.response?.data?.message || 'Failed to update brand')
        }
    })
}
```

## UI Structure
(Same as AddBrand, with loading and error states)

## Planned Layout
(Same as AddBrand)

## Sketch Wireframe
(Same as AddBrand)

## Form Inputs
(Same as AddBrand, but with pre-populated values)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `brandAPI.getBrandById` and `brandAPI.updateBrand`.
- **Get brand endpoint:** `GET /api/brands/:id`.
- **Update brand endpoint:** `PUT /api/brands/:id`.
- **Payload:** `{ name: string, description: string, isActive: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: brand }`.
- **Cache invalidation:** After successful update, both `['brands']` and `['brand', id]` queries are invalidated.

## Components Used
(Same as AddBrand)

## Error Handling
- **Loading states:** Spinner displayed while `isLoading` is true.
- **Error state:** Error message displayed if brand doesn't exist.
- **Form validation:** Same as AddBrand.
- **API errors:** Handled in `useUpdateBrand` hook's `onError` callback.

## Navigation Flow
- **Route:** `/brands/:id/edit`.
- **Entry points:**
  - From brands list page via "Edit" button.
  - Direct URL navigation with brand ID.
- **On mount:** Brand data is fetched and form is pre-populated.
- **On successful update:** `navigate('/brands')` redirects to brands list.

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
              brandId: id,
              ...formData,
              description: formData.description || ''
          }

          await updateBrandMutation.mutateAsync(brandData)
          toast.success('Brand updated successfully!')
          navigate('/brands')
      } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update brand'
          toast.error(errorMessage)
          
          if (error.response?.data?.errors) {
              setValidationErrors(error.response.data.errors)
          }
      }
  }
  ```

- **Brand data loading effect** — Loads brand data and populates form.
  ```javascript
  useEffect(() => {
      if (data?.data?.data?.brand) {
          const brand = data.data.data.brand
          setFormData({
              name: brand.name || '',
              description: brand.description || '',
              isActive: brand.isActive !== undefined ? brand.isActive : true
          })
      }
  }, [data])
  ```

(Other functions same as AddBrand)

## Future Enhancements
(Same as AddBrand)
