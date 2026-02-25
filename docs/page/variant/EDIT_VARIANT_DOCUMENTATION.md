# Edit Variant Screen Documentation

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
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiEdit, FiPlus, FiTrash2, FiLoader, FiAlertTriangle, FiX } from 'react-icons/fi'
import { useGetVariantById, useUpdateVariant } from '../../hooks/useVariants'
import { variantAPI } from '../../api'
import { variantSchema } from '../../utils/validation'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetVariantById`, `useUpdateVariant` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Form state:** `formData` object containing variant fields (same structure as AddVariant).
- **Option input state:** `optionInput` string for adding new options.
- **Validation state:** `validationErrors` object for field-level error messages.
- **Delete confirmation state:** `confirmDelete` object with `{ open: boolean, option: object, index: number }` for option deletion confirmation.
- **Initial options ref:** `initialOptionsRef` useRef to track original options for diffing.

**`useGetVariantById` hook (from `hooks/useVariants.js`):**
```javascript
export const useGetVariantById = (variantId) => {
    return useQuery({
        queryKey: ['variant', variantId],
        queryFn: async () => {
            const response = await variantAPI.getVariantById(variantId)
            return response.data
        },
        enabled: !!variantId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdateVariant` hook (from `hooks/useVariants.js`):**
```javascript
export const useUpdateVariant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ variantId, ...variantData }) => {
            const response = await variantAPI.updateVariant(variantId, variantData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['variants'] })
            queryClient.invalidateQueries({ queryKey: ['variant'] })
            toast.success(data.message || 'Variant updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update variant error:', error)
            toast.error(error.response?.data?.message || 'Failed to update variant')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-height container with gray background (`bg-gray-50`).
- **Header section:** Title and description in white card.
- **Form section:** Single-column form with variant name and options management.
- **Options management:** Input field with add button, list of added options with remove buttons.
- **Delete confirmation modal:** Modal for confirming option deletion.
- **Form actions:** Cancel and Update buttons at bottom.
- **Loading state:** Spinner displayed while variant data is loading.
- **Error state:** Error message displayed if variant doesn't exist.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Edit Variant                                         │ │
│  │  Update variant details and options                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Variant Name *                                       │ │
│  │  [Size_________________________________]              │ │
│  │                                                         │ │
│  │  Options *                                             │ │
│  │  [Enter option value...] [Add]                        │ │
│  │                                                         │ │
│  │  Added Options:                                        │ │
│  │  ┌─────────────────────────────────┐                  │ │
│  │  │ Small                    [🗑]   │                  │ │
│  │  │ Medium                   [🗑]   │                  │ │
│  │  │ Large                    [🗑]   │                  │ │
│  │  └─────────────────────────────────┘                  │ │
│  │                                                         │ │
│  │  [Cancel]                    [Update Variant]          │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Edit Variant                                                  │
│  Update variant details and options                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Variant Name *                                      │   │
│  │  [Size_________________________________]            │   │
│  │                                                       │   │
│  │  Options *                                            │   │
│  │  [Enter option value...] [➕]                        │   │
│  │                                                       │   │
│  │  Added Options:                                       │   │
│  │  ┌───────────────────────────────────────┐          │   │
│  │  │ Small                          [🗑]    │          │   │
│  │  │ Medium                         [🗑]    │          │   │
│  │  │ Large                          [🗑]    │          │   │
│  │  └───────────────────────────────────────┘          │   │
│  │                                                       │   │
│  │  [Cancel]                    [✏️ Update Variant]     │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Variant Name Input** (same as AddVariant, pre-populated)
- **Option Input with Add Button** (same as AddVariant)
- **Options List** (same as AddVariant, shows existing options)
- **Delete Confirmation Modal**
  ```javascript
  {confirmDelete.open && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                  <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Delete Option</h3>
              </div>
              <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the option "{confirmDelete.option?.value}"? 
                  This action cannot be undone and will affect any products using this variant.
              </p>
              <div className="flex justify-end space-x-3">
                  <button
                      onClick={cancelDeleteOption}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={confirmDeleteOption}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                      Delete
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `variantAPI.getVariantById`, `variantAPI.updateVariant`, `variantAPI.addOption`, `variantAPI.removeOption`.
- **Get variant endpoint:** `GET /api/variants/:id`.
- **Update variant endpoint:** `PUT /api/variants/:id`.
- **Add option endpoint:** `POST /api/variants/:id/options`.
- **Remove option endpoint:** `DELETE /api/variants/:id/options/:optionId`.
- **Payload:** 
  - Update variant: `{ name: string, options: [{ value: string }] }`
  - Add option: `{ value: string }`
  - Remove option: No body, option ID in URL
- **Response contract:** `response.data` contains `{ success: true, message: string, data: variant }`.
- **Cache invalidation:** After successful update, both `['variants']` and `['variant', id]` queries are invalidated.

## Components Used
- React + React Router DOM: `useNavigate`, `useParams`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: Same as AddVariant.
- `react-icons/fi` for icons (FiEdit, FiPlus, FiTrash2, FiLoader, FiAlertTriangle, FiX).
- Tailwind CSS classes for styling with custom classes (same as AddVariant).
- `react-hot-toast` for toast notifications.
- Yup validation schema (`variantSchema`).

## Error Handling
- **Loading states:** Spinner displayed while `isLoading` is true.
- **Error state:** Error message displayed if variant doesn't exist with "Back to Variants" button.
- **Form validation:** Same as AddVariant (Yup schema).
- **API errors:** Handled in `useUpdateVariant` hook's `onError` callback, displayed via toast notification.
- **Option deletion errors:** Individual error handling for each add/remove operation with specific error messages.
- **Data structure handling:** Handles multiple response shapes from API (nested data structures).

## Navigation Flow
- **Route:** `/variants/:id/edit`.
- **Entry points:**
  - From variants list page via "Edit" button.
  - Direct URL navigation with variant ID.
- **On mount:** Variant data is fetched and form is pre-populated.
- **On successful update:** `navigate('/variants')` redirects to variants list.
- **On cancel:** `navigate('/variants')` returns to variants list without saving.
- **Variant not found:** Displays error message with option to return to variants list.

## Functions Involved

- **`handleSubmit`** — Validates form, updates variant, then diffs options and syncs via separate API calls.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()

      try {
          await variantSchema.validate(formData, { abortEarly: false })

          // 1) Update base variant fields
          const namePayload = {
              name: formData.name.trim(),
              options: (formData.options || [])
                  .filter(o => (o?.value || '').trim().length > 0)
                  .map(o => ({ value: o.value.trim() }))
          }
          await updateVariantMutation.mutateAsync({ variantId: id, ...namePayload })

          // 2) Diff options and sync via dedicated endpoints
          const original = initialOptionsRef.current || []
          const current = formData.options || []

          const originalIds = new Set(original.filter(o => o && o._id).map(o => String(o._id)))
          const currentIds = new Set(current.filter(o => o && o._id).map(o => String(o._id)))

          // New options: no _id present
          const optionsToAdd = current.filter(o => !o._id && (o.value || '').trim().length > 0)
          // Removed options: present in original but not in current
          const optionsToRemove = original.filter(o => o._id && !currentIds.has(String(o._id)))

          // Perform add/remove operations
          for (const opt of optionsToAdd) {
              try {
                  await variantAPI.addOption(id, { value: opt.value.trim() })
              } catch (error) {
                  throw new Error(`Failed to add option "${opt.value}": ${error.response?.data?.message || error.message}`)
              }
          }

          for (const opt of optionsToRemove) {
              try {
                  await variantAPI.removeOption(id, String(opt._id))
              } catch (error) {
                  throw new Error(`Failed to remove option "${opt.value}": ${error.response?.data?.message || error.message}`)
              }
          }

          toast.success('Variant updated successfully!')
          navigate('/variants')
      } catch (validationError) {
          // Handle validation and API errors
      }
  }
  ```

- **`addOption`** — Same as AddVariant.
- **`removeOption`** — Opens confirmation modal instead of immediately removing.
  ```javascript
  const removeOption = (index) => {
      const option = formData.options[index]
      setConfirmDelete({ open: true, option, index })
  }
  ```

- **`confirmDeleteOption`** — Confirms and removes option from form.
  ```javascript
  const confirmDeleteOption = () => {
      if (confirmDelete.index !== null) {
          setFormData(prev => ({
              ...prev,
              options: prev.options.filter((_, i) => i !== confirmDelete.index)
          }))
      }
      setConfirmDelete({ open: false, option: null, index: null })
  }
  ```

- **`cancelDeleteOption`** — Cancels option deletion.
  ```javascript
  const cancelDeleteOption = () => {
      setConfirmDelete({ open: false, option: null, index: null })
  }
  ```

- **Product data loading effect** — Loads variant data and populates form.
  ```javascript
  useEffect(() => {
      if (!data) return

      const payload = data?.data
      const variant = payload?.data || payload?.variant || data?.variant || data

      if (variant && (variant.name || Array.isArray(variant.options))) {
          setFormData({
              name: variant.name || '',
              options: Array.isArray(variant.options) ? variant.options : []
          })

          initialOptionsRef.current = Array.isArray(variant.options) ? variant.options : []
      }
  }, [data])
  ```

(Other functions same as AddVariant: `handleInputChange`, `handleOptionKeyPress`, `handleCancel`)

## Future Enhancements
- Add option reordering (drag and drop).
- Add option editing (inline edit instead of delete/add).
- Add option value validation (unique values, character limits).
- Add variant usage preview (show which products use this variant).
- Add option usage statistics.
- Add variant history/version tracking.
- Add rollback to previous version functionality.
- Add variant duplication/clone functionality.
- Add bulk option operations.
- Add option import/export functionality.
- Add option search/filter within variant.
- Add keyboard shortcuts for option management.
