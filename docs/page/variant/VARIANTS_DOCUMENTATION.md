# Variants List Screen Documentation

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
import { Link, useNavigate } from 'react-router-dom'
import { useGetVariants, useDeleteVariant } from '../../hooks/useVariants'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/common/StatusBadge'
```

## Context and State Management
- **TanStack Query hooks:** `useGetVariants`, `useDeleteVariant` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `filterStatus`: Variant status filter ('all', 'active', 'inactive')
  - `currentPage`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `selectedVariants`: Array of selected variant IDs for bulk operations
  - `confirmDelete`: Object with `{ open: boolean, variant: object }` for delete confirmation modal

**`useGetVariants` hook (from `hooks/useVariants.js`):**
```javascript
export const useGetVariants = (params = {}) => {
    return useQuery({
        queryKey: ['variants', params],
        queryFn: async () => {
            const response = await variantAPI.getAllVariants(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useDeleteVariant` hook (from `hooks/useVariants.js`):**
```javascript
export const useDeleteVariant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (variantId) => {
            const response = await variantAPI.deleteVariant(variantId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['variants'] })
            toast.success(data.message || 'Variant deleted successfully')
            return data
        },
        onError: (error) => {
            console.error('Delete variant error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete variant')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Header section:** Title, description, search bar, and action buttons.
- **Filters section:** Status filter and rows per page selector.
- **Variants table:** Responsive table with variant information, actions, and bulk selection.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message with call-to-action when no variants exist.
- **Loading state:** Skeleton loader with animated placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Variants                                             │ │
│  │  Manage your product variants and options            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Add Variant]        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Total X variants  [Status] [Rows per page]           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Variants Table                                        │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Variant | Options | Type | Status | Actions │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] Size | 3 options | Simple | Active | ...    │ │ │
│  │  │ [ ] Color | 5 options | Simple | Active | ...   │ │ │
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
│  Variants                                                      │
│  Manage your product variants and options                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search variants...]        [➕ Add Variant]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Total 50 variants  [Status: All ▼] [Rows per page: 10 ▼]   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Variant          │ Options │ Type │ Status │ Actions│ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] Size             │ 3 opts │Simple│ Active │ 👁 ✏️ 🗑│ │
│  │ [ ] Color            │ 5 opts │Simple│ Active │ 👁 ✏️ 🗑│ │
│  │ [ ] Material         │ 2 opts │Simple│ Active │ 👁 ✏️ 🗑│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  [← Previous]  Page 1 of 5  [Next →]                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Search Input**
  ```javascript
  <div className="relative">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
          type="text"
          placeholder="Search variants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
      />
      {searchTerm && (
          <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
              <FiX className="h-4 w-4" />
          </button>
      )}
  </div>
  ```

- **Status Filter**
  ```javascript
  <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      <option value="all">Status: All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
  </select>
  ```

- **Rows Per Page Selector**
  ```javascript
  <select
      value={itemsPerPage}
      onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows per page: {n}</option>))}
  </select>
  ```

- **Bulk Selection Checkbox (Header)**
  ```javascript
  <input
      type="checkbox"
      checked={selectedVariants.length === variants.length && variants.length > 0}
      onChange={handleSelectAll}
      className="rounded border-gray-300 text-primary focus:ring-primary"
  />
  ```

- **Variant Selection Checkbox (Row)**
  ```javascript
  <input
      type="checkbox"
      checked={selectedVariants.includes(variant._id)}
      onChange={() => handleSelectVariant(variant._id)}
      className="rounded border-gray-300 text-primary focus:ring-primary"
  />
  ```

- **Delete Confirmation Modal**
  ```javascript
  {confirmDelete.open && (
      <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <FiAlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Delete variant?</h3>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                      Are you sure you want to delete "{confirmDelete.variant?.name}"? This action cannot be undone.
                  </p>
                  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                      <button
                          onClick={() => setConfirmDelete({ open: false, variant: null })}
                          className="btn-outline"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={async () => {
                              try {
                                  await deleteVariant.mutateAsync(confirmDelete.variant?._id || confirmDelete.variant?.id)
                                  toast.success('Variant deleted successfully')
                              } catch (err) {
                                  toast.error(err.response?.data?.message || 'Failed to delete variant')
                              } finally {
                                  setConfirmDelete({ open: false, variant: null })
                              }
                          }}
                          className="btn-primary bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                      >
                          {deleteVariant.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                  </div>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `variantAPI.getAllVariants` and `variantAPI.deleteVariant`.
- **List variants endpoint:** `GET /api/variants`.
- **Query parameters:** `{ page, limit, search, status }`.
- **Delete variant endpoint:** `DELETE /api/variants/:id`.
- **Response contract:** `response.data` contains `{ data: { success: true, data: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `page`, `limit`, `total`, `pages`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['variants'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`, `Link`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`.
- `react-icons/fi` for icons (FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList).
- Custom components: `Pagination`, `StatusBadge`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.bg-light`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Empty state:** Message displayed when `variants.length === 0` with call-to-action to add variant.
- **Delete errors:** Handled in `useDeleteVariant` hook's `onError` callback, displayed via toast notification.
- **API errors:** TanStack Query automatically handles query errors and provides error states.
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.

## Navigation Flow
- **Route:** `/variants`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a variant (redirects back to list).
- **Variant actions:**
  - "Edit" (edit icon) ➞ `/variants/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add variant:** "Add Variant" button ➞ `/variants/add`.
- **Pagination:** Changing page updates URL params and refetches data.

## Functions Involved

- **`handleSelectVariant`** — Toggles variant selection for bulk operations.
  ```javascript
  const handleSelectVariant = (variantId) => {
      setSelectedVariants(prev =>
          prev.includes(variantId)
              ? prev.filter(id => id !== variantId)
              : [...prev, variantId]
      )
  }
  ```

- **`handleSelectAll`** — Selects or deselects all variants.
  ```javascript
  const handleSelectAll = () => {
      if (selectedVariants.length === variants.length) {
          setSelectedVariants([])
      } else {
          setSelectedVariants(variants.map(variant => variant._id))
      }
  }
  ```

- **`handleEdit`** — Navigates to edit variant page.
  ```javascript
  const handleEdit = (variant) => {
      navigate(`/variants/${variant._id}/edit`)
  }
  ```

- **`clearSearch`** — Clears search term and resets to first page.
  ```javascript
  const clearSearch = () => {
      setSearchTerm('')
      setCurrentPage(1)
  }
  ```

- **Search debouncing effect** — Debounces search term to prevent excessive API calls.
  ```javascript
  useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
      return () => clearTimeout(t)
  }, [searchTerm])
  ```

- **API parameters construction** — Builds query parameters object.
  ```javascript
  const params = {}
  if (filterStatus === 'active') params.status = 'active'
  if (filterStatus === 'inactive') params.status = 'inactive'
  if (filterStatus === 'all') delete params.status
  if (debouncedSearch) params.search = debouncedSearch
  params.page = currentPage
  params.limit = itemsPerPage
  ```

## Future Enhancements
- Add bulk delete functionality for selected variants.
- Add bulk status update (activate/deactivate multiple variants).
- Add export functionality (CSV, Excel).
- Add variant duplication/clone functionality.
- Add variant usage statistics (how many products use each variant).
- Add variant option preview in table.
- Add variant templates for quick creation.
- Add variant import functionality.
- Add advanced filters (by option count, creation date).
- Add sorting options (by name, option count, date).
- Add variant analytics and insights.
- Add keyboard shortcuts for common actions.
- Add variant search by option values.
