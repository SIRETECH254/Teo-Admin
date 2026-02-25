# Order Detail Screen Documentation

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
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { orderAPI } from '../../api'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge'
import { FiArrowLeft, FiPrinter, FiMoreVertical, FiUser, FiCreditCard, FiDownload, FiCheckCircle, FiBox, FiTruck, FiCalendar, FiMapPin } from 'react-icons/fi'
import toast from 'react-hot-toast'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **API calls:** Direct API calls using `orderAPI.getOrderById` and `orderAPI.updateOrderStatus` (not using TanStack Query hooks).
- **Order state:** `order` object containing full order details.
- **Status state:** `status` string for order status update.
- **Loading states:** `loading` for initial data fetch, `saving` for status update.

**API call pattern:**
```javascript
const load = useCallback(async () => {
    try {
        setLoading(true)
        const res = await orderAPI.getOrderById(id)
        const ord = res.data?.data?.order
        setOrder(ord)
        setStatus(ord?.status || 'PLACED')
    } catch {
        toast.error('Failed to load order')
    } finally {
        setLoading(false)
    }
}, [id])
```

## UI Structure
- **Screen shell:** Full-height container with gray background (`bg-gray-50`).
- **Header section:** Back button, order title, and action buttons (Print, More).
- **Main content:** Two-column layout (left: order details, right: summary and status).
- **Order items section:** List of order items with product images, titles, variant options, quantities, and prices.
- **Customer details section:** Customer information card.
- **Payment method section:** Payment method information card.
- **Delivery address section:** Delivery address card (only for delivery orders).
- **Order summary section:** Itemized breakdown of subtotal, discounts, fees, tax, and total.
- **Order status section:** Status timeline and status update form.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ← All Orders                    [Print] [More]            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Invoice #INV-001                                     │ │
│  │  Date: 19/09/2025                                    │ │
│  │                                                       │ │
│  │  Order Items                                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [Image] Product Title                           │ │ │
│  │  │         Variant: Size: M                        │ │ │
│  │  │         Quantity: 2  KSH 1,000                  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  Customer Details                                    │ │
│  │  [Avatar] John Doe                                  │ │
│  │  john@example.com                                   │ │
│  │                                                       │ │
│  │  Payment Method                                      │ │
│  │  M-Pesa STK Push                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Order Summary                                        │ │
│  │  Subtotal: KSH 2,000                                 │ │
│  │  Discount: -KSH 200                                  │ │
│  │  Total: KSH 1,800                                    │ │
│  │                                                       │ │
│  │  Order Status                                        │ │
│  │  [Timeline]                                          │ │
│  │  [Status Select] [Save]                              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ← All Orders                              [Print] [More]    │
│                                                               │
│  Invoice #INV-001                                            │
│  Date: 19/09/2025                                            │
│                                                               │
│  Order Items                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🖼️] Product Name                                  │   │
│  │       Variant: Size: M, Color: Blue                │   │
│  │       Quantity: 2                                   │   │
│  │       KSH 1,000                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Customer Details                                             │
│  [👤] John Doe                                                │
│       john@example.com                                        │
│       +254712345678                                           │
│                                                               │
│  Payment Method                                               │
│  [M] M-Pesa STK Push                                          │
│      Receipt: RCP-2025-994372                                │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Order Summary                                       │   │
│  │  Subtotal: KSH 2,000                                 │   │
│  │  Discount: -KSH 200                                  │   │
│  │  Total: KSH 1,800                                    │   │
│  │                                                       │   │
│  │  Order Status                                        │   │
│  │  ✓ Order Placed                                      │   │
│  │  ✓ Processing                                        │   │
│  │  ○ Out for Delivery                                  │   │
│  │  ○ Delivered                                         │   │
│  │                                                       │   │
│  │  Update Status                                       │   │
│  │  [PLACED ▼] [Save]                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Status Update Select**
  ```javascript
  <select 
      value={status} 
      onChange={(e) => setStatus(e.target.value)} 
      className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
  >
      {['PLACED','CONFIRMED','PACKED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED'].map(s => (
          <option key={s} value={s}>{s}</option>
      ))}
  </select>
  ```

- **Status Update Button**
  ```javascript
  <button 
      className="btn-primary px-4 py-2 text-sm" 
      onClick={handleUpdateStatus} 
      disabled={saving}
  >
      {saving ? 'Saving...' : 'Save'}
  </button>
  ```

- **Download Invoice Button**
  ```javascript
  <button
      onClick={() => invoiceNumber && window.open(`/api/invoices/${order.invoiceId}?download=true`, '_blank')}
      className="w-full mt-6 btn-primary py-3 flex items-center justify-center gap-2"
      disabled={!order?.invoiceId}
  >
      <FiDownload className="h-4 w-4" />
      Download Invoice
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via `orderAPI.getOrderById` and `orderAPI.updateOrderStatus`.
- **Get order endpoint:** `GET /api/orders/:id` (admin only).
- **Update order status endpoint:** `PUT /api/orders/:id/status` (admin only).
- **Payload for update status:** `{ status: string }`.
- **Response contract:** `response.data.data.order` contains the full order object with items, customer, pricing, etc.

## Components Used
- React + React Router DOM: `useNavigate`, `useParams`.
- Form elements: `select`, `option`, `button`, `div`, `img`.
- `react-icons/fi` for icons (FiArrowLeft, FiPrinter, FiMoreVertical, FiUser, FiCreditCard, FiDownload, FiCheckCircle, FiBox, FiTruck, FiCalendar, FiMapPin).
- Custom components: `OrderStatusBadge`, `PaymentStatusBadge`.
- Tailwind CSS classes for styling with custom classes (`.btn-primary`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** "Loading order..." message displayed while `loading` is true.
- **Error state:** "Order not found" message displayed if order doesn't exist.
- **API errors:** Handled in try-catch blocks, displayed via toast notifications.
- **Form submission:** Submit button is disabled during submission (`saving` state).

## Navigation Flow
- **Route:** `/orders/:id`.
- **Entry points:**
  - From orders list page via "View" button.
  - Direct URL navigation with order ID.
- **On mount:** Order data is fetched and displayed.
- **On status update:** Order data is refreshed after successful update.
- **Back navigation:** "All Orders" button ➞ `/orders`.

## Functions Involved

- **`load`** — Fetches order data and populates state.
  ```javascript
  const load = useCallback(async () => {
      try {
          setLoading(true)
          const res = await orderAPI.getOrderById(id)
          const ord = res.data?.data?.order
          setOrder(ord)
          setStatus(ord?.status || 'PLACED')
      } catch {
          toast.error('Failed to load order')
      } finally {
          setLoading(false)
      }
  }, [id])
  ```

- **`handleUpdateStatus`** — Updates order status via API.
  ```javascript
  const handleUpdateStatus = async () => {
      try {
          setSaving(true)
          await orderAPI.updateOrderStatus(id, status)
          toast.success('Order status updated')
          await load()
      } catch {
          toast.error('Failed to update status')
      } finally {
          setSaving(false)
      }
  }
  ```

- **Order data loading effect** — Loads order data on mount.
  ```javascript
  useEffect(() => { 
      load() 
  }, [load])
  ```

- **Timeline calculation** — Calculates order status timeline.
  ```javascript
  const statusOrder = ['PLACED','CONFIRMED','PACKED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED']
  const currentStatusIndex = statusOrder.indexOf(order?.status || 'PLACED')
  const timelineBase = [
      { key: 'PLACED', label: 'Order Placed' },
      { key: 'CONFIRMED', label: 'Processing' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
      { key: 'DELIVERED', label: 'Delivered' },
  ]
  const timeline = timelineBase.map((step, idx) => ({
      ...step,
      completed: idx <= currentStatusIndex,
      timestamp: idx === 0 ? order?.createdAt : order?.updatedAt,
  }))
  ```

## Future Enhancements
- Add order notes/comments functionality.
- Add order cancellation with reason.
- Add order refund functionality.
- Add order resend confirmation email.
- Add order print functionality.
- Add order export functionality.
- Add order sharing functionality.
- Add order timeline with detailed timestamps.
- Add order item editing.
- Add order item removal.
- Add order item quantity adjustment.
- Add order customer communication.
- Add order delivery tracking integration.
