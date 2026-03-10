# Payment Status Screen Documentation (Web)

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Socket.IO Integration](#socketio-integration)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft, FiPackage } from 'react-icons/fi';
import { useGetPaymentById, useQueryMpesaByCheckoutId, usePayInvoice } from '../hooks/usePayments';
import { useGetOrderById } from '../hooks/useOrders';
```

## Context and State Management
- **Route Params:** `useSearchParams()` extracts `paymentId`, `checkoutRequestId`, `orderId`, and `method` from the URL.
- **TanStack Query:** 
  - `useGetPaymentById(paymentId)` fetches existing payment record.
  - `useGetOrderById(orderId)` fetches order details for the summary.
  - `useQueryMpesaByCheckoutId(checkoutId)` manual refetch for M-Pesa status fallback.
  - `usePayInvoice()` mutation for retrying failed payments.
- **Socket.IO:**
  - `socketRef` - Persistent reference for the WebSocket connection.
  - `socketConnected` - Tracks real-time connection health.
- **Local State:**
  - `socketStatus` - Real-time status updates from WebSocket events.
  - `isFallbackActive` - Indicates if the 60s fallback timer has triggered.
  - `socketError` - Stores specific failure messages (e.g., "Insufficient Funds").

## UI Structure
- **Main Container:** Centered card layout using `container-xs` and `bg-white`.
- **Status Indicator:** Large animated icons (`FiCheckCircle`, `FiXCircle`, `FiLoader`) indicating success, failure, or processing.
- **Details Card:** `Order Summary` section showing Order ID, Total, and Method.
- **Connection Status:** Small indicator dots showing "Live Connection Active".
- **Action Footer:** Dynamic buttons for "View My Orders", "Retry Payment", or "Back to Cart".

## Planned Layout
```
┌────────────────────────────────────────────┐
│              PAYMENT STATUS                │
├────────────────────────────────────────────┤
│                                            │
│              [ LARGE ICON ]                │
│          Waiting for M-Pesa...             │
│                                            │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ Order Summary:                         │ │
│ │ • Order ID: #ABC12345                  │ │
│ │ • Total: KSh 1,500.00                  │ │
│ │ • Method: MPESA                        │ │
│ └────────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│ Connection: ● Live Connection Active       │
├────────────────────────────────────────────┤
│ [     RETRY PAYMENT / VIEW ORDERS    ]     │
│             ← Back to Home                 │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    [ 🔄 Processing ]                       │
│               Waiting for M-Pesa Prompt...                 │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Order Summary:                                         │ │
│ │ • Order ID: #TEO-9981                                  │ │
│ │ • Total: KSh 500.00                                    │ │
│ │ • Method: M-Pesa                                       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Real-time Connection: ● Active                             │
│                                                            │
│ [ View My Orders ]                                         │
│ ← Return to Previous Page                                  │
└────────────────────────────────────────────────────────────┘
```

## Socket.IO Integration

### Connection Setup
- Connects to `VITE_API_BASE_URL` using `socket.io-client`.
- Subscribes to specific payment updates: `socket.emit('subscribe-to-payment', paymentId)`.
- Listeners for `callback.received` (Daraja callbacks) and `payment.updated` (General status).

### Event Handling
- **`callback.received`**:
  - Validates `paymentId` matches current tracking.
  - Processes `CODE` 0 as success, other codes as specific failures.
- **`payment.updated`**:
  - Updates `socketStatus` based on server-side database changes.
  - Triggers cleanup on final states (`SUCCESS`, `FAILED`, `PAID`).

### Fallback Query (M-Pesa Only)
- A `setTimeout` of 60 seconds is initialized on mount.
- If no final status is received via WebSocket, `refetchMpesaStatus()` is called to query Safaricom's API directly.

## API Integration
- **TanStack Hooks:** Centralized in `src/hooks/usePayments.js` and `src/hooks/useOrders.js`.
- **Endpoints Used:**
  - `GET /api/payments/:paymentId`
  - `GET /api/orders/:orderId`
  - `GET /api/payments/status/:checkoutId`
- **Headers:** Managed via the `axios` instance in `src/api/config.js`.
- **Response Handling:** Maps backend statuses (`PENDING`, `SUCCESS`, `PAID`, `FAILED`, `CANCELLED`) to UI themes.

## Components Used
- **React Router:** `useNavigate`, `useSearchParams`.
- **Icons:** `react-icons/fi` (Feather Icons).
- **Notifications:** `react-hot-toast`.
- **Socket:** `socket.io-client`.

## Error Handling
- **User Cancellation:** Specifically handles Daraja code `1032`.
- **Insufficient Funds:** Handles Daraja code `1`.
- **Connection Failure:** WebSocket includes `reconnectionAttempts` logic.
- **Retry Logic:** `handleRetry` allows re-triggering the payment mutation without leaving the page.

## Navigation Flow
- **Success:** Redirects to `/orders`.
- **Failure:** Stays on page with `Retry` option, or redirects to `/cart`.
- **Manual Back:** Uses `navigate(-1)` for standard browser back behavior.

## Functions Involved

- **`startTracking`** — Initializes websocket and fallback timers.
  ```tsx
  const startTracking = useCallback((trackingPaymentId, trackingMethod) => {
    clearPaymentTimers();
    // ... Socket Initialization ...
    socketRef.current.on('callback.received', (payload) => {
      if (String(payload.paymentId) === String(trackingPaymentId)) {
        handleMpesaResultCode(payload.CODE, payload.message);
      }
    });
    // ... Fallback Timer ...
  }, [clearPaymentTimers, handleMpesaResultCode, checkoutId, refetchMpesaStatus]);
  ```

- **`handleMpesaResultCode`** — Centralized logic for mapping API codes to UI states.
  ```tsx
  const handleMpesaResultCode = useCallback((resultCode, resultMessage) => {
    clearPaymentTimers();
    const code = parseInt(resultCode, 10);
    if (code === 0) setSocketStatus('SUCCESS');
    else if (code === 1032) setSocketStatus('CANCELLED');
    // ... other codes ...
  }, [clearPaymentTimers]);
  ```

- **`clearPaymentTimers`** — Disconnects socket and clears the fallback timeout.
  ```tsx
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (socketRef.current) socketRef.current.disconnect();
  }, []);
  ```

## Implementation Details
- **Tailwind Classes:** Uses project-standard classes like `title2`, `btn-primary`, `container-xs`.
- **Vite Env:** Accesses `import.meta.env.VITE_API_BASE_URL` for dynamic environment support.
- **Effect Cleanup:** Ensures no memory leaks by calling `clearPaymentTimers` on unmount.

## Future Enhancements
- Visual progress timeline.
- Receipt download button on success.
- Audio notification for successful payment.
