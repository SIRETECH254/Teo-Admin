# Brands List Screen Documentation

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
import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList, FiLoader, FiExternalLink } from 'react-icons/fi'
import { useGetBrands, useDeleteBrand } from '../../../hooks/useBrands'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from '../../../components/common/StatusBadge'
import Pagination from '../../../components/common/Pagination'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetBrands`, `useDeleteBrand` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `filterStatus`: Brand status filter ('all', 'active', 'inactive')
  - `currentPage`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `selectedBrands`: Array of selected brand IDs for bulk operations
  - `confirmDelete`: Object with `{ open: boolean, brand: object }` for delete confirmation modal

**`useGetBrands` hook (from `hooks/useBrands.js`):**
```javascript
export const useGetBrands = (params = {}) => {
    return useQuery({
        queryKey: ['brands', params],
        queryFn: async () => {
            const response = await brandAPI.getAllBrands(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Header section:** Title, description, search bar, and action buttons.
- **Filters section:** Status filter and rows per page selector.
- **Brands table:** Responsive table with brand information including logo, name, slug, product count, status, and actions.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message with call-to-action when no brands exist.
- **Loading state:** Skeleton loader with animated placeholders including logo placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Brands                                              │ │
│  │  Manage your product brands and manufacturers      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Add Brand]         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Total X brands  [Status] [Rows per page]           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Brands Table                                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Brand | Products | Status | Actions         │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] [logo] Nike | 25 products | Active | ...   │ │ │
│  │  │ [ ] [logo] Adidas | 15 products | Active | ... │ │ │
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
│  Brands                                                        │
│  Manage your product brands and manufacturers                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search brands...]        [➕ Add Brand]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Total 50 brands  [Status: All ▼] [Rows per page: 10 ▼]     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Brand          │ Products │ Status │ Actions     │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] [N] Nike       │ 25       │ Active │ ✏️ 🗑        │ │
│  │     nike-slug      │ products │        │             │ │
│  │ [ ] [A] Adidas    │ 15       │ Active │ ✏️ 🗑        │ │
│  │     adidas-slug    │ products │        │             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  [← Previous]  Page 1 of 5  [Next →]                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Search Input** (same structure as other list pages)
- **Status Filter** (same structure as other list pages)
- **Brand Logo Display** (with fallback to initial letter)
  ```javascript
  <div className="h-10 w-10 flex-shrink-0 mr-3">
      {brand.logo ? (
          <img 
              className="h-10 w-10 rounded-lg object-cover" 
              src={brand.logo} 
              alt={brand.name}
              onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
              }}
          />
      ) : null}
      <div 
          className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center"
          style={{ display: brand.logo ? 'none' : 'flex' }}
      >
          <span className="text-sm font-medium text-gray-500">
              {brand.name?.charAt(0)?.toUpperCase() || 'B'}
          </span>
      </div>
  </div>
  ```

- **Delete Confirmation Modal** (same structure as other list pages)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `brandAPI.getAllBrands` and `brandAPI.deleteBrand`.
- **List brands endpoint:** `GET /api/brands`.
- **Query parameters:** `{ page, limit, search, status }`.
- **Delete brand endpoint:** `DELETE /api/brands/:id`.
- **Response contract:** `response.data` contains `{ data: { brands: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalBrands`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['brands'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`, `Link`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `img`.
- `react-icons/fi` for icons (FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList, FiLoader, FiExternalLink).
- Custom components: `Pagination`, `StatusBadge`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.bg-light`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true, including logo placeholders.
- **Empty state:** Message displayed when `brands.length === 0` with call-to-action to add brand.
- **Delete errors:** Handled in `useDeleteBrand` hook's `onError` callback, displayed via toast notification.
- **Image errors:** Logo images have error handlers to show fallback initial letter.
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.

## Navigation Flow
- **Route:** `/brands`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a brand (redirects back to list).
- **Brand actions:**
  - "Edit" (edit icon) ➞ `/brands/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add brand:** "Add Brand" button ➞ `/brands/add`.
- **Pagination:** Changing page updates URL params and refetches data.

## Functions Involved

- **`handleSelectBrand`** — Toggles brand selection for bulk operations.
- **`handleSelectAll`** — Selects or deselects all brands.
- **`handleEdit`** — Navigates to edit brand page.
- **`clearSearch`** — Clears search term and resets to first page.
- **Search debouncing effect** — Debounces search term to prevent excessive API calls.

## Future Enhancements
- Add bulk delete functionality for selected brands.
- Add bulk status update (activate/deactivate multiple brands).
- Add brand logo upload functionality.
- Add export functionality (CSV, Excel).
- Add brand import functionality.
- Add brand analytics and insights.
- Add brand product count drill-down.
- Add brand sorting options (by name, product count, date).
- Add brand templates for quick creation.
- Add brand duplication functionality.
- Add brand usage statistics.
- Add brand SEO settings management.
