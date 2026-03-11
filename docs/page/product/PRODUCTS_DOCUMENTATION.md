# Products List Screen Documentation

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
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetProducts, useDeleteProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiPackage, FiAlertTriangle, FiX, FiList, FiImage, FiGrid, FiEye } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
```

## Context and State Management
- **TanStack Query hooks:** `useGetProducts`, `useDeleteProduct`, `useGetBrands`, `useGetCategories` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Memoization:** `useMemo` and `useCallback` used extensively for performance optimization.
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `filterStatus`: Product status filter ('all', 'active', 'draft', 'archived')
  - `filterBrand`: Brand filter ID or 'all'
  - `filterCategory`: Category filter ID or 'all'
  - `currentPage`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `selectedProducts`: Array of selected product IDs for bulk operations
  - `confirmDelete`: Object with `{ open: boolean, product: object }` for delete confirmation modal

**`useGetProducts` hook (from `hooks/useProducts.js`):**
```javascript
export const useGetProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const response = await productAPI.getAllProducts(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
    })
}
```

**`useDeleteProduct` hook (from `hooks/useProducts.js`):**
```javascript
export const useDeleteProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (productId) => {
            const response = await productAPI.deleteProduct(productId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success(data.message || 'Product deleted successfully')
            return data
        },
        onError: (error) => {
            console.error('Delete product error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete product')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Header section:** Title, description, search bar, and action buttons.
- **Filters section:** Status, brand, category filters with clear button.
- **Products table:** Responsive table with product information, actions, and bulk selection.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message with call-to-action when no products exist.
- **Loading state:** Skeleton loader with animated placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Products                                             │ │
│  │  Manage your product catalog with variants and SKUs   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Add Product]        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Total X products  [Status] [Brand] [Category] [Rows] │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Products Table                                        │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Product | Brand | Price | Status | Actions │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] Product 1 | Brand | KES 100 | Active | ... │ │ │
│  │  │ [ ] Product 2 | Brand | KES 200 | Draft  | ... │ │ │
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
│  Products                                                      │
│  Manage your product catalog with variants and SKUs           │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search products...]        [➕ Add Product]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Total 50 products  [Status: All ▼] [Brand: All ▼]          │
│                     [Category: All ▼] [Rows: 10 ▼] [Clear]   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Product          │ Brand │ Price │ Status │ Actions│ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] [img] Product 1  │ Nike  │ KES 100│ Active │ 👁 ✏️ 🗑│ │
│  │ [ ] [img] Product 2  │ Adidas│ KES 200│ Draft  │ 👁 ✏️ 🗑│ │
│  │ [ ] [img] Product 3  │ Puma  │ KES 300│ Active │ 👁 ✏️ 🗑│ │
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
          placeholder="Search products..."
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
      <option value="draft">Draft</option>
      <option value="archived">Archived</option>
  </select>
  ```

- **Brand Filter**
  ```javascript
  <select
      value={filterBrand}
      onChange={(e) => setFilterBrand(e.target.value)}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      <option value="all">Brand: All</option>
      {brands.map(brand => (
          <option key={brand._id} value={brand._id}>{brand.name}</option>
      ))}
  </select>
  ```

- **Category Filter**
  ```javascript
  <select
      value={filterCategory}
      onChange={(e) => setFilterCategory(e.target.value)}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      <option value="all">Category: All</option>
      {categories.map(category => (
          <option key={category._id} value={category._id}>{category.name}</option>
      ))}
  </select>
  ```

- **Rows Per Page Selector**
  ```javascript
  <select
      value={itemsPerPage}
      onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
      className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
  >
      {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
  </select>
  ```

- **Bulk Selection Checkbox (Header)**
  ```javascript
  <input
      type="checkbox"
      checked={selectedProducts.length === products.length && products.length > 0}
      onChange={handleSelectAll}
      className="rounded border-gray-300 text-primary focus:ring-primary"
  />
  ```

- **Product Selection Checkbox (Row)**
  ```javascript
  <input
      type="checkbox"
      checked={selectedProducts.includes(product._id || product.id)}
      onChange={() => handleSelectProduct(product._id || product.id)}
      className="rounded border-gray-300 text-primary focus:ring-primary"
  />
  ```

- **Delete Confirmation Modal**
  ```javascript
  {confirmDelete.open && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                  <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
              </div>
              <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{confirmDelete.product?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                  <button
                      onClick={() => setConfirmDelete({ open: false, product: null })}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={deleteProduct.isPending}
                  >
                      Cancel
                  </button>
                  <button
                      onClick={confirmDeleteProduct}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      disabled={deleteProduct.isPending}
                  >
                      {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `productAPI.getAllProducts` and `productAPI.deleteProduct`.
- **List products endpoint:** `GET /api/products`.
- **Query parameters:** `{ page, limit, search, status, brand, category }`.
- **Delete product endpoint:** `DELETE /api/products/:id`.
- **Response contract:** `response.data` contains `{ data: array, pagination: object }`.
- **Pagination:** Response includes `pagination` object with `page`, `limit`, `totalDocs`, `totalPages`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['products'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`, `Link`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`.
- `react-icons/fi` for icons (FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiPackage, FiAlertTriangle, FiX, FiList, FiImage, FiGrid, FiEye).
- Custom components: `Pagination`, `StatusBadge`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.input`, `.bg-light`).

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Empty state:** Message displayed when `products.length === 0` with call-to-action to add product.
- **Delete errors:** Handled in `useDeleteProduct` hook's `onError` callback, displayed via toast notification.
- **API errors:** TanStack Query automatically handles query errors and provides error states.
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.

## Navigation Flow
- **Route:** `/products`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a product (redirects back to list).
- **Product actions:**
  - "View" (eye icon) ➞ `/products/:id/details`.
  - "Edit" (edit icon) ➞ `/products/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add product:** "Add Product" button ➞ `/products/add`.
- **Pagination:** Changing page updates URL params and refetches data.

## Functions Involved

- **`handleSelectProduct`** — Toggles product selection for bulk operations.
  ```javascript
  const handleSelectProduct = useCallback((productId) => {
      setSelectedProducts(prev =>
          prev.includes(productId)
              ? prev.filter(id => id !== productId)
              : [...prev, productId]
      )
  }, [])
  ```

- **`handleSelectAll`** — Selects or deselects all products.
  ```javascript
  const handleSelectAll = useCallback(() => {
      setSelectedProducts(prev => {
          if (prev.length === products.length) {
              return []
          } else {
              return products.map(prod => prod._id || prod.id)
          }
      })
  }, [products])
  ```

- **`handleEdit`** — Navigates to edit product page.
  ```javascript
  const handleEdit = useCallback((product) => {
      navigate(`/products/${product._id || product.id}/edit`)
  }, [navigate])
  ```

- **`handleViewDetails`** — Navigates to product details page.
  ```javascript
  const handleViewDetails = useCallback((product) => {
      navigate(`/products/${product._id || product.id}/details`)
  }, [navigate])
  ```

- **`handleDelete`** — Opens delete confirmation modal.
  ```javascript
  const handleDelete = useCallback((product) => {
      setConfirmDelete({ open: true, product })
  }, [])
  ```

- **`confirmDeleteProduct`** — Confirms and executes product deletion.
  ```javascript
  const confirmDeleteProduct = useCallback(async () => {
      try {
          await deleteProduct.mutateAsync(confirmDelete.product._id || confirmDelete.product.id)
          setConfirmDelete({ open: false, product: null })
      } catch (error) {
          console.error('Delete error:', error)
      }
  }, [confirmDelete.product, deleteProduct])
  ```

- **`clearSearch`** — Clears search term and resets to first page.
  ```javascript
  const clearSearch = useCallback(() => {
      setSearchTerm('')
      setCurrentPage(1)
  }, [])
  ```

- **`clearFilters`** — Resets all filters to default values.
  ```javascript
  const clearFilters = useCallback(() => {
      setFilterStatus('all')
      setFilterBrand('all')
      setFilterCategory('all')
      setCurrentPage(1)
  }, [])
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
  const params = useMemo(() => {
      const p = {}
      if (filterStatus === 'active') p.status = 'active'
      if (filterStatus === 'draft') p.status = 'draft'
      if (filterStatus === 'archived') p.status = 'archived'
      if (filterBrand !== 'all') p.brand = filterBrand
      if (filterCategory !== 'all') p.category = filterCategory
      if (debouncedSearch) p.search = debouncedSearch
      p.page = currentPage
      p.limit = itemsPerPage
      return p
  }, [filterStatus, filterBrand, filterCategory, debouncedSearch, currentPage, itemsPerPage])
  ```

## Future Enhancements
- Add bulk delete functionality for selected products.
- Add bulk status update (activate/deactivate multiple products).
- Add export functionality (CSV, Excel).
- Add import functionality for bulk product creation.
- Add advanced filters (price range, date range, stock level).
- Add sorting options (by name, price, date, stock).
- Add product duplication/clone functionality.
- Add product templates for quick creation.
- Add product comparison view.
- Add quick edit modal for common fields.
- Add product analytics and insights.
- Add product tags filtering.
- Add saved filter presets.
- Add keyboard shortcuts for common actions.
