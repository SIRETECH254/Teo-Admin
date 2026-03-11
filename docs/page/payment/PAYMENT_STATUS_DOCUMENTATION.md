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
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft, FiPackage, FiUser, FiCreditCard } from 'react-icons/fi';
import { useGetPaymentById, useQueryMpesaByCheckoutId, usePayInvoice } from '../hooks/usePayments';
import { useGetOrderById } from '../hooks/useOrders';
```

## Context and State Management
- **Route Params:** `useSearchParams()` extracts `paymentId`, `checkoutRequestId`, `orderId`, and `method` from the URL.
- **TanStack Query:** 
  - `useGetPaymentById(paymentId)` fetches existing payment record.
  - `useGetOrderById(orderId)` fetches order details for the summary.
  - `useQueryMpesaByCheckoutId(checkoutId)` manual refetch for M-Pesa status fallback (enabled: false).
  - `usePayInvoice()` mutation for retrying failed payments.
- **Socket.IO:**
  - `socketRef` - Persistent reference for the WebSocket connection.
  - `socketConnected` - Tracks real-time connection health.
- **Local State:**
  - `socketStatus` - Real-time status updates from WebSocket events.
  - `isFallbackActive` - Indicates if the 60s fallback timer has triggered.
  - `socketError` - Stores specific failure messages from the backend/socket.
  - `isRetrying` - Tracks the loading state of the retry mutation.

## UI Structure
- **Main Container:** Centered card layout with a maximum width of `3xl` for readability.
- **Status Section:** Large animated icons indicating `SUCCESS`, `FAILED`, `CANCELLED`, or `PENDING` states.
- **Payment Details Sections:**
  - **Items Purchased:** List of products with images, names, variants, and individual pricing.
  - **Customer Info:** Displays name and contact details of the user.
  - **Payment Breakdown:** Detailed breakdown of subtotal, discounts, fees (delivery/packaging), and taxes.
  - **Order Metadata:** Displays Order Reference, Payment Method, Fulfillment Type, and Location.
- **Connection Status:** Real-time indicator for the live WebSocket connection.
- **Action Footer:** Contextual buttons:
  - **Success:** "View My Orders".
  - **Failure/Cancelled:** "Retry Payment" and "View Order Details".
  - **Pending:** "View Order Details".

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
│ │ Items Purchased                        │ │
│ │ [Image] Product Name (Variant)         │ │
│ ├────────────────────────────────────────┤ │
│ │ Customer Info                          │ │
│ │ Name (Email/Phone)                     │ │
│ ├────────────────────────────────────────┤ │
│ │ Payment Breakdown                      │ │
│ │ Subtotal / Discounts / Total           │ │
│ ├────────────────────────────────────────┤ │
│ │ Order Metadata                         │ │
│ │ #REF-ID / Method / Fulfillment         │ │
│ └────────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│ Connection: ● Live Connection Active       │
├────────────────────────────────────────────┤
│ [    RETRY PAYMENT / ORDER DETAILS   ]     │
└────────────────────────────────────────────┘
```

## Socket.IO Integration

### Connection Setup
- Connects to `VITE_API_BASE_URL` using `socket.io-client`.
- Subscribes to specific payment updates: `socket.emit('subscribe-to-payment', paymentId)`.
- Listeners for `callback.received` (Daraja callbacks) and `payment.updated` (General status).

### Event Handling
- **`callback.received`**:
  - Validates `paymentId` matches current tracking.
  - Processes `CODE` 0 as success, other codes as specific failures using a comprehensive switch.
- **`payment.updated`**:
  - Updates `socketStatus` based on server-side database changes.
  - Triggers cleanup on final states (`SUCCESS`, `FAILED`, `PAID`).

### Fallback Query (M-Pesa Only)
- A `setTimeout` of 60 seconds is initialized on mount.
- If no final status is received via WebSocket, `refetchMpesaStatus()` is called to query the status endpoint.
- Maps `ResultCode`/`resultCode` and `ResultDesc`/`resultDesc` from the response.

## API Integration
- **TanStack Hooks:** Centralized in `src/hooks/usePayments.js` and `src/hooks/useOrders.js`.
- **Endpoints Used:**
  - `GET /api/payments/:paymentId`
  - `GET /api/orders/:orderId`
  - `GET /api/payments/status/:checkoutId`
- **Response Handling:** Maps backend statuses and result codes to specific UI themes and toast notifications.

## Components Used
- **React Router:** `useNavigate`, `useSearchParams`.
- **Icons:** `react-icons/fi`.
- **Notifications:** `react-hot-toast`.
- **Socket:** `socket.io-client`.

## Error Handling
- **Specific Codes:** Handles Daraja codes like `1032` (Cancelled), `1` (Insufficient Funds), `1037` (Timeout), etc.
- **Socket Fallback:** Uses `isFallbackActive` to indicate manual query is in progress.
- **Retry Logic:** `handleRetry` triggers a new `payInvoice` mutation and restarts tracking with the new `paymentId`.

## Navigation Flow
- **Success:** Redirects to `/orders`.
- **Failure/Retry:** Navigates to `/orders/:orderId` (Order Detail) or initiates retry.
- **Manual Back:** Uses `navigate(-1)` for standard browser back behavior.

## Functions Involved

### `clearPaymentTimers`
Cleanup function to disconnect sockets and clear fallback timeouts.
```tsx
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketConnected(false);
  }, []);
```

### `handleMpesaResultCode`
Comprehensive mapper for Daraja API result codes to UI states.
```tsx
  const handleMpesaResultCode = useCallback((resultCode, resultMessage) => {
    clearPaymentTimers();
    
    // Explicitly convert to number and handle null/undefined/string/number
    const code = resultCode !== null && resultCode !== undefined ? Number(resultCode) : -1;

    switch (code) {
      case 0:
        setSocketStatus('SUCCESS');
        toast.success('Payment received successfully!');
        break;
      
      case 1032:
        setSocketStatus('CANCELLED');
        setSocketError(resultMessage || 'Payment cancelled by user');
        toast.error('Payment cancelled');
        break;
      
      case 1:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'Insufficient balance');
        toast.error('Insufficient M-Pesa balance');
        break;

      case 1037:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'Request timeout. User cannot be reached.');
        toast.error('Payment timeout');
        break;

      case 2001:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'Invalid PIN entered.');
        toast.error('Invalid PIN');
        break;

      case 1001:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'Unable to lock subscriber, a transaction is already in progress.');
        toast.error('Transaction in progress');
        break;

      case 1019:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'Transaction expired.');
        toast.error('Transaction expired');
        break;

      case 1025:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'Invalid phone number or formatting error.');
        toast.error('Invalid phone number');
        break;

      case 1036:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'System internal error occurred.');
        toast.error('System error');
        break;

      case 1050:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || 'Maximum number of retries exceeded.');
        toast.error('Too many attempts');
        break;

      default:
        setSocketStatus('FAILED');
        setSocketError(resultMessage || `Transaction failed (Code: ${code})`);
        toast.error(resultMessage || 'Transaction failed');
        break;
    }
  }, [clearPaymentTimers]);
```

### `startTracking`
Initializes the tracking lifecycle, including WebSockets and Fallback timers.
```tsx
  const startTracking = useCallback((trackingPaymentId, trackingMethod) => {
    clearPaymentTimers();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    // Initialize Socket connection
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      socketRef.current?.emit('subscribe-to-payment', trackingPaymentId);
    });

    socketRef.current.on('callback.received', (payload) => {
      // Check if this payload belongs to this payment
      const payloadPaymentId = payload.paymentId || payload.invoiceId;
      const isMatch = !payloadPaymentId || String(payloadPaymentId) === String(trackingPaymentId);

      if (isMatch) {
        handleMpesaResultCode(payload.CODE || payload.resultCode, payload.message || payload.resultDesc);
      }
    });

    socketRef.current.on('payment.updated', (payload) => {
      if (String(payload.paymentId) === String(trackingPaymentId)) {
        setSocketStatus(payload.status);
        if (payload.status === 'SUCCESS' || payload.status === 'FAILED' || payload.status === 'PAID') {
          clearPaymentTimers();
        }
      }
    });

    // Fallback timeout for M-Pesa (60 seconds)
    if (trackingMethod === 'MPESA' && checkoutId) {
      timeoutRef.current = setTimeout(async () => {
        setIsFallbackActive(true);
        try {
          const result = await refetchMpesaStatus();
          const fallbackData = result?.data;
          
          if (fallbackData) {
            const code = fallbackData.resultCode ?? fallbackData.raw?.ResultCode;
            const message = fallbackData.resultDesc ?? fallbackData.raw?.ResultDesc;
            
            handleMpesaResultCode(code, message);
            
            if (fallbackData.status === 'SUCCESS' || fallbackData.status === 'FAILED' || fallbackData.status === 'PAID') {
              refetchPayment();
            }
          }
        } catch (err) {
          console.error('Fallback query failed:', err);
        }
      }, FALLBACK_TIMEOUT);
    }
  }, [clearPaymentTimers, handleMpesaResultCode, checkoutId, refetchMpesaStatus, refetchPayment]);
```

### `handleRetry`
Mutation handler to re-initiate payment and restart tracking.
```tsx
  const handleRetry = async () => {
    if (!invoiceId) return;
    setIsRetrying(true);
    try {
      const res = await payInvoice.mutateAsync({
        invoiceId,
        method: method === 'MPESA' ? 'mpesa_stk' : 'paystack_card',
        payerPhone,
        payerEmail
      });

      if (res?.success) {
        const newPaymentId = res.data?.paymentId;
        const newCheckoutId = res.data?.daraja?.checkoutRequestId;
        
        const params = new URLSearchParams(searchParams);
        if (newPaymentId) params.set('paymentId', newPaymentId);
        if (newCheckoutId) params.set('checkoutRequestId', newCheckoutId);
        navigate(`/payment-status?${params.toString()}`, { replace: true });
        
        setSocketStatus('PENDING');
        setSocketError(null);
        setIsFallbackActive(false);
        
        if (newPaymentId) {
          startTracking(newPaymentId, method);
        }
      }
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };
```

### `getStatusDisplay`
Reactive UI content generator based on current payment status.
```tsx
  const getStatusDisplay = () => {
    const status = currentStatus?.toUpperCase();
    
    if (status === 'SUCCESS' || status === 'PAID') {
      return {
        icon: <FiCheckCircle className="w-20 h-20 text-green-500 animate-bounce" />,
        title: 'Payment Successful!',
        message: 'Your order has been confirmed and is being processed.',
        color: 'text-green-600'
      };
    }
    
    if (status === 'FAILED' || status === 'CANCELLED') {
      return {
        icon: <FiXCircle className="w-20 h-20 text-red-500" />,
        title: 'Payment Failed',
        message: socketError || 'There was an issue processing your payment. Please try again.',
        color: 'text-red-600'
      };
    }
    
    return {
      icon: <FiLoader className="w-20 h-20 text-primary animate-spin" />,
      title: method === 'MPESA' ? 'Waiting for M-Pesa PIN...' : 'Processing Payment...',
      message: method === 'MPESA' ? 'Please check your phone for the M-Pesa STK prompt.' : 'Please wait while we confirm your transaction.',
      color: 'text-primary'
    };
  };
```

## Implementation Details
- **Responsive Design:** Items list uses `max-h-64` and `overflow-y-auto` with thin scrollbars for mobile/tablet friendliness.
- **Visual Polish:** Uses `bg-primary/5` and `border-primary/10` for metadata sections to emphasize key info.
- **Cleanup Effect:** Ensures all timers and sockets are destroyed on unmount or retry.

## Future Enhancements
- Visual progress timeline for the delivery process.
- Direct link to download invoice PDF on success.
- Haptic feedback or sound alerts on status change.
