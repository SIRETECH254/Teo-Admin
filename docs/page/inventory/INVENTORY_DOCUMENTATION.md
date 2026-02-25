# Inventory Management Screen Documentation

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
import { FiSearch, FiFilter, FiList, FiX, FiPackage, FiArrowUpCircle, FiArrowDownCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { useGetProducts, useUpdateSKU } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetVariants } from '../../hooks/useVariants'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetProducts`, `useUpdateSKU`, `useGetBrands`, `useGetCategories`, `useGetVariants` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks and `useMemo` for performance optimization.
- **Form state:** Multiple state variables for filters, search, pagination, and modals:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `filterBrand`: Brand filter ID or 'all'
  - `filterCategory`: Category filter ID or 'all'
  - `currentPage`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `expanded`: Object mapping product IDs to expanded state
  - `adjusting`: Object with `{ open: boolean, product: object, sku: object }` for stock adjustment modal
  - `adjustForm`: Object with `{ type: 'increase'|'decrease', amount: number, reason: string, note: string }`
  - `skuManagement`: Object with `{ open: boolean, product: object, sku: object }` for SKU management modal
  - `skuForm`: Object with SKU fields (price, stock, lowStockThreshold, allowPreOrder, preOrderStock, barcode)

**`useUpdateSKU` hook (from `hooks/useProducts.js`):**
```javascript
export const useUpdateSKU = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, skuId, skuData }) => {
            const response = await productAPI.updateSKU(productId, skuId, skuData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success(data.message || 'SKU updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update SKU error:', error)
            toast.error(error.response?.data?.message || 'Failed to update SKU')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Header section:** Title, description, search bar, and filters.
- **Product list:** Expandable/collapsible list of products with SKU details.
- **Stock adjustment modal:** Modal for increasing/decreasing stock with reason and note.
- **SKU management modal:** Large modal for comprehensive SKU editing (price, stock, thresholds, barcode, pre-order).
- **Pagination:** Bottom pagination component for navigating pages.
- **Empty state:** Centered message when no products exist.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Inventory                                             │ │
│  │  Manage SKUs, stock levels, and low‑stock thresholds  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...] [Brand] [Category] [Rows]                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Product List (Expandable)                            │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │ ▶ Product 1 (50 units • Tracking)              │ │ │
│  │  │   ┌─────────────────────────────────────────┐ │ │ │
│  │  │   │ Variant | Stock | Low Stock | Pre-order │ │ │ │
│  │  │   │ Size: S | 10   | 5        | No         │ │ │ │
│  │  │   │ Size: M | 20   | 5        | Yes        │ │ │ │
│  │  │   └─────────────────────────────────────────┘ │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
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
│  Inventory                                                     │
│  Manage SKUs, stock levels, and low‑stock thresholds         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search products or SKU code...]                 │   │
│  │ [Brand: All ▼] [Category: All ▼] [Rows: 10 ▼]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ▶ Product Title                                        │ │
│  │   50 units • Tracking                                  │ │
│  │                                                         │ │
│  │   (When expanded)                                      │ │
│  │   ┌───────────────────────────────────────────────┐   │ │
│  │   │ Variant      │ Stock │ Low │ Pre-order │ Actions│ │
│  │   ├───────────────────────────────────────────────┤   │ │
│  │   │ Size: Small  │ 10    │ 5   │ No        │ Manage│ │
│  │   │ Size: Medium │ 20    │ 5   │ Yes       │ Manage│ │
│  │   │ Size: Large  │ 20    │ 5   │ No        │ Manage│ │
│  │   └───────────────────────────────────────────────┘   │ │
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
          placeholder="Search products or SKU code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
      />
      {searchTerm && (
          <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX className="h-4 w-4" />
          </button>
      )}
  </div>
  ```

- **Brand Filter**
  ```javascript
  <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
      <option value="all">Brand: All</option>
      {brands.map((b) => (<option key={b._id} value={b._id}>{b.name}</option>))}
  </select>
  ```

- **Category Filter**
  ```javascript
  <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
      <option value="all">Category: All</option>
      {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
  </select>
  ```

- **Stock Adjustment Modal**
  ```javascript
  {adjusting.open && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjust Stock</h3>
              <p className="text-sm text-gray-600 mb-4">{adjusting.product?.title} • {adjusting.sku?.skuCode}</p>

              <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setAdjustForm((f) => ({ ...f, type: 'increase' }))} className={`px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${adjustForm.type === 'increase' ? 'bg-secondary-button text-primary border-secondary-button' : 'bg-white text-gray-700 border-gray-300'}`}>
                          <FiArrowUpCircle className="h-4 w-4" /> Increase
                      </button>
                      <button onClick={() => setAdjustForm((f) => ({ ...f, type: 'decrease' }))} className={`px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${adjustForm.type === 'decrease' ? 'bg-secondary-button text-primary border-secondary-button' : 'bg-white text-gray-700 border-gray-300'}`}>
                          <FiArrowDownCircle className="h-4 w-4" /> Decrease
                      </button>
                  </div>

                  <div>
                      <label className="block text-xs text-gray-600 mb-1">Amount</label>
                      <input type="number" min={1} value={adjustForm.amount} onChange={(e) => setAdjustForm((f) => ({ ...f, amount: e.target.value }))} className="input" />
                  </div>

                  <div>
                      <label className="block text-xs text-gray-600 mb-1">Reason</label>
                      <select value={adjustForm.reason} onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                          <option value="receive">Receive</option>
                          <option value="return">Return</option>
                          <option value="correction">Correction</option>
                          <option value="damage">Damage</option>
                          <option value="shrink">Shrink</option>
                      </select>
                  </div>

                  <div>
                      <label className="block text-xs text-gray-600 mb-1">Note (optional)</label>
                      <input type="text" value={adjustForm.note} onChange={(e) => setAdjustForm((f) => ({ ...f, note: e.target.value }))} className="input" />
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button onClick={submitAdjust} disabled={updateSku.isPending} className="btn-primary flex-1 py-2">{updateSku.isPending ? 'Saving...' : 'Save'}</button>
                      <button onClick={closeAdjust} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                  </div>
              </div>
          </div>
      </div>
  )}
  ```

- **SKU Management Modal** (comprehensive form with price, stock, thresholds, barcode, pre-order settings)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `productAPI.getAllProducts` and `productAPI.updateSKU`.
- **List products endpoint:** `GET /api/products`.
- **Query parameters:** `{ page, limit, search, brand, category }`.
- **Update SKU endpoint:** `PUT /api/products/:productId/skus/:skuId`.
- **Payload:** `{ stock: number }` for adjustment, or full SKU object for management.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: sku }`.
- **Cache invalidation:** After update, `queryClient.invalidateQueries({ queryKey: ['products'] })` is called.

## Components Used
- React hooks: `useState`, `useEffect`, `useMemo`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `label`, `div`.
- `react-icons/fi` for icons (FiSearch, FiFilter, FiList, FiX, FiPackage, FiArrowUpCircle, FiArrowDownCircle, FiChevronDown, FiChevronRight).
- Custom components: `Pagination`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.input`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Loading message displayed while `isLoading` is true.
- **Empty state:** Message displayed when `products.length === 0` with helpful text.
- **API errors:** Handled in `useUpdateSKU` hook's `onError` callback, displayed via toast notification.
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.
- **Stock validation:** Ensures stock cannot go below 0.

## Navigation Flow
- **Route:** `/inventory`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After updating SKU (stays on page, refreshes data).
- **Product expansion:** Clicking product row toggles SKU table visibility.
- **SKU actions:**
  - "Manage" button ➞ Opens SKU management modal.
  - Stock adjustment ➞ Opens stock adjustment modal (if implemented).

## Functions Involved

- **`toggleProduct`** — Toggles product expansion state.
  ```javascript
  const toggleProduct = (productId) => {
      setExpanded((prev) => ({ ...prev, [productId]: !prev[productId] }))
  }
  ```

- **`renderSkuAttributes`** — Renders variant attributes for SKU display.
  ```javascript
  const renderSkuAttributes = (sku) => {
      const attrs = (sku.attributes || []).map(a => {
          const variantName = variantNameById[a.variantId] || 'Option'
          const optionValue = optionValueById[a.optionId] || '-'
          return `${variantName}: ${optionValue}`
      })
      return attrs.length ? attrs.join(', ') : (sku.skuCode || '-')
  }
  ```

- **`openSkuManagement`** — Opens SKU management modal and populates form.
  ```javascript
  const openSkuManagement = (product, sku) => {
      setSkuManagement({ open: true, product, sku })
      setSkuForm({
          price: sku.price !== undefined && sku.price !== null ? sku.price.toString() : '',
          stock: sku.stock !== undefined && sku.stock !== null ? sku.stock.toString() : '',
          lowStockThreshold: sku.lowStockThreshold !== undefined && sku.lowStockThreshold !== null ? sku.lowStockThreshold.toString() : '',
          allowPreOrder: sku.allowPreOrder || false,
          preOrderStock: sku.preOrderStock !== undefined && sku.preOrderStock !== null ? sku.preOrderStock.toString() : '',
          barcode: sku.barcode || ''
      })
  }
  ```

- **`submitSkuUpdate`** — Submits SKU update via mutation.
  ```javascript
  const submitSkuUpdate = async () => {
      try {
          const { product, sku } = skuManagement
          if (!product || !sku) return
          
          const skuData = {
              price: parseFloat(skuForm.price) || 0,
              stock: parseInt(skuForm.stock) || 0,
              lowStockThreshold: parseInt(skuForm.lowStockThreshold) || 5,
              allowPreOrder: skuForm.allowPreOrder,
              preOrderStock: parseInt(skuForm.preOrderStock) || 0,
              barcode: skuForm.barcode
          }
          
          await updateSku.mutateAsync({ productId: product._id, skuId: sku._id, skuData })
          toast.success('SKU updated successfully')
          closeSkuManagement()
      } catch (e) {
          toast.error('Failed to update SKU')
      }
  }
  ```

- **Memoized variant/option lookups** — Builds quick lookup maps for variant names and option values.
  ```javascript
  const variantNameById = useMemo(() => {
      const list = variantsData?.data?.data || variantsData?.data || variantsData || []
      const map = {}
      list.forEach(v => { map[v._id] = v.name })
      return map
  }, [variantsData])

  const optionValueById = useMemo(() => {
      const list = variantsData?.data?.data || variantsData?.data || variantsData || []
      const map = {}
      list.forEach(v => {
          ;(v.options || []).forEach(opt => { map[opt._id] = opt.value })
      })
      return map
  }, [variantsData])
  ```

## Future Enhancements
- Add bulk stock adjustment (adjust multiple SKUs at once).
- Add stock movement history/audit log.
- Add low stock alerts/notifications.
- Add stock transfer between SKUs.
- Add stock import/export (CSV, Excel).
- Add stock forecasting and analytics.
- Add reorder point management.
- Add stock reservation system.
- Add stock adjustment templates.
- Add barcode scanning support.
- Add stock count/cycle count functionality.
- Add stock valuation reporting.
- Add automated reorder suggestions.
