# Add Coupon Screen Documentation

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
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import { useCreateCoupon } from '../../hooks/useCoupons'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useCreateCoupon` for mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** `formData` object containing all coupon fields:
  - `name`: Coupon name
  - `description`: Optional description
  - `discountType`: 'percentage' or 'fixed'
  - `discountValue`: Discount amount
  - `minimumOrderAmount`: Minimum order amount (optional)
  - `maximumDiscountAmount`: Maximum discount amount (optional)
  - `hasExpiry`: Boolean for expiry toggle
  - `expiryDate`: Expiry date/time (if hasExpiry is true)
  - `hasUsageLimit`: Boolean for usage limit toggle
  - `usageLimit`: Usage limit number (if hasUsageLimit is true)
  - `isFirstTimeOnly`: Boolean for first-time customers only
  - `applicableProducts`: Array of product IDs
  - `applicableCategories`: Array of category IDs
  - `excludedProducts`: Array of product IDs
  - `excludedCategories`: Array of category IDs
- **Validation state:** `errors` object for field-level error messages.

**`useCreateCoupon` hook (from `hooks/useCoupons.js`):**
```javascript
export const useCreateCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (couponData) => {
            const response = await couponAPI.createCoupon(couponData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            toast.success(data.message || 'Coupon created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create coupon error:', error)
            toast.error(error.response?.data?.message || 'Failed to create coupon')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-6`).
- **Header section:** Back button, title, and description.
- **Form section:** Multi-column grid layout with sections:
  - Basic Information (name, description)
  - Discount Configuration (type, value, min/max amounts)
  - Usage Limits (has limit, limit value, first-time only)
  - Expiry Settings (has expiry, expiry date)
- **Form actions:** Cancel and Create buttons at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  [← Back]  Create New Coupon                               │
│            Add a new discount coupon to your store          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Basic Information                                     │ │
│  │  Coupon Name *  [_________________]                   │ │
│  │  Description    [_________________]                   │ │
│  │                                                         │ │
│  │  Discount Configuration                                 │ │
│  │  Discount Type *  [Percentage ▼]                        │ │
│  │  Discount Value * [20_____]                            │ │
│  │  Min Order      [0.00____]                            │ │
│  │  Max Discount   [50.00____]                            │ │
│  │                                                         │ │
│  │  Usage Limits                                           │ │
│  │  ☐ Set usage limit                                     │ │
│  │  Usage Limit *  [100____] (if checked)                │ │
│  │  ☐ First-time customers only                          │ │
│  │                                                         │ │
│  │  Expiry Settings                                        │ │
│  │  ☐ Set expiry date                                     │ │
│  │  Expiry Date *  [2024-12-31T23:59] (if checked)       │ │
│  │                                                         │ │
│  │  [Cancel]                    [Create Coupon]          │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  [← Back to Coupons]                                          │
│                                                               │
│  Create New Coupon                                            │
│  Add a new discount coupon to your store                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Basic Information                                   │   │
│  │  Coupon Name *                                       │   │
│  │  [e.g., Summer Sale 20% Off]                        │   │
│  │                                                       │   │
│  │  Description                                         │   │
│  │  [Optional description for this coupon]              │   │
│  │                                                       │   │
│  │  Discount Configuration                              │   │
│  │  Discount Type * [Percentage (%) ▼]                  │   │
│  │  Discount Value * [20]                               │   │
│  │  Minimum Order Amount [0.00]                         │   │
│  │  Maximum Discount Amount [50.00]                     │   │
│  │                                                       │   │
│  │  Usage Limits                                        │   │
│  │  ☐ Set usage limit                                   │   │
│  │  Usage Limit * [100] (if checked)                    │   │
│  │  ☐ First-time customers only                         │   │
│  │                                                       │   │
│  │  Expiry Settings                                      │   │
│  │  ☐ Set expiry date                                   │   │
│  │  Expiry Date * [2024-12-31T23:59] (if checked)       │   │
│  │                                                       │   │
│  │  [Cancel]                    [💾 Create Coupon]      │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Coupon Name Input**
  ```javascript
  <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      placeholder="e.g., Summer Sale 20% Off"
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          errors.name ? 'border-red-500' : 'border-gray-300'
      }`}
  />
  ```

- **Description Textarea**
  ```javascript
  <textarea
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      placeholder="Optional description for this coupon"
      rows="3"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  />
  ```

- **Discount Type Select**
  ```javascript
  <select
      name="discountType"
      value={formData.discountType}
      onChange={handleInputChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  >
      <option value="percentage">Percentage (%)</option>
      <option value="fixed">Fixed Amount ($)</option>
  </select>
  ```

- **Discount Value Input** (with conditional max attribute)
  ```javascript
  <input
      type="number"
      name="discountValue"
      value={formData.discountValue}
      onChange={handleInputChange}
      placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
      step={formData.discountType === 'percentage' ? '1' : '0.01'}
      min="0"
      max={formData.discountType === 'percentage' ? '100' : undefined}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          errors.discountValue ? 'border-red-500' : 'border-gray-300'
      }`}
  />
  ```

- **Has Usage Limit Checkbox**
  ```javascript
  <input
      type="checkbox"
      name="hasUsageLimit"
      checked={formData.hasUsageLimit}
      onChange={handleInputChange}
      className="rounded border-gray-300 text-primary focus:ring-primary"
  />
  ```

- **Expiry Date Input** (conditional, datetime-local type)
  ```javascript
  {formData.hasExpiry && (
      <input
          type="datetime-local"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.expiryDate ? 'border-red-500' : 'border-gray-300'
          }`}
      />
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `couponAPI.createCoupon`.
- **Endpoint:** `POST /api/coupons`.
- **Payload:** Coupon object with all form fields (some fields conditionally included based on toggles).
- **Response contract:** `response.data` contains `{ success: true, message: string, data: coupon }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['coupons'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useMutation`, `useQueryClient`.
- Form elements: `input`, `textarea`, `select`, `option`, `button`, `form`, `label`, `div`.
- `react-icons/fi` for icons (FiArrowLeft, FiSave, FiX).
- Tailwind CSS classes for styling with custom classes (`.btn-primary`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Form validation:** Custom validation function with comprehensive checks:
  - Name required
  - Discount value must be > 0
  - Percentage discount cannot exceed 100%
  - Expiry date required if hasExpiry is true
  - Expiry date must be in the future
  - Usage limit required if hasUsageLimit is true
  - Min/max amounts cannot be negative
- **Field-level errors:** Validation errors displayed below each input field.
- **API errors:** Handled in `useCreateCoupon` hook's `onError` callback, displayed via toast notification.

## Navigation Flow
- **Route:** `/coupons/add`.
- **Entry points:**
  - From coupons list page via "Add Coupon" button.
  - Direct URL navigation.
- **On successful creation:** `navigate('/coupons')` redirects to coupons list.
- **On cancel:** `navigate('/coupons')` returns to coupons list without saving.

## Functions Involved

- **`handleSubmit`** — Validates form and submits via mutation.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()

      if (!validateForm()) {
          return
      }

      try {
          const couponData = {
              ...formData,
              discountValue: parseFloat(formData.discountValue),
              minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
              maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : undefined,
              usageLimit: formData.hasUsageLimit ? parseInt(formData.usageLimit) : undefined,
              expiryDate: formData.hasExpiry ? formData.expiryDate : undefined
          }

          await createCouponMutation.mutateAsync(couponData)
          toast.success('Coupon created successfully')
          navigate('/coupons')
      } catch {
          toast.error('Failed to create coupon')
      }
  }
  ```

- **`handleInputChange`** — Updates form data and clears errors.
  ```javascript
  const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target
      setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
      }))

      if (errors[name]) {
          setErrors(prev => ({
              ...prev,
              [name]: ''
          }))
      }
  }
  ```

- **`validateForm`** — Comprehensive form validation.
  ```javascript
  const validateForm = () => {
      const newErrors = {}

      if (!formData.name.trim()) {
          newErrors.name = 'Coupon name is required'
      }

      if (!formData.discountValue || formData.discountValue <= 0) {
          newErrors.discountValue = 'Discount value must be greater than 0'
      }

      if (formData.discountType === 'percentage' && formData.discountValue > 100) {
          newErrors.discountValue = 'Percentage discount cannot exceed 100%'
      }

      if (formData.hasExpiry && !formData.expiryDate) {
          newErrors.expiryDate = 'Expiry date is required when expiry is enabled'
      }

      if (formData.hasExpiry && formData.expiryDate) {
          const expiry = new Date(formData.expiryDate)
          if (expiry <= new Date()) {
              newErrors.expiryDate = 'Expiry date must be in the future'
          }
      }

      if (formData.hasUsageLimit && (!formData.usageLimit || formData.usageLimit < 1)) {
          newErrors.usageLimit = 'Usage limit must be at least 1'
      }

      if (formData.minimumOrderAmount && formData.minimumOrderAmount < 0) {
          newErrors.minimumOrderAmount = 'Minimum order amount cannot be negative'
      }

      if (formData.maximumDiscountAmount && formData.maximumDiscountAmount < 0) {
          newErrors.maximumDiscountAmount = 'Maximum discount amount cannot be negative'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
  }
  ```

- **`handleCancel`** — Cancels form and navigates back.
  ```javascript
  const handleCancel = () => {
      navigate('/coupons')
  }
  ```

## Future Enhancements
- Add product/category selection UI (multi-select components).
- Add coupon code auto-generation.
- Add coupon preview functionality.
- Add coupon templates for quick creation.
- Add coupon duplication functionality.
- Add coupon usage analytics preview.
- Add coupon scheduling (start date/time).
- Add coupon stacking rules.
- Add coupon combination restrictions.
- Add coupon customer segment targeting.
- Add coupon A/B testing setup.
- Add coupon performance predictions.
