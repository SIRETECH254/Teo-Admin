# Payment Status Screen Documentation

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
import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { paymentAPI, orderAPI } from '../api'
import toast from 'react-hot-toast'
import { FiShoppingCart } from 'react-icons/fi'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** Payment details extracted from URL search params using `useSearchParams()`.
- **Socket.IO:** Real-time payment status updates via Socket.IO connection.
- **Payment state:** `paymentView` object with `{ status: string, title: string, message: string, provider: string }`.
- **Order state:** `orderBreakdown` object containing order pricing details.
- **Loading states:** `isLoading` for API calls, `isFallbackActive` for fallback query status.
- **Refs:** `timeoutRef` for fallback timeout, `socketRef` for Socket.IO connection.

**URL parameters:**
- `method`: Payment method ('mpesa' | 'paystack' | 'cash' | 'post_to_bill')
- `paymentId`: Payment ID
- `orderId`: Order ID
- `provider`: Payment provider ('mpesa' | 'paystack')
- `checkoutRequestId`: M-Pesa checkout request ID
- `invoiceId`: Invoice ID
- `payerPhone`: Payer phone number (M-Pesa)
- `payerEmail`: Payer email (Paystack)
- `reference`: Paystack reference
- `error`: Error message (if order creation failed)

**Socket.IO connection:**
```javascript
const baseUrl = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000'
socketRef.current = io(baseUrl, { 
    transports: ['websocket', 'polling'], 
    withCredentials: false,
    timeout: 20000,
    forceNew: true
})
```

## UI Structure
- **Screen shell:** Full-height container with centered content.
- **Payment status display:** Large status card with icon, title, message, and provider badge.
- **Order breakdown:** Itemized breakdown of order pricing (subtotal, discounts, fees, total).
- **Action buttons:** Retry payment button (for failed payments), Continue shopping button.
- **Loading state:** Spinner and loading message while checking payment status.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────────┐                 │
│                    │  Payment Status      │                 │
│                    │                     │                 │
│                    │  [Status Icon]       │                 │
│                    │  Title              │                 │
│                    │  Message             │                 │
│                    │                     │                 │
│                    │  Order Breakdown    │                 │
│                    │  Subtotal: KSH X    │                 │
│                    │  Total: KSH X       │                 │
│                    │                     │                 │
│                    │  [Retry Payment]    │                 │
│                    │  [Continue Shopping]│                 │
│                    └─────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    ┌─────────────────────┐                   │
│                    │                     │                   │
│                    │  ✅ Payment          │                   │
│                    │  Successful! 🎉     │                   │
│                    │                     │                   │
│                    │  Payment processed   │                   │
│                    │  successfully        │                   │
│                    │                     │                   │
│                    │  Order Breakdown    │                   │
│                    │  Subtotal: KSH 2,000│                   │
│                    │  Discount: -KSH 200 │                   │
│                    │  ─────────────────  │                   │
│                    │  Total: KSH 1,800    │                   │
│                    │                     │                   │
│                    │  [Continue Shopping]│                   │
│                    │                     │                   │
│                    └─────────────────────┘                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Retry Payment Button** (for failed payments)
  ```javascript
  {paymentView.status === 'FAILED' && (
      <button
          onClick={handleRetryPayment}
          className="btn-primary w-full py-3"
      >
          Retry Payment
      </button>
  )}
  ```

- **Continue Shopping Button**
  ```javascript
  <button
      onClick={() => navigate('/products')}
      className="btn-outline w-full py-3"
  >
      Continue Shopping
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via `paymentAPI` and `orderAPI` methods.
- **Query M-Pesa status endpoint:** `GET /api/payments/query-mpesa/:checkoutRequestId` (authenticated users only).
- **Get order by ID endpoint:** `GET /api/orders/:id` (authenticated users only).
- **Socket.IO events:**
  - `connect`: Socket connection established
  - `subscribe-to-payment`: Subscribe to payment updates
  - `callback.received`: M-Pesa callback received (primary for M-Pesa)
  - `payment.updated`: Payment status updated (primary for Paystack, secondary for M-Pesa)
  - `receipt.created`: Receipt created notification
- **M-Pesa result codes:** Handles codes 0 (success), 1 (insufficient balance), 1032 (cancelled), 1037 (timeout), 2001 (wrong PIN), 1001 (failed), 1019 (expired), 1025 (invalid phone), 1026 (system error), 1036 (internal error), 1050 (too many attempts), 9999 (pending), and default (failed).
- **Fallback mechanism:** After 60 seconds, queries M-Pesa status directly from Safaricom API if Socket.IO hasn't received callback.

## Components Used
- React + React Router DOM: `useNavigate`, `useSearchParams`.
- Socket.IO Client: `io` from `socket.io-client`.
- Form elements: `button`, `div`.
- `react-icons/fi` for icons (FiShoppingCart).
- Tailwind CSS classes for styling with custom classes (`.btn-primary`, `.btn-outline`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Spinner and loading message displayed while `isLoading` is true.
- **Error states:** Error messages displayed based on payment status and error parameters.
- **Socket.IO errors:** Connection errors are logged, fallback mechanism activates.
- **Fallback errors:** Errors during fallback query are caught and displayed.
- **M-Pesa result codes:** All result codes are handled with appropriate user-friendly messages.

## Navigation Flow
- **Route:** `/payment-status` (with query parameters).
- **Entry points:**
  - From checkout page after order creation and payment initiation.
  - Direct URL navigation with payment parameters.
- **Payment status handling:**
  - Success ➞ Shows success message, displays order breakdown, allows continue shopping.
  - Failed ➞ Shows failure message, allows retry payment or continue shopping.
  - Pending ➞ Shows pending message, continues listening for updates.
- **On success:** User can continue shopping or view order.
- **On failure:** User can retry payment or continue shopping.

## Functions Involved

- **`clearPaymentTimers`** — Clears timeout and disconnects socket.
  ```javascript
  const clearPaymentTimers = () => {
      if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
      }
      if (socketRef.current) {
          try { 
              socketRef.current.disconnect() 
          } catch (err) { 
              console.error('Socket disconnect error:', err) 
          }
          socketRef.current = null
      }
  }
  ```

- **`startPaymentTracking`** — Initializes Socket.IO connection and sets up event listeners.
  ```javascript
  const startPaymentTracking = useCallback((trackingPaymentId = paymentId, trackingMethod = method) => {
      clearPaymentTimers()

      // Only connect socket for M-Pesa and Paystack
      const shouldConnectSocket = ['mpesa', 'paystack'].includes(trackingMethod)
      if (!shouldConnectSocket) {
          console.log(`Skipping socket connection for method: ${trackingMethod}`)
          return
      }

      // Socket.IO setup
      const baseUrl = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000'
      socketRef.current = io(baseUrl, { 
          transports: ['websocket', 'polling'], 
          withCredentials: false,
          timeout: 20000,
          forceNew: true
      })
      
      socketRef.current.on('connect', () => {
          console.log('Socket connected, subscribing to payment:', trackingPaymentId)
          socketRef.current.emit('subscribe-to-payment', String(trackingPaymentId))
      })
      
      // M-Pesa listeners
      if (trackingMethod === 'mpesa') {
          socketRef.current.on('callback.received', async (payload) => {
              const resultCode = payload.CODE
              // Handle all M-Pesa result codes...
          })
          
          socketRef.current.on('payment.updated', (payload) => {
              // Secondary confirmation...
          })
      }
      
      // Paystack listeners
      if (trackingMethod === 'paystack') {
          socketRef.current.on('payment.updated', (payload) => {
              if (payload.status === 'PAID') {
                  // Handle success...
              } else if (payload.status === 'FAILED') {
                  // Handle failure...
              }
          })
      }
      
      // Fallback query for M-Pesa (after 60 seconds)
      if (trackingMethod === 'mpesa' && checkoutRequestId) {
          timeoutRef.current = setTimeout(async () => {
              try {
                  setIsFallbackActive(true)
                  setIsLoading(true)
                  const res = await paymentAPI.queryMpesaByCheckoutId(checkoutRequestId)
                  const { resultCode, resultDesc } = res.data?.data || {}
                  // Handle result codes...
              } catch (error) {
                  // Handle error...
              } finally {
                  setIsLoading(false)
                  clearPaymentTimers()
              }
          }, 60 * 1000)
      }
  }, [paymentId, method, checkoutRequestId, orderId, provider])
  ```

- **`handleRetryPayment`** — Retries payment for failed orders.
  ```javascript
  const handleRetryPayment = async () => {
      if (!orderId || !invoiceId) {
          toast.error('Cannot retry payment. Please create a new order.')
          navigate('/checkout')
          return
      }
      
      try {
          setIsLoading(true)
          // Navigate back to checkout with order/invoice IDs
          const params = new URLSearchParams({
              orderId,
              invoiceId,
              method: method || 'mpesa'
          })
          navigate(`/checkout?${params.toString()}`)
      } catch (error) {
          toast.error('Failed to retry payment')
      } finally {
          setIsLoading(false)
      }
  }
  ```

- **Payment tracking initialization effect** — Initializes payment tracking on mount.
  ```javascript
  useEffect(() => {
      const loadOrderDataAndInitialize = async () => {
          // Check for error parameter
          if (errorParam) {
              setPaymentView({
                  status: 'FAILED',
                  title: 'Order Creation Failed',
                  message: errorParam,
                  provider
              })
              return
          }
          
          // Load order breakdown if orderId exists
          if (orderId) {
              try {
                  const detail = await orderAPI.getOrderById(orderId)
                  const ord = detail?.data?.data?.order
                  setOrderBreakdown(ord?.pricing || null)
              } catch (err) {
                  console.error('Failed to fetch order breakdown:', err)
              }
          }
          
          // Initialize payment tracking
          if (paymentId && (method === 'mpesa' || method === 'paystack')) {
              startPaymentTracking(paymentId, method)
          } else if (method === 'cash' || method === 'post_to_bill') {
              // Cash and post-to-bill are immediately successful
              setPaymentView({
                  status: 'SUCCESS',
                  title: 'Order Created Successfully! 🎉',
                  message: method === 'cash' 
                      ? 'Your order has been created. Please prepare cash for delivery.' 
                      : 'Your order has been created. You will be billed later.',
                  provider: method
              })
          }
      }
      
      loadOrderDataAndInitialize()
      
      // Cleanup on unmount
      return () => {
          clearPaymentTimers()
      }
  }, [paymentId, method, orderId, errorParam, provider, startPaymentTracking])
  ```

## Future Enhancements
- Add payment receipt download.
- Add payment history view.
- Add payment retry with different method.
- Add payment cancellation.
- Add payment refund initiation.
- Add payment status email notifications.
- Add payment status SMS notifications.
- Add payment analytics.
- Add payment method preferences.
- Add payment security enhancements.
- Add payment fraud detection.
- Add payment dispute handling.
