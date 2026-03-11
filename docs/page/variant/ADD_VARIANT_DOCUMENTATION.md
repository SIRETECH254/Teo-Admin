# Add Variant Screen Documentation

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
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useCreateVariant } from '../../hooks/useVariants'
import { variantSchema } from '../../utils/validation'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useCreateVariant` for mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** `formData` object containing variant fields:
  - `name`: Variant name (e.g., "Size", "Color", "Material")
  - `options`: Array of option objects `[{ value: string }]`
- **Option input state:** `optionInput` string for adding new options.
- **Validation state:** `validationErrors` object for field-level error messages.

**`useCreateVariant` hook (from `hooks/useVariants.js`):**
```javascript
export const useCreateVariant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (variantData) => {
            const response = await variantAPI.createVariant(variantData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['variants'] })
            toast.success(data.message || 'Variant created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create variant error:', error)
            toast.error(error.response?.data?.message || 'Failed to create variant')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-height container with gray background (`bg-gray-50`).
- **Header section:** Title and description in white card.
- **Form section:** Single-column form with variant name and options management.
- **Options management:** Input field with add button, list of added options with remove buttons.
- **Form actions:** Cancel and Create buttons at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Add New Variant                                      │ │
│  │  Create a new product variant with options           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Variant Name *                                       │ │
│  │  [_________________________________]                  │ │
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
│  │  [Cancel]                    [Create Variant]          │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Add New Variant                                              │
│  Create a new product variant with options                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Variant Name *                                      │   │
│  │  [Enter variant name (e.g., Size, Color, Material)] │   │
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
│  │  [Cancel]                    [💾 Create Variant]     │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Variant Name Input**
  ```javascript
  <input
      type="text"
      id="name"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
      placeholder="Enter variant name (e.g., Size, Color, Material)"
      disabled={createVariantMutation.isPending}
  />
  ```

- **Option Input with Add Button**
  ```javascript
  <div className="flex gap-2 mb-3">
      <input
          type="text"
          value={optionInput}
          onChange={(e) => setOptionInput(e.target.value)}
          onKeyPress={handleOptionKeyPress}
          placeholder="Enter option value (e.g., Small, Red, Cotton)"
          className="input flex-1"
          disabled={createVariantMutation.isPending}
      />
      <button
          type="button"
          onClick={addOption}
          className="btn-primary px-4 py-2"
          disabled={createVariantMutation.isPending || !optionInput.trim()}
      >
          <FiPlus className="h-4 w-4" />
      </button>
  </div>
  ```

- **Options List**
  ```javascript
  {formData.options.length > 0 && (
      <div className="space-y-2">
          {formData.options.map((option, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-700">{option.value}</span>
                  <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={createVariantMutation.isPending}
                  >
                      <FiTrash2 className="h-4 w-4" />
                  </button>
              </div>
          ))}
      </div>
  )}
  ```

- **Form Actions**
  ```javascript
  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
          type="button"
          onClick={handleCancel}
          className="btn-outline"
          disabled={createVariantMutation.isPending}
      >
          Cancel
      </button>
      <button
          type="submit"
          className="btn-primary inline-flex items-center"
          disabled={createVariantMutation.isPending}
      >
          {createVariantMutation.isPending ? (
              <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
              </>
          ) : (
              <>
                  <FiSave className="mr-2 h-4 w-4" />
                  Create Variant
              </>
          )}
      </button>
  </div>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `variantAPI.createVariant`.
- **Endpoint:** `POST /api/variants`.
- **Payload:** `{ name: string, options: [{ value: string }] }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: variant }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['variants'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useMutation`, `useQueryClient`.
- Form elements: `input`, `button`, `form`, `label`.
- `react-icons/fi` for icons (FiSave, FiPlus, FiTrash2).
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.input`).
- `react-hot-toast` for toast notifications.
- Yup validation schema (`variantSchema`).

## Error Handling
- **Form validation:** Yup schema validation with `abortEarly: false` to collect all errors.
- **Field-level errors:** Validation errors displayed below each input field.
- **API errors:** Handled in `useCreateVariant` hook's `onError` callback, displayed via toast notification.
- **Duplicate option prevention:** Checks if option already exists before adding.
- **Empty option prevention:** Trims whitespace and validates non-empty values.

## Navigation Flow
- **Route:** `/variants/add`.
- **Entry points:**
  - From variants list page via "Add Variant" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/variants')` redirects to variants list.
- **On cancel:** `navigate('/variants')` returns to variants list without saving.

## Functions Involved

- **`handleSubmit`** — Validates form data and submits via mutation.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()

      try {
          await variantSchema.validate(formData, { abortEarly: false })
          const payload = {
              name: formData.name.trim(),
              options: formData.options
          }
          await createVariantMutation.mutateAsync(payload)
          toast.success('Variant created successfully!')
          navigate('/variants')
      } catch (validationError) {
          if (validationError.name === 'ValidationError') {
              const errors = {}
              validationError.inner.forEach((error) => {
                  errors[error.path] = error.message
              })
              setValidationErrors(errors)
          } else {
              console.error('Error creating variant:', validationError)
              toast.error(validationError.response?.data?.message || 'Failed to create variant')
          }
      }
  }
  ```

- **`handleInputChange`** — Updates form data for standard input fields.
  ```javascript
  const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({
          ...prev,
          [name]: value
      }))

      if (validationErrors[name]) {
          setValidationErrors(prev => ({
              ...prev,
              [name]: ''
          }))
      }
  }
  ```

- **`addOption`** — Adds new option to options array.
  ```javascript
  const addOption = () => {
      if (optionInput.trim() && !formData.options.some(opt => opt.value === optionInput.trim())) {
          setFormData(prev => ({
              ...prev,
              options: [...prev.options, { value: optionInput.trim() }]
          }))
          setOptionInput('')
      }
  }
  ```

- **`removeOption`** — Removes option from options array.
  ```javascript
  const removeOption = (index) => {
      setFormData(prev => ({
          ...prev,
          options: prev.options.filter((_, i) => i !== index)
      }))
  }
  ```

- **`handleOptionKeyPress`** — Handles Enter key to add option.
  ```javascript
  const handleOptionKeyPress = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault()
          addOption()
      }
  }
  ```

- **`handleCancel`** — Cancels form and navigates back to variants list.
  ```javascript
  const handleCancel = () => {
      navigate('/variants')
  }
  ```

## Future Enhancements
- Add option reordering (drag and drop).
- Add bulk option import (paste comma-separated values).
- Add option validation (unique values, character limits).
- Add variant templates (predefined common variants).
- Add variant preview (how it will appear in product forms).
- Add option icons/images support.
- Add variant description field.
- Add variant usage statistics preview.
- Add variant duplication from existing variant.
- Add keyboard shortcuts for adding options.
- Add option search/filter within variant.
- Add variant export/import functionality.
