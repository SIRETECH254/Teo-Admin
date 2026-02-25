# Edit Coupon Screen Documentation

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
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import { useGetCouponById, useUpdateCoupon } from '../../hooks/useCoupons'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetCouponById`, `useUpdateCoupon` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `couponId` extracted from URL using `useParams()` hook.
- **Form state:** `formData` object containing all coupon fields (same structure as AddCoupon, plus `isActive`).
- **Validation state:** `errors` object for field-level error messages.

**`useGetCouponById` hook (from `hooks/useCoupons.js`):**
```javascript
export const useGetCouponById = (couponId) => {
    return useQuery({
        queryKey: ['coupon', couponId],
        queryFn: async () => {
            const response = await couponAPI.getCouponById(couponId)
            return response.data
        },
        enabled: !!couponId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdateCoupon` hook (from `hooks/useCoupons.js`):**
```javascript
export const useUpdateCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ couponId, couponData }) => {
            const response = await couponAPI.updateCoupon(couponId, couponData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            queryClient.invalidateQueries({ queryKey: ['coupon'] })
            toast.success(data.message || 'Coupon updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update coupon error:', error)
            toast.error(error.response?.data?.message || 'Failed to update coupon')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-6`).
- **Header section:** Back button, title, and description.
- **Form section:** Multi-column grid layout (same as AddCoupon, plus Active status toggle).
- **Form actions:** Cancel and Update buttons at bottom.
- **Loading state:** Skeleton loader displayed while coupon data is loading.
- **Error state:** Error message displayed if coupon doesn't exist.

## Planned Layout
(Same as AddCoupon, with additional Active status toggle)

## Sketch Wireframe
(Same as AddCoupon, with Active toggle added)

## Form Inputs
(Same as AddCoupon, plus Active status checkbox)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `couponAPI.getCouponById` and `couponAPI.updateCoupon`.
- **Get coupon endpoint:** `GET /api/coupons/:id`.
- **Update coupon endpoint:** `PUT /api/coupons/:id`.
- **Payload:** Coupon object with all form fields.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: coupon }`.
- **Cache invalidation:** After successful update, both `['coupons']` and `['coupon', id]` queries are invalidated.

## Components Used
(Same as AddCoupon)

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Error state:** Error message displayed if coupon doesn't exist with "Back to Coupons" button.
- **Form validation:** Same as AddCoupon.
- **API errors:** Handled in `useUpdateCoupon` hook's `onError` callback.

## Navigation Flow
- **Route:** `/coupons/:couponId/edit`.
- **Entry points:**
  - From coupons list page via "Edit" button.
  - Direct URL navigation with coupon ID.
- **On mount:** Coupon data is fetched and form is pre-populated.
- **On successful update:** `navigate('/coupons')` redirects to coupons list.
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

          await updateCouponMutation.mutateAsync({ couponId, couponData })
          toast.success('Coupon updated successfully')
          navigate('/coupons')
      } catch (error) {
          toast.error('Failed to update coupon')
      }
  }
  ```

- **Coupon data loading effect** — Loads coupon data and populates form.
  ```javascript
  useEffect(() => {
      if (couponData?.data?.data) {
          const coupon = couponData.data.data
          setFormData({
              name: coupon.name || '',
              description: coupon.description || '',
              discountType: coupon.discountType || 'percentage',
              discountValue: coupon.discountValue?.toString() || '',
              minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '',
              maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
              isActive: coupon.isActive !== undefined ? coupon.isActive : true,
              hasExpiry: coupon.hasExpiry || false,
              expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : '',
              hasUsageLimit: coupon.hasUsageLimit || false,
              usageLimit: coupon.usageLimit?.toString() || '',
              isFirstTimeOnly: coupon.isFirstTimeOnly || false,
              applicableProducts: coupon.applicableProducts || [],
              applicableCategories: coupon.applicableCategories || [],
              excludedProducts: coupon.excludedProducts || [],
              excludedCategories: coupon.excludedCategories || []
          })
      }
  }, [couponData])
  ```

(Other functions same as AddCoupon: `handleInputChange`, `validateForm`, `handleCancel`)

## Future Enhancements
(Same as AddCoupon)
