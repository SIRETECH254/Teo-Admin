# Checkout Screen Documentation

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
import { cartAPI, orderAPI, paymentAPI } from '../api'
import { useGetActivePackagingPublic } from '../hooks/usePackaging'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FiEdit2, FiShoppingBag, FiClock, FiCreditCard, FiList } from 'react-icons/fi'
```

## Context and State Management
- **TanStack Query hooks:** `useGetActivePackagingPublic` for packaging options.
- **AuthContext:** Uses `useAuth` hook to access `user` object.
- **State management:** Local component state managed with `useState` hooks.
- **Multi-step form state:**
  - `currentStep`: Current step index (0-6)
  - `location`: 'in_shop' | 'away'
  - `orderType`: 'pickup' | 'delivery'
  - `timing`: `{ isScheduled: boolean, scheduledAt: string | null }`
  - `addressId`: Address ID for delivery orders
  - `paymentMode`: 'post_to_bill' | 'pay_now'
  - `paymentMethod`: 'mpesa_stk' | 'paystack_card' | 'cash' | null
  - `selectedPackagingId`: Selected packaging option ID
  - `payerPhone`: Phone number for M-Pesa payments
  - `payerEmail`: Email for Paystack payments
  - `orderId`: Created order ID
  - `invoiceId`: Created invoice ID
  - `coupon`: Applied coupon from localStorage
- **Loading states:** `loading` for cart loading, `creating` for order creation, `paying` for payment initiation.

**Step configuration:**
```javascript
const ALL_STEPS = [
  { key: 'location', label: 'Location' },
  { key: 'orderType', label: 'Order Type' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'timing', label: 'Timing' },
  { key: 'address', label: 'Address' },
  { key: 'payment', label: 'Payment' },
  { key: 'summary', label: 'Summary' },
]
```

**Conditional steps:**
- Address step is hidden for pickup orders (`orderType === 'pickup'`).
- Packaging step is shown only if packaging options are available.

## UI Structure
- **Screen shell:** Full-width container with max-width constraint (`max-w-4xl mx-auto`) and padding (`py-6`).
- **Progress indicators:** Progress bar and checkmarks row showing current step.
- **Step content:** Dynamic content based on `currentStep` and `currentStepKey`.
- **Navigation buttons:** Back and Next buttons for step navigation.
- **Order summary:** Displayed in summary step with itemized breakdown.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Checkout                                                    │
│  Step 1 of 7                                                 │
│  ─────────────────────────────────────────────────────────  │
│  [✓] [1] [2] [3] [4] [5] [6] [7]                           │
│                                                             │
│  Step Content (varies by step)                             │
│                                                             │
│  [← Back] [Next →]                                          │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Checkout                                                     │
│  Location                              Step 1 of 7            │
│  ───────────────────────────────────────────────────────────  │
│  [✓] [1] [2] [3] [4] [5] [6] [7]                            │
│                                                               │
│  Where are you ordering from?                                │
│                                                               │
│  [🏪 In Shop]  [🏠 Away]                                     │
│  Ordering while in the store  Ordering from home or office  │
│                                                               │
│  [← Back] [Next →]                                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Location Selection** (Step 0)
  ```javascript
  <button 
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
          location === 'in_shop' 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-gray-200 hover:border-gray-300'
      }`} 
      onClick={() => setLocation('in_shop')}
  >
      <div className="flex gap-x-5">
          <div className="text-2xl mb-2">🏪</div>
          <div className="flex flex-col items-start">
              <div className="font-medium">In Shop</div>
              <div className="text-sm text-gray-500">Ordering while in the store</div>
          </div>
      </div>
  </button>
  ```

- **Order Type Selection** (Step 1)
  ```javascript
  <button 
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
          orderType === 'pickup' 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-gray-200 hover:border-gray-300'
      }`} 
      onClick={() => setOrderType('pickup')}
  >
      <div className="flex gap-x-5">
          <div className="text-2xl mb-2">📦</div>
          <div className="flex flex-col items-start">
              <div className="font-medium">Pickup</div>
              <div className="text-sm text-gray-500">Collect from store</div>
          </div>
      </div>
  </button>
  ```

- **Packaging Selection** (Step 2, conditional)
  ```javascript
  <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${
      selectedPackagingId === opt._id 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-200 hover:border-gray-300'
  }`}>
      <div className="flex items-center gap-3">
          <input 
              type="radio" 
              name="packaging" 
              checked={selectedPackagingId === opt._id} 
              onChange={() => setSelectedPackagingId(opt._id)} 
          />
          <div>
              <div className="font-medium text-gray-900">
                  {opt.name} {opt.isDefault && <span className="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Default</span>}
              </div>
              <div className="text-sm text-gray-600">KES {Number(opt.price).toFixed(0)}</div>
          </div>
      </div>
  </label>
  ```

- **Timing Selection** (Step 3)
  ```javascript
  <div className="flex items-center gap-3">
      <input 
          type="radio" 
          id="now" 
          name="timing" 
          checked={!timing.isScheduled}
          onChange={() => setTiming({ isScheduled: false, scheduledAt: null })}
          className="w-4 h-4 text-primary"
      />
      <label htmlFor="now" className="flex-1">
          <div className="font-medium">Order now (30-45 mins)</div>
          <div className="text-sm text-gray-500">Ready for immediate pickup/delivery</div>
      </label>
  </div>
  {timing.isScheduled && (
      <input
          type="datetime-local"
          className="input w-full max-w-sm"
          value={timing.scheduledAt || ''}
          onChange={(e) => setTiming({ ...timing, scheduledAt: e.target.value })}
          min={new Date().toISOString().slice(0, 16)}
      />
  )}
  ```

- **Address Input** (Step 4, conditional - delivery only)
  ```javascript
  <input 
      className="input" 
      placeholder="Enter your delivery address" 
      value={addressId || ''} 
      onChange={(e) => setAddressId(e.target.value)} 
  />
  ```

- **Payment Method Selection** (Step 5)
  ```javascript
  <button 
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
          paymentMode === 'post_to_bill' 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-gray-200 hover:border-gray-300'
      }`} 
      onClick={() => setPaymentMode('post_to_bill')}
  >
      <div className="flex gap-x-5">
          <div className="text-2xl mb-2">📋</div>
          <div className="flex flex-col items-start">
              <div className="font-medium">Post to Bill</div>
              <div className="text-sm text-gray-500">Pay later</div>
          </div>
      </div>
  </button>
  ```

- **Payment Provider Selection** (when paymentMode === 'pay_now')
  ```javascript
  <button 
      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
          paymentMethod === 'mpesa_stk' 
              ? 'border-green-500 bg-green-50 text-green-700' 
              : 'border-gray-200 hover:border-gray-300'
      }`} 
      onClick={() => setPaymentMethod('mpesa_stk')}
  >
      M-Pesa STK Push
  </button>
  ```

- **Phone/Email Inputs** (for payment methods)
  ```javascript
  {paymentMethod === 'mpesa_stk' && (
      <input
          type="tel"
          placeholder="Phone number (e.g., 254712345678)"
          value={payerPhone}
          onChange={(e) => setPayerPhone(e.target.value)}
          className="input"
      />
  )}
  {paymentMethod === 'paystack_card' && (
      <input
          type="email"
          placeholder="Email address"
          value={payerEmail}
          onChange={(e) => setPayerEmail(e.target.value)}
          className="input"
      />
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via `cartAPI`, `orderAPI`, `paymentAPI`.
- **Get cart endpoint:** `GET /api/cart` (authenticated users only).
- **Create order endpoint:** `POST /api/orders` (authenticated users only).
- **Get order by ID endpoint:** `GET /api/orders/:id` (authenticated users only).
- **Pay invoice endpoint:** `POST /api/payments/pay-invoice` (authenticated users only).
- **Payload for create order:** `{ location, type, timing, addressId, paymentPreference: { mode, method }, packagingOptionId, couponCode, cartId, metadata }`.
- **Payload for pay invoice:** `{ invoiceId, method: 'mpesa_stk' | 'paystack_card', payerPhone | payerEmail }`.
- **Response contract:** Order creation returns `{ data: { orderId } }`, invoice fetch returns order with `invoiceId`.
- **Cart refresh:** After order creation, cart is refreshed to reflect cleared items.

## Components Used
- React + React Router DOM: `useNavigate`.
- AuthContext: `useAuth` hook.
- TanStack Query: `useQuery`.
- Form elements: `input`, `button`, `label`, `div`, `select`, `option`, `radio`.
- `react-icons/fi` for icons (FiEdit2, FiShoppingBag, FiClock, FiCreditCard, FiList).
- Custom components: `ProgressBar`, `CheckmarksRow`.
- Tailwind CSS classes for styling with custom classes (`.title3`, `.input`, `.btn-primary`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** "Loading..." message displayed while `loading` is true.
- **Empty cart protection:** Redirects to `/cart` if cart is empty.
- **API errors:** Handled in try-catch blocks, displayed via toast notifications.
- **Payment errors:** Errors during payment initiation are caught and displayed.

## Navigation Flow
- **Route:** `/checkout`.
- **Entry points:**
  - From cart page via "Proceed to Checkout" button.
  - Direct URL navigation (redirects to cart if empty).
- **Step navigation:**
  - Next button ➞ Advances to next step (validates current step if needed).
  - Back button ➞ Returns to previous step.
  - Step completion ➞ On final step, creates order and initiates payment if needed.
- **Payment flow:**
  - M-Pesa STK ➞ Navigates to `/payment-status` with payment parameters.
  - Paystack Card ➞ Opens payment URL in new tab, navigates to `/payment-status`.
  - Cash/Post-to-Bill ➞ Creates order, navigates to `/payment-status` with order info.
- **On completion:** Navigates to `/payment-status` with order and payment details.

## Functions Involved

- **`next`** — Advances to next step.
  ```javascript
  const next = () => {
      setCurrentStep((s) => Math.min(s + 1, activeSteps.length - 1))
  }
  ```

- **`back`** — Returns to previous step.
  ```javascript
  const back = () => {
      setCurrentStep((s) => Math.max(s - 1, 0))
  }
  ```

- **`gotoStep`** — Jumps to specific step by key.
  ```javascript
  const gotoStep = (key) => {
      const idx = activeSteps.findIndex((s) => s.key === key)
      if (idx >= 0) setCurrentStep(idx)
  }
  ```

- **`formatPhoneForMpesa`** — Formats phone number to M-Pesa format (254XXXXXXXXX).
  ```javascript
  const formatPhoneForMpesa = (phone) => {
      if (!phone) return ''
      const digits = phone.replace(/\D/g, '')
      if (digits.startsWith('0')) {
          return '254' + digits.substring(1)
      }
      if (digits.startsWith('254')) {
          return digits
      }
      if (digits.length === 9) {
          return '254' + digits
      }
      return digits
  }
  ```

- **`createOrder`** — Creates order via API.
  ```javascript
  const createOrder = async () => {
      try {
          setCreating(true)
          const payload = {
              location,
              type: orderType,
              timing,
              addressId: canShowAddress ? addressId : null,
              paymentPreference: {
                  mode: paymentMode,
                  method: paymentMode === 'pay_now' ? paymentMethod : null,
              },
              packagingOptionId: canShowPackaging ? selectedPackagingId : null,
              couponCode: coupon?.code || null,
              cartId: null,
              metadata: {},
          }
          const res = await orderAPI.createOrder(payload)
          const createdOrderId = res.data?.data?.orderId
          setOrderId(createdOrderId)
          
          const orderDetail = await orderAPI.getOrderById(createdOrderId)
          const inv = orderDetail.data?.data?.order?.invoiceId
          const createdInvoiceId = inv?._id || inv
          setInvoiceId(createdInvoiceId)
          
          // Refresh cart
          const cartRes = await cartAPI.getCart()
          setCart(cartRes.data?.data)
          
          // Clear applied coupon
          localStorage.removeItem('appliedCoupon')
          
          return { orderId: createdOrderId, invoiceId: createdInvoiceId }
      } catch (e) {
          toast.error(e?.response?.data?.message || 'Failed to create order')
          throw e
      } finally {
          setCreating(false)
      }
  }
  ```

- **`payInvoiceNow`** — Initiates payment for invoice.
  ```javascript
  const payInvoiceNow = async (explicitInvoiceId, explicitOrderId) => {
      const targetInvoiceId = explicitInvoiceId || invoiceId
      const targetOrderId = explicitOrderId || orderId
      if (!targetInvoiceId) return
      try {
          setPaying(true)
          if (paymentMethod === 'mpesa_stk') {
              if (!payerPhone) return toast.error('Phone required')
              const res = await paymentAPI.payInvoice({ 
                  invoiceId: targetInvoiceId, 
                  method: 'mpesa_stk', 
                  payerPhone 
              })
              const paymentId = res.data?.data?.paymentId
              const checkoutRequestId = res.data?.data?.daraja?.checkoutRequestId
              
              const params = new URLSearchParams({
                  method: 'mpesa',
                  paymentId,
                  orderId: targetOrderId,
                  provider: 'mpesa',
                  checkoutRequestId: checkoutRequestId || '',
                  invoiceId: targetInvoiceId,
                  payerPhone: payerPhone
              })
              navigate(`/payment-status?${params.toString()}`)
              toast.success('STK push sent. Complete on your phone.')
          } else if (paymentMethod === 'paystack_card') {
              if (!payerEmail) return toast.error('Email required')
              const res = await paymentAPI.payInvoice({ 
                  invoiceId: targetInvoiceId, 
                  method: 'paystack_card', 
                  payerEmail 
              })
              const paymentId = res.data?.data?.paymentId
              const reference = res.data?.data?.reference
              
              const params = new URLSearchParams({
                  method: 'paystack',
                  paymentId,
                  orderId: targetOrderId,
                  provider: 'paystack',
                  reference: reference || '',
                  invoiceId: targetInvoiceId,
                  payerEmail: payerEmail
              })
              navigate(`/payment-status?${params.toString()}`)
              
              const url = res.data?.data?.authorizationUrl
              if (url) window.open(url, '_blank')
          }
      } catch (e) {
          toast.error(e?.response?.data?.message || 'Failed to initiate payment')
      } finally {
          setPaying(false)
      }
  }
  ```

- **`handleCompleteOrder`** — Handles order completion and payment initiation.
  ```javascript
  const handleCompleteOrder = async () => {
      // Handle Cash and Post-to-Bill
      if (paymentMode === 'post_to_bill' || (paymentMode === 'pay_now' && paymentMethod === 'cash')) {
          try {
              setCreating(true)
              const payload = { /* ... order payload ... */ }
              
              // Save checkout data to localStorage for retry
              localStorage.setItem('checkoutData', JSON.stringify({
                  payload,
                  method: paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
              }))
              
              const res = await orderAPI.createOrder(payload)
              const createdOrderId = res.data?.data?.orderId
              const orderDetail = await orderAPI.getOrderById(createdOrderId)
              const inv = orderDetail.data?.data?.order?.invoiceId
              const createdInvoiceId = inv?._id || inv
              
              // Refresh cart and clear coupon
              const cartRes = await cartAPI.getCart()
              setCart(cartRes.data?.data)
              localStorage.removeItem('appliedCoupon')
              
              // Navigate to payment status
              const method = paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
              const params = new URLSearchParams({
                  method: method,
                  orderId: createdOrderId,
                  invoiceId: createdInvoiceId
              })
              navigate(`/payment-status?${params.toString()}`)
          } catch (error) {
              const params = new URLSearchParams({
                  method: paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash',
                  error: error?.response?.data?.message || 'Failed to create order'
              })
              navigate(`/payment-status?${params.toString()}`)
          } finally {
              setCreating(false)
          }
          return
      }
      
      // Handle M-Pesa and Paystack
      if (paymentMode === 'pay_now' && (paymentMethod === 'mpesa_stk' || paymentMethod === 'paystack_card')) {
          let ensuredOrderId = orderId
          let ensuredInvoiceId = invoiceId
          
          if (!ensuredOrderId || !ensuredInvoiceId) {
              const created = await createOrder()
              ensuredOrderId = created?.orderId
              ensuredInvoiceId = created?.invoiceId
          }
          
          await payInvoiceNow(ensuredInvoiceId, ensuredOrderId)
      }
  }
  ```

- **Cart loading effect** — Loads cart on mount.
  ```javascript
  useEffect(() => {
      const load = async () => {
          try {
              const res = await cartAPI.getCart()
              setCart(res.data?.data)
              const items = res.data?.data?.items || []
              if (!items || items.length === 0) {
                  localStorage.removeItem('appliedCoupon')
                  setCoupon(null)
              }
          } catch {
              toast.error('Failed to load cart')
          } finally {
              setLoading(false)
          }
      }
      load()
  }, [])
  ```

- **Cart protection effect** — Redirects to cart if empty.
  ```javascript
  useEffect(() => {
      if (cart && (!cart.items || cart.items.length === 0)) {
          navigate('/cart')
      }
  }, [cart, navigate])
  ```

- **User data prefill effect** — Prefills phone and email from user data.
  ```javascript
  useEffect(() => {
      if (user) {
          if (user.phone) {
              setPayerPhone(formatPhoneForMpesa(user.phone))
          }
          if (user.email) {
              setPayerEmail(user.email)
          }
      }
  }, [user])
  ```

- **Default packaging selection effect** — Auto-selects default packaging.
  ```javascript
  useEffect(() => {
      if (!canShowPackaging) return
      if (selectedPackagingId) return
      const def = packagingOptions.find((p) => p.isDefault) || packagingOptions[0]
      if (def) setSelectedPackagingId(def._id)
  }, [canShowPackaging, packagingOptions, selectedPackagingId])
  ```

- **Totals calculation** — Memoized calculation of order totals.
  ```javascript
  const totals = useMemo(() => {
      const items = cart?.items || []
      const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0)
      const packagingFee = canShowPackaging ? Number((packagingOptions.find(p => p._id === selectedPackagingId)?.price) || 0) : 0
      const discount = Math.min(subtotal, Math.max(0, Number(coupon?.discountAmount || 0)))
      const total = subtotal + packagingFee - discount
      return { subtotal, packagingFee, discount, total }
  }, [cart, canShowPackaging, packagingOptions, selectedPackagingId, coupon])
  ```

## Future Enhancements
- Add step validation before advancing.
- Add step-by-step progress saving.
- Add checkout data persistence for recovery.
- Add address autocomplete integration.
- Add saved addresses selection.
- Add order review/edit before completion.
- Add order confirmation email.
- Add order tracking integration.
- Add multiple payment method support.
- Add payment method saving.
- Add checkout analytics.
- Add A/B testing for checkout flow.
