# Coupons List Screen Documentation

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
import { FiSearch, FiFilter, FiX, FiEdit2, FiTrash2, FiEye, FiPlus, FiList } from 'react-icons/fi'
import { useGetAllCoupons, useDeleteCoupon } from '../../hooks/useCoupons'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetAllCoupons`, `useDeleteCoupon` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `currentPage`: Current page number
  - `statusFilter`: Status filter ('all', 'active', 'inactive', 'expired', 'limit-reached')
  - `selectedCoupons`: Array of selected coupon IDs for bulk operations
  - `deleteModal`: Object with `{ show: boolean, couponId: string }` for delete confirmation modal

**`useGetAllCoupons` hook (from `hooks/useCoupons.js`):**
```javascript
export const useGetAllCoupons = (params = {}) => {
    return useQuery({
        queryKey: ['coupons', params],
        queryFn: async () => {
            const response = await couponAPI.getAllCoupons(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useDeleteCoupon` hook (from `hooks/useCoupons.js`):**
```javascript
export const useDeleteCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (couponId) => {
            const response = await couponAPI.deleteCoupon(couponId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            toast.success(data.message || 'Coupon deleted successfully')
            return data
        },
        onError: (error) => {
            console.error('Delete coupon error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete coupon')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-6`).
- **Header section:** Title, description, search bar, and action buttons.
- **Filters section:** Status filter and rows per page selector.
- **Bulk actions bar:** Displayed when coupons are selected, shows count and delete button.
- **Coupons table:** Responsive table with comprehensive coupon information.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message when no coupons exist.
- **Loading state:** Skeleton loader with animated placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Coupons Management                                  │ │
│  │  Manage discount coupons and promotional codes      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Add Coupon]         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Total X coupons  [Status] [Rows]                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [X coupon(s) selected] [Delete Selected]             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Coupons Table                                        │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Coupon | Discount | Usage | Expiry | Status│ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] SUMMER20 | 20% | 5/100 | 2024-12-31 | Active│ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Pagination                                            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Coupons Management                                           │
│  Manage discount coupons and promotional codes                │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search coupons by code, name...]               │   │
│  │                        [➕ Add Coupon]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Total 25 coupons  [Status: All ▼] [Rows: 10 ▼]            │
│                                                               │
│  [3 coupon(s) selected] [Delete Selected]                    │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Coupon        │ Discount │ Usage │ Expiry │ Status│ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] SUMMER20      │ 20%      │ 5/100 │ 12/31  │ Active│ │
│  │     Summer Sale   │ Min: $50 │       │        │       │ │
│  │ [ ] WELCOME10     │ $10      │ 2/50  │ No exp │ Active│ │
│  │     Welcome Bonus │          │       │        │       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  [← Previous]  Page 1 of 3  [Next →]                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Search Input** (same structure as other list pages)
- **Status Filter**
  ```javascript
  <select
      value={statusFilter}
      onChange={(e) => {
          setStatusFilter(e.target.value)
          setCurrentPage(1)
          refetch()
      }}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      <option value="all">Status: All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="expired">Expired</option>
      <option value="limit-reached">Limit Reached</option>
  </select>
  ```

- **Bulk Actions Bar**
  ```javascript
  {selectedCoupons.length > 0 && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
              <span className="text-blue-800">
                  {selectedCoupons.length} coupon(s) selected
              </span>
              <div className="flex gap-2">
                  <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                      Delete Selected
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

- **Delete Confirmation Modal**
  ```javascript
  {deleteModal.show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete Coupon
              </h3>
              <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this coupon? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                  <button
                      onClick={() => setDeleteModal({ show: false, couponId: null })}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={handleDeleteCoupon}
                      disabled={deleteCouponMutation.isPending}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                      {deleteCouponMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `couponAPI.getAllCoupons` and `couponAPI.deleteCoupon`.
- **List coupons endpoint:** `GET /api/coupons`.
- **Query parameters:** `{ page, limit, search, status }`.
- **Delete coupon endpoint:** `DELETE /api/coupons/:id`.
- **Response contract:** `response.data` contains `{ data: { coupons: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalCoupons`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['coupons'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`.
- `react-icons/fi` for icons (FiSearch, FiFilter, FiX, FiEdit2, FiTrash2, FiEye, FiPlus, FiList).
- Custom components: `Pagination`, `StatusBadge`.
- Tailwind CSS classes for styling with custom classes (`.btn-primary`, `.btn-outline`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Empty state:** Message displayed when `coupons.length === 0` with helpful text.
- **Delete errors:** Handled in `useDeleteCoupon` hook's `onError` callback, displayed via toast notification.
- **API errors:** TanStack Query automatically handles query errors and provides error states.

## Navigation Flow
- **Route:** `/coupons`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a coupon (redirects back to list).
- **Coupon actions:**
  - "View" (eye icon) ➞ `/coupons/:id`.
  - "Edit" (edit icon) ➞ `/coupons/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add coupon:** "Add Coupon" button ➞ `/coupons/add`.
- **Pagination:** Changing page updates and refetches data.

## Functions Involved

- **`handleSelectCoupon`** — Toggles coupon selection for bulk operations.
  ```javascript
  const handleSelectCoupon = (couponId) => {
      setSelectedCoupons(prev => 
          prev.includes(couponId) 
              ? prev.filter(id => id !== couponId)
              : [...prev, couponId]
      )
  }
  ```

- **`handleSelectAll`** — Selects or deselects all coupons.
  ```javascript
  const handleSelectAll = () => {
      if (selectedCoupons.length === coupons.length) {
          setSelectedCoupons([])
      } else {
          setSelectedCoupons(coupons.map(coupon => coupon._id))
      }
  }
  ```

- **`handleDeleteCoupon`** — Deletes single coupon.
  ```javascript
  const handleDeleteCoupon = async () => {
      try {
          await deleteCouponMutation.mutateAsync(deleteModal.couponId)
          setDeleteModal({ show: false, couponId: null })
          refetch()
          toast.success('Coupon deleted successfully')
      } catch {
          toast.error('Failed to delete coupon')
      }
  }
  ```

- **`handleBulkDelete`** — Deletes multiple coupons.
  ```javascript
  const handleBulkDelete = async () => {
      if (selectedCoupons.length === 0) {
          toast.error('Please select coupons to delete')
          return
      }

      try {
          await Promise.all(selectedCoupons.map(couponId => 
              deleteCouponMutation.mutateAsync(couponId)
          ))
          setSelectedCoupons([])
          refetch()
          toast.success(`${selectedCoupons.length} coupons deleted successfully`)
      } catch {
          toast.error('Failed to delete some coupons')
      }
  }
  ```

- **`formatDiscountValue`** — Formats discount value based on type.
  ```javascript
  const formatDiscountValue = (coupon) => {
      if (coupon.discountType === 'percentage') {
          return `${coupon.discountValue}%`
      } else {
          return `$${coupon.discountValue.toFixed(2)}`
      }
  }
  ```

- **`getCouponStatus`** — Determines coupon status based on multiple conditions.
  ```javascript
  const getCouponStatus = (coupon) => {
      if (!coupon.isActive) return 'inactive'
      if (coupon.isExpired) return 'expired'
      if (coupon.isUsageLimitReached) return 'limit-reached'
      return 'active'
  }
  ```

- **`clearSearch`** — Clears search and resets filters.
  ```javascript
  const clearSearch = () => {
      setSearchTerm('')
      setStatusFilter('all')
      setCurrentPage(1)
      refetch()
  }
  ```

## Future Enhancements
- Add bulk status update (activate/deactivate multiple coupons).
- Add coupon duplication/clone functionality.
- Add coupon usage analytics and reporting.
- Add coupon export functionality (CSV, Excel).
- Add coupon import functionality.
- Add coupon templates for quick creation.
- Add advanced filters (by discount type, date range, usage count).
- Add sorting options (by name, discount value, usage, expiry date).
- Add coupon preview functionality.
- Add coupon sharing functionality.
- Add coupon performance metrics.
- Add coupon A/B testing capabilities.
- Add automated coupon expiration notifications.
