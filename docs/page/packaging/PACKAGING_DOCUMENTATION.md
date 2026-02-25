# Packaging List Screen Documentation

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
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiStar, FiCheckCircle, FiXCircle, FiFilter, FiList, FiX } from 'react-icons/fi'
import { useGetPackaging, useDeletePackaging, useSetDefaultPackaging } from '../../hooks/usePackaging'
import Pagination from '../../components/common/Pagination'
```

## Context and State Management
- **TanStack Query hooks:** `useGetPackaging`, `useDeletePackaging`, `useSetDefaultPackaging` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks and `useMemo` for performance optimization.
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `active`: Status filter ('all', 'true', 'false')
  - `isDefault`: Default filter ('all', 'true', 'false')
  - `page`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `selectedIds`: Array of selected packaging IDs for bulk operations
  - `confirmDelete`: Boolean for delete confirmation modal

**`useGetPackaging` hook (from `hooks/usePackaging.js`):**
```javascript
export const useGetPackaging = (params = {}) => {
    return useQuery({
        queryKey: ['packaging', params],
        queryFn: async () => {
            const response = await packagingAPI.getAllPackaging(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useSetDefaultPackaging` hook (from `hooks/usePackaging.js`):**
```javascript
export const useSetDefaultPackaging = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (packagingId) => {
            const response = await packagingAPI.setDefaultPackaging(packagingId)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success('Default packaging updated successfully')
        },
        onError: (error) => {
            console.error('Set default packaging error:', error)
            toast.error(error.response?.data?.message || 'Failed to set default packaging')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`container mx-auto py-6`).
- **Header section:** Title, description, search bar, and action buttons.
- **Filters section:** Status filter, default filter, rows per page selector, and clear filters button.
- **Packaging table:** Responsive table with packaging information, actions, and bulk selection.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message when no packaging options exist.
- **Loading state:** Skeleton loader with animated placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Packaging                                             │ │
│  │  Manage available packaging options and the standard  │ │
│  │  default                                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Add Packaging]      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Total X options  [Status] [Default] [Rows] [Clear]   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Packaging Table                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Name | Price | Status | Default | Actions   │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] Standard | KSh 0.00 | Active | ⭐ Standard │ │ │
│  │  │ [ ] Gift | KSh 50.00 | Active | Set as standard│ │ │
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
│  Packaging                                                     │
│  Manage available packaging options and the standard default   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search packaging...]        [➕ Add Packaging]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Total 10 options  [Status: All ▼] [Default: Any ▼]         │
│                    [Rows: 10 ▼] [Clear]                      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Name          │ Price │ Status │ Default │ Actions│ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] Standard      │ KSh 0 │ Active │ ⭐ Standard │ ✏️ 🗑│ │
│  │ [ ] Gift          │ KSh 50│ Active │ Set as standard│ ✏️ 🗑│ │
│  │ [ ] Premium       │ KSh 100│ Active│ Set as standard│ ✏️ 🗑│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  [← Previous]  Page 1 of 2  [Next →]                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Search Input** (same structure as other list pages)
- **Status Filter**
  ```javascript
  <select
      value={active}
      onChange={(e) => { setActive(e.target.value); setPage(1) }}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      <option value="all">Status: All</option>
      <option value="true">Active</option>
      <option value="false">Inactive</option>
  </select>
  ```

- **Default Filter**
  ```javascript
  <select
      value={isDefault}
      onChange={(e) => { setIsDefault(e.target.value); setPage(1) }}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      <option value="all">Default: Any</option>
      <option value="true">Default only</option>
      <option value="false">Non-default</option>
  </select>
  ```

- **Clear Filters Button**
  ```javascript
  {(active !== 'all' || isDefault !== 'all') && (
      <button onClick={clearFilters} className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
          <FiX className="h-3 w-3" />
          Clear
      </button>
  )}
  ```

- **Set Default Button**
  ```javascript
  {row.isDefault ? (
      <span className="inline-flex items-center text-purple-700 bg-purple-100 rounded-full px-2 py-0.5 text-xs font-medium">
          <FiStar className="mr-1" /> Standard
      </span>
  ) : (
      <button onClick={() => setDefaultMutation.mutate(row._id)} className="text-primary hover:underline text-sm">
          Set as standard
      </button>
  )}
  ```

- **Delete Confirmation Modal**
  ```javascript
  {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete Packaging</h3>
              <p className="text-gray-600 mb-6">
                  {(() => {
                      const names = list.filter(r => selectedIds.includes(r._id)).map(r => r.name)
                      return names.length === 1
                          ? <>Are you sure you want to delete <span className="font-semibold">{names[0]}</span>?</>
                          : <>Are you sure you want to delete {names.length} packaging option(s)?</>
                  })()}
              </p>
              <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                  <button onClick={handleDelete} disabled={delMutation.isPending} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                      {delMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `packagingAPI.getAllPackaging`, `packagingAPI.deletePackaging`, `packagingAPI.setDefaultPackaging`.
- **List packaging endpoint:** `GET /api/packaging`.
- **Query parameters:** `{ page, limit, search, active, isDefault, sort }`.
- **Delete packaging endpoint:** `DELETE /api/packaging/:id`.
- **Set default endpoint:** `PUT /api/packaging/:id/set-default`.
- **Response contract:** `response.data` contains `{ data: { packaging: [...], pagination: {...} } }`.
- **Cache invalidation:** After delete or set default, `queryClient.invalidateQueries({ queryKey: ['packaging'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`.
- `react-icons/fi` for icons (FiPlus, FiSearch, FiTrash2, FiEdit2, FiStar, FiCheckCircle, FiXCircle, FiFilter, FiList, FiX).
- Custom components: `Pagination`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`).

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Empty state:** Message displayed when `list.length === 0` with call-to-action to add packaging.
- **Delete errors:** Handled in `useDeletePackaging` hook's `onError` callback.
- **Set default errors:** Handled in `useSetDefaultPackaging` hook's `onError` callback.
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.

## Navigation Flow
- **Route:** `/packaging`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing packaging (redirects back to list).
- **Packaging actions:**
  - "Edit" (edit icon) ➞ `/packaging/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
  - "Set as standard" button ➞ Sets packaging as default and refreshes list.
- **Add packaging:** "Add Packaging" button ➞ `/packaging/add`.
- **Pagination:** Changing page updates URL params and refetches data.

## Functions Involved

- **`toggleSelectAll`** — Selects or deselects all packaging options.
  ```javascript
  const toggleSelectAll = () => {
      if (allSelected) setSelectedIds([])
      else setSelectedIds(list.map((x) => x._id))
  }
  ```

- **`toggleSelect`** — Toggles individual packaging selection.
  ```javascript
  const toggleSelect = (id) => {
      setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  ```

- **`handleDelete`** — Deletes selected packaging options sequentially.
  ```javascript
  const handleDelete = async () => {
      if (selectedIds.length === 0) return
      setConfirmDelete(false)
      for (const id of selectedIds) {
          await delMutation.mutateAsync(id)
      }
      setSelectedIds([])
  }
  ```

- **`clearFilters`** — Resets all filters to default values.
  ```javascript
  const clearFilters = () => {
      setSearchTerm('')
      setActive('all')
      setIsDefault('all')
      setPage(1)
  }
  ```

- **Search debouncing effect** — Debounces search term to prevent excessive API calls.
  ```javascript
  useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
      return () => clearTimeout(t)
  }, [searchTerm])
  ```

- **Memoized API parameters** — Prevents unnecessary re-renders by memoizing query parameters.
  ```javascript
  const params = useMemo(() => ({
      page,
      limit: itemsPerPage,
      search: debouncedSearch || undefined,
      active: active === 'all' ? undefined : active === 'true',
      isDefault: isDefault === 'all' ? undefined : isDefault === 'true',
      sort: 'createdAt:desc'
  }), [page, itemsPerPage, debouncedSearch, active, isDefault])
  ```

## Future Enhancements
- Add bulk delete functionality for selected packaging.
- Add bulk status update (activate/deactivate multiple packaging).
- Add export functionality (CSV, Excel).
- Add packaging templates for quick creation.
- Add packaging usage statistics (how many orders use each packaging).
- Add packaging cost tracking and reporting.
- Add packaging image/icon support.
- Add packaging description field.
- Add packaging weight/dimensions tracking.
- Add packaging import functionality.
- Add advanced filters (by price range, creation date).
- Add sorting options (by name, price, date).
- Add packaging analytics and insights.
