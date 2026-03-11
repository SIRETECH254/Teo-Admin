# Orders List Screen Documentation

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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../../api'
import { FiSearch, FiX, FiFilter, FiList, FiAlertTriangle, FiEye, FiTrash2, FiTag } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge'
import toast from 'react-hot-toast'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **API calls:** Direct API calls using `orderAPI.getOrders` and `orderAPI.deleteOrder` (not using TanStack Query hooks).
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `filterStatus`: Order status filter ('all', 'PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED')
  - `filterPayment`: Payment status filter ('all', 'UNPAID', 'PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED')
  - `filterType`: Order type filter ('all', 'pickup', 'delivery')
  - `filterLocation`: Location filter ('all', 'in_shop', 'away')
  - `currentPage`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `selectedOrders`: Array of selected order IDs for bulk operations
  - `confirmDelete`: Object with `{ open: boolean, order: object }` for delete confirmation modal
  - `isLoading`: Loading state for API calls
  - `ordersData`: API response data

**API call pattern:**
```javascript
const loadOrders = useCallback(async () => {
    try {
        setIsLoading(true)
        const res = await orderAPI.getOrders(params)
        const payload = res.data?.data || {}
        setOrdersData({
            orders: payload.orders || [],
            pagination: payload.pagination || {}
        })
    } catch (e) {
        toast.error('Failed to load orders')
    } finally {
        setIsLoading(false)
    }
}, [params])
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Header section:** Title, description, search bar.
- **Filters section:** Multiple filter dropdowns (Status, Payment, Type, Location) and rows per page selector.
- **Orders table:** Responsive table with order information including invoice number, customer, date, status badges, payment status, and actions.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message when no orders found.
- **Loading state:** Loading indicator while fetching data.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Orders                                                │ │
│  │  Manage customer orders, statuses, and payments       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Status] [Payment] [Type] [Location] [Rows] [Clear] │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Orders Table                                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Invoice | Customer | Date | Status | ...   │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] INV-001 | John | ... | Placed | ...        │ │ │
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
│  Orders                                                       │
│  Manage customer orders, statuses, and payments                │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search by invoice number...]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  [Status: All ▼] [Payment: All ▼] [Type: All ▼] [Location: All ▼] [Rows: 10 ▼] [Clear] │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Invoice    │ Customer │ Date │ Status │ Actions  │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] INV-001    │ John Doe │ ...  │ Placed │ 👁 🗑    │ │
│  │ [ ] INV-002    │ Jane     │ ...  │ Paid   │ 👁 🗑    │ │
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
          placeholder="Search by invoice number..."
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
  <div className="relative">
      <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
      <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
      >
          <option value="all">Status: All</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="OUT_FOR_DELIVERY">Out for delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
      </select>
  </div>
  ```

- **Payment Status Filter**
  ```javascript
  <div className="relative">
      <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
      <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
      >
          <option value="all">Payment: All</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
          <option value="REFUNDED">Refunded</option>
      </select>
  </div>
  ```

- **Delete Confirmation Modal**
  ```javascript
  {confirmDelete.open && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                  <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this order?</p>
              <div className="flex justify-end space-x-3">
                  <button
                      onClick={() => setConfirmDelete({ open: false, order: null })}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={confirmDeleteOrder}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                      Delete
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via `orderAPI.getOrders` and `orderAPI.deleteOrder`.
- **List orders endpoint:** `GET /api/orders` (admin only).
- **Query parameters:** `{ page, limit, q, status, paymentStatus, type, location }`.
- **Delete order endpoint:** `DELETE /api/orders/:id` (admin only).
- **Response contract:** `response.data.data` contains `{ orders: [...], pagination: {...} }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalItems`.

## Components Used
- React + React Router DOM: `useNavigate`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`.
- `react-icons/fi` for icons (FiSearch, FiX, FiFilter, FiList, FiAlertTriangle, FiEye, FiTrash2, FiTag).
- Custom components: `Pagination`, `OrderStatusBadge`, `PaymentStatusBadge`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Loading indicator displayed while `isLoading` is true.
- **Empty state:** Message displayed when `orders.length === 0`.
- **Delete errors:** Handled in `confirmDeleteOrder`, displayed via toast notification.
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.

## Navigation Flow
- **Route:** `/orders`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After order creation (redirects to order detail).
- **Order actions:**
  - "View" (eye icon) ➞ `/orders/:id` (order detail page).
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Pagination:** Changing page updates params and refetches data.

## Functions Involved

- **`loadOrders`** — Fetches orders from API with current params.
  ```javascript
  const loadOrders = useCallback(async () => {
      try {
          setIsLoading(true)
          const res = await orderAPI.getOrders(params)
          const payload = res.data?.data || {}
          setOrdersData({
              orders: payload.orders || [],
              pagination: payload.pagination || {}
          })
      } catch (e) {
          toast.error('Failed to load orders')
      } finally {
          setIsLoading(false)
      }
  }, [params])
  ```

- **`handleSelectOrder`** — Toggles order selection for bulk operations.
  ```javascript
  const handleSelectOrder = useCallback((orderId) => {
      setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId])
  }, [])
  ```

- **`handleSelectAll`** — Selects or deselects all orders.
  ```javascript
  const handleSelectAll = useCallback(() => {
      setSelectedOrders(prev => (prev.length === orders.length ? [] : orders.map(o => o._id)))
  }, [orders])
  ```

- **`handleDelete`** — Opens delete confirmation modal.
  ```javascript
  const handleDelete = useCallback((order) => {
      setConfirmDelete({ open: true, order })
  }, [])
  ```

- **`confirmDeleteOrder`** — Confirms and executes order deletion.
  ```javascript
  const confirmDeleteOrder = useCallback(async () => {
      try {
          await orderAPI.deleteOrder(confirmDelete.order._id)
          setConfirmDelete({ open: false, order: null })
          loadOrders()
          toast.success('Order deleted')
      } catch (e) {
          toast.error('Failed to delete order')
      }
  }, [confirmDelete.order, loadOrders])
  ```

- **`clearSearch`** — Clears search term and resets to first page.
  ```javascript
  const clearSearch = useCallback(() => { 
      setSearchTerm(''); 
      setCurrentPage(1) 
  }, [])
  ```

- **`clearFilters`** — Clears all filters and resets to first page.
  ```javascript
  const clearFilters = useCallback(() => {
      setFilterStatus('all')
      setFilterPayment('all')
      setFilterType('all')
      setFilterLocation('all')
      setCurrentPage(1)
  }, [])
  ```

- **`goToDetails`** — Navigates to order detail page.
  ```javascript
  const goToDetails = (orderId) => navigate(`/orders/${orderId}`)
  ```

- **Search debouncing effect** — Debounces search term to prevent excessive API calls.
  ```javascript
  useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
      return () => clearTimeout(t)
  }, [searchTerm])
  ```

- **Orders loading effect** — Loads orders when params change.
  ```javascript
  useEffect(() => {
      loadOrders()
  }, [loadOrders])
  ```

## Future Enhancements
- Add bulk delete functionality for selected orders.
- Add bulk status update (update status for multiple orders).
- Add order export functionality (CSV, Excel, PDF).
- Add order import functionality.
- Add order filtering by date range.
- Add order sorting options (by date, amount, status).
- Add order search by customer name/email.
- Add order templates.
- Add order duplication functionality.
- Add order notes/comments.
- Add order tags/categories.
- Add order activity logs.
