# Cart Screen Documentation

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
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useCart'
import { useValidateCoupon, useApplyCoupon } from '../hooks/useCoupons'
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiX, FiTag, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetCart`, `useUpdateCartItem`, `useRemoveFromCart`, `useClearCart` for cart operations, `useValidateCoupon` for coupon validation.
- **State management:** Local component state managed with `useState` hooks.
- **Cart state:** Cart data from `useGetCart` hook, memoized for performance.
- **Coupon state:**
  - `couponCode`: Current coupon code input
  - `appliedCoupon`: Applied coupon object (persisted in localStorage)
  - `isApplyingCoupon`: Loading state for coupon application
- **Modal state:** `showClearModal` boolean for clear cart confirmation.

**`useGetCart` hook (from `hooks/useCart.js`):**
```javascript
export const useGetCart = () => {
    return useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const response = await cartAPI.getCart()
            return response.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}
```

**Coupon persistence:**
- Applied coupon is stored in `localStorage` with key `'appliedCoupon'`.
- Coupon is automatically re-validated when subtotal changes.

## UI Structure
- **Screen shell:** Full-width container with max-width constraint (`max-w-4xl mx-auto`) and padding (`px-4 py-8`).
- **Header section:** Back button, title, and item count badge.
- **Cart items section:** List of cart items with product image, title, variant options, quantity controls, price, and remove button.
- **Coupon section:** Coupon code input with apply/remove buttons.
- **Order summary section:** Subtotal, discount, and final total with checkout button.
- **Clear cart modal:** Confirmation modal overlay for clearing entire cart.
- **Empty state:** Centered message with icon and "Continue Shopping" button when cart is empty.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ← Shopping Cart  [X items]                                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Cart Items                                           │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  [Image] Product Title                          │ │ │
│  │  │         Variant: Size: M, Color: Blue          │ │ │
│  │  │         [−] 2 [+]  KSH 1,000  [🗑]             │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Coupon Code                                          │ │
│  │  [Enter code] [Apply]                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Order Summary                                        │ │
│  │  Subtotal: KSH 2,000                                 │ │
│  │  Discount: -KSH 200                                  │ │
│  │  Total: KSH 1,800                                    │ │
│  │  [Proceed to Checkout]                               │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ← Shopping Cart                              [3 items]      │
│                                                               │
│  Cart Items                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🖼️] Product Name                                  │   │
│  │       Variant: Size: M, Color: Blue                │   │
│  │       [−] 2 [+]  KSH 1,000  [🗑]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Coupon Code                                                 │
│  [Enter coupon code] [Apply]                                │
│  ✓ Coupon "SAVE10" applied! [Remove]                        │
│                                                               │
│  Order Summary                                               │
│  Subtotal: KSH 2,000                                         │
│  Discount: -KSH 200                                          │
│  ─────────────────────────────────                          │
│  Total: KSH 1,800                                            │
│                                                               │
│  [Proceed to Checkout]                                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Quantity Controls** (increment/decrement buttons)
  ```javascript
  <div className="flex items-center space-x-2">
      <button
          onClick={() => handleQuantityChange(item.skuId, item.quantity - 1)}
          className="p-1 rounded border border-gray-300 hover:bg-gray-100"
      >
          <FiMinus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center font-medium">{item.quantity}</span>
      <button
          onClick={() => handleQuantityChange(item.skuId, item.quantity + 1)}
          className="p-1 rounded border border-gray-300 hover:bg-gray-100"
      >
          <FiPlus className="w-4 h-4" />
      </button>
  </div>
  ```

- **Coupon Code Input**
  ```javascript
  <div className="flex space-x-2">
      <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
          onClick={handleApplyCoupon}
          disabled={isApplyingCoupon}
          className="btn-primary px-4 py-2"
      >
          {isApplyingCoupon ? 'Applying...' : 'Apply'}
      </button>
  </div>
  ```

- **Applied Coupon Display**
  ```javascript
  {appliedCoupon && (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
              <FiCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                  Coupon "{appliedCoupon.name}" applied! 
                  {appliedCoupon.discountType === 'percentage' 
                      ? ` ${appliedCoupon.discountValue}% off` 
                      : ` KSH ${appliedCoupon.discountValue} off`}
              </span>
          </div>
          <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-800"
          >
              <FiX className="w-5 h-5" />
          </button>
      </div>
  )}
  ```

- **Clear Cart Modal**
  ```javascript
  {showClearModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear Cart</h3>
              <p className="text-gray-600 mb-6">
                  Are you sure you want to remove all items from your cart?
              </p>
              <div className="flex justify-end space-x-3">
                  <button
                      onClick={cancelClearCart}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={confirmClearCart}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                      Clear Cart
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `cartAPI` and `couponAPI` methods.
- **Get cart endpoint:** `GET /api/cart` (authenticated users only).
- **Update cart item endpoint:** `PUT /api/cart/items/:skuId` (authenticated users only).
- **Remove from cart endpoint:** `DELETE /api/cart/items/:skuId` (authenticated users only).
- **Clear cart endpoint:** `DELETE /api/cart` (authenticated users only).
- **Validate coupon endpoint:** `POST /api/coupons/validate` (authenticated users only).
- **Payload for validate coupon:** `{ code: string, orderAmount: number }`.
- **Response contract:** Cart response contains `{ data: { items: [...], subtotal, total } }`.
- **Cache invalidation:** After cart mutations, `queryClient.invalidateQueries({ queryKey: ['cart'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `button`, `div`, `img`.
- `react-icons/fi` for icons (FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiX, FiTag, FiCheck).
- Tailwind CSS classes for styling with custom classes (`.btn-primary`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Error state:** Error message with retry button when `error` exists.
- **Empty state:** Message displayed when `cartItems.length === 0` with icon and call-to-action.
- **Coupon errors:** Handled in `handleApplyCoupon`, displayed via toast notifications.
- **Quantity validation:** Minimum quantity of 1 enforced.

## Navigation Flow
- **Route:** `/cart`.
- **Entry points:**
  - From product pages via "Add to Cart" button.
  - Direct URL navigation.
  - From checkout page if cart becomes empty.
- **Cart actions:**
  - Quantity change ➞ Updates cart item via API.
  - Remove item ➞ Removes item from cart via API.
  - Clear cart ➞ Opens confirmation modal, then clears entire cart.
- **Coupon actions:**
  - Apply coupon ➞ Validates and applies coupon, stores in localStorage.
  - Remove coupon ➞ Removes applied coupon, clears localStorage.
- **Checkout:** "Proceed to Checkout" button ➞ `/checkout` (only if total > 0).

## Functions Involved

- **`handleQuantityChange`** — Updates item quantity in cart.
  ```javascript
  const handleQuantityChange = useCallback(async (skuId, newQuantity) => {
      if (newQuantity < 1) {
          toast.error('Quantity must be at least 1')
          return
      }
      try {
          await updateCartItem.mutateAsync({ skuId, quantity: newQuantity })
      } catch (err) {
          console.error('Error updating quantity:', err)
      }
  }, [updateCartItem])
  ```

- **`handleRemoveItem`** — Removes item from cart.
  ```javascript
  const handleRemoveItem = useCallback(async (skuId) => {
      try {
          await removeFromCart.mutateAsync(skuId)
      } catch (err) {
          console.error('Error removing item:', err)
      }
  }, [removeFromCart])
  ```

- **`handleApplyCoupon`** — Validates and applies coupon code.
  ```javascript
  const handleApplyCoupon = useCallback(async () => {
      if (!couponCode.trim()) {
          toast.error('Please enter a coupon code')
          return
      }
      setIsApplyingCoupon(true)
      try {
          const result = await validateCoupon.mutateAsync({
              code: couponCode.toUpperCase(),
              orderAmount: calculateSubtotal
          })
          if (result.data.success) {
              const applied = {
                  code: result.data.data.coupon.code,
                  discountAmount: result.data.data.discountAmount,
                  name: result.data.data.coupon.name,
                  discountType: result.data.data.coupon.discountType,
                  discountValue: result.data.data.coupon.discountValue
              }
              setAppliedCoupon(applied)
              localStorage.setItem('appliedCoupon', JSON.stringify(applied))
              toast.success(`Coupon "${result.data.data.coupon.name}" applied successfully!`)
              setCouponCode('')
          } else {
              toast.error(result.data.message)
          }
      } catch (err) {
          toast.error('Failed to apply coupon. Please try again.')
      } finally {
          setIsApplyingCoupon(false)
      }
  }, [couponCode, validateCoupon, calculateSubtotal])
  ```

- **`handleRemoveCoupon`** — Removes applied coupon.
  ```javascript
  const handleRemoveCoupon = useCallback(() => {
      setAppliedCoupon(null)
      localStorage.removeItem('appliedCoupon')
      toast.success('Coupon removed successfully')
  }, [])
  ```

- **`handleCheckout`** — Navigates to checkout page.
  ```javascript
  const handleCheckout = useCallback(() => {
      if (!hasValidTotal) {
          toast.error('Total should be above zero')
          return
      }
      navigate('/checkout')
  }, [navigate, hasValidTotal])
  ```

- **Coupon revalidation effect** — Re-validates coupon when subtotal changes.
  ```javascript
  useEffect(() => {
      const revalidate = async () => {
          if (!appliedCoupon?.code) return
          try {
              const res = await validateCoupon.mutateAsync({
                  code: appliedCoupon.code,
                  orderAmount: calculateSubtotal
              })
              if (res?.data?.success) {
                  setAppliedCoupon((prev) => prev ? {
                      ...prev,
                      discountAmount: res.data.data.discountAmount
                  } : prev)
              } else {
                  setAppliedCoupon(null)
              }
          } catch (e) {
              console.error('Coupon revalidation failed:', e)
          }
      }
      revalidate()
  }, [calculateSubtotal])
  ```

## Future Enhancements
- Add save for later functionality.
- Add cart item notes/comments.
- Add cart sharing functionality.
- Add cart expiration/auto-clear.
- Add cart templates/presets.
- Add cart item recommendations.
- Add cart item wishlist option.
- Add cart item quantity bulk update.
- Add cart item duplicate functionality.
- Add cart item move to wishlist.
- Add cart item comparison.
- Add cart item reviews/ratings display.
