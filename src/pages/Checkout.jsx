import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useGetActivePackagingPublic } from '../hooks/usePackaging'
import { useGetCart } from '../hooks/useCart'
import { useCreateOrder } from '../hooks/useOrders'
import { usePayInvoice } from '../hooks/usePayments'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  FiEdit2,
  FiShoppingBag,
  FiClock,
  FiCreditCard,
  FiList,
  FiCheckCircle,
  FiHome,
  FiMapPin,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiSmartphone,
  FiArrowLeft,
  FiArrowRight,
  FiInfo,
  FiCheck,
  FiLoader,
} from 'react-icons/fi'


const ALL_STEPS = [
  { key: 'location', label: 'Location' },
  { key: 'orderType', label: 'Order Type' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'timing', label: 'Timing' },
  { key: 'address', label: 'Address' },
  { key: 'payment', label: 'Payment' },
  { key: 'summary', label: 'Summary' },
]


const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  const { data: cartData, isLoading: loading } = useGetCart()
  const cart = cartData?.data
  const createOrderMutation = useCreateOrder()
  const payInvoice = usePayInvoice()
  const [creating, setCreating] = useState(false)
  const [paying, setPaying] = useState(false)

  // Form state
  const [location, setLocation] = useState('in_shop')
  const [orderType, setOrderType] = useState('pickup')
  const [timing, setTiming] = useState({ isScheduled: false, scheduledAt: null })
  const [addressId, setAddressId] = useState(null)
  const [paymentMode, setPaymentMode] = useState('post_to_bill')
  const [paymentMethod, setPaymentMethod] = useState(null) // mpesa_stk | paystack_card | null
  // Coupon: load from localStorage if set by Cart page
  const [coupon, setCoupon] = useState(() => {
    try {
      const raw = localStorage.getItem('appliedCoupon')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  // Format phone number to M-Pesa format (254XXXXXXXXX)
  const formatPhoneForMpesa = (phone) => {
    if (!phone) return ''
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '')
    // If it starts with 0, replace with 254
    if (digits.startsWith('0')) {
      return '254' + digits.substring(1)
    }
    // If it starts with 254, return as is
    if (digits.startsWith('254')) {
      return digits
    }
    // If it's 9 digits, add 254 prefix
    if (digits.length === 9) {
      return '254' + digits
    }
    // Return as is if it doesn't match expected patterns
    return digits
  }

    const [payerPhone, setPayerPhone] = useState('')
    const [payerEmail, setPayerEmail] = useState('')
  
    const [orderId, setOrderId] = useState(null)
    const [invoiceId, setInvoiceId] = useState(null)
  
    const canShowAddress = orderType === 'delivery'
    const { data: packagingPublic } = useGetActivePackagingPublic()
    
    // Memoize packaging options to stabilize dependencies
    const packagingOptions = useMemo(() => 
      packagingPublic?.data?.data?.packaging || packagingPublic?.data?.packaging || [],
      [packagingPublic]
    )
    
    const canShowPackaging = (packagingOptions || []).length > 0
  
    const [selectedPackagingId, setSelectedPackagingId] = useState(null)
  
    // Clear coupon if cart is empty
    useEffect(() => {
      const items = cart?.items || []
      if (!items || items.length === 0) {
        try { localStorage.removeItem('appliedCoupon') } catch (err) { console.error('Storage error:', err) }
        setCoupon(null)
      }
    }, [cart])

  // Cart protection - redirect to cart if empty
  // useEffect(() => {
  //   if (cart && (!cart.items || cart.items.length === 0)) {
  //     //toast.error('Your cart is empty')
  //     navigate('/cart')
  //   }
  // }, [cart, navigate])

  // Prefill user phone and email
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

  // Auto-select default packaging when available
  useEffect(() => {
    if (!canShowPackaging) return
    if (selectedPackagingId) return
    const def = packagingOptions.find((p) => p.isDefault) || packagingOptions[0]
    if (def) setSelectedPackagingId(def._id)
  }, [canShowPackaging, packagingOptions, selectedPackagingId])

  const totals = useMemo(() => {
    const items = cart?.items || []
    const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0)
    const packagingFee = canShowPackaging ? Number((packagingOptions.find(p => p._id === selectedPackagingId)?.price) || 0) : 0
    const discount = Math.min(subtotal, Math.max(0, Number(coupon?.discountAmount || 0)))
    const total = subtotal + packagingFee - discount
    return { subtotal, packagingFee, discount, total }
  }, [cart, canShowPackaging, packagingOptions, selectedPackagingId, coupon])

  const formatVariantOptions = (variantOptions) => {
    if (!variantOptions || Object.keys(variantOptions).length === 0) return null
    return Object.entries(variantOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
  }

  const gotoStep = (key) => {
    const idx = activeSteps.findIndex((s) => s.key === key)
    if (idx >= 0) setCurrentStep(idx)
  }

  const activeSteps = useMemo(() => {
    const isPickup = orderType === 'pickup'
    if (isPickup) {
      return ALL_STEPS.filter((s) => s.key !== 'address')
    }
    return ALL_STEPS
  }, [orderType])

  const currentStepKey = activeSteps[currentStep]?.key

  /**
   * Render Step Indicator Header - Same approach as AddProduct page
   */
  const renderStepHeader = () => {
    const progress = ((currentStep + 1) / activeSteps.length) * 100
    
    return (
      <div className="space-y-4 p-3">
        <div className="flex-row items-center justify-between flex">
          {/* current step & label */}
          <div className="flex-row items-center gap-x-2 flex">
            <div className="h-5 w-5 rounded-full items-center justify-center bg-primary text-white text-xs font-bold flex">
              {currentStep + 1}
            </div>
            <span className="text-sm font-semibold text-primary">
              {activeSteps[currentStep]?.label}
            </span>
          </div>
       
          {/* Step numbers and labels */}
          <div className="flex-row items-center gap-x-2 md:gap-x-4 lg:gap-x-6 flex">
            {activeSteps.map((step, index) => {
              const stepNumber = index + 1
              const isActive = index === currentStep
              const isCompleted = currentStep > index
              
              return (
                <button
                  key={step.key}
                  onClick={() => setCurrentStep(index)}
                  className="flex-1 items-center flex flex-col"
                  type="button"
                >
                  <div className="items-center flex flex-col">
                    {/* Step number circle */}
                    <div className={`h-6 w-6 rounded-full items-center justify-center flex ${
                      isActive 
                        ? 'bg-primary' 
                        : isCompleted 
                          ? 'bg-primary/30' 
                          : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className={`text-base font-bold ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}>
                          {stepNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }


  const next = () => {
    setCurrentStep((s) => Math.min(s + 1, activeSteps.length - 1))
  }


  const back = () => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  useEffect(() => {
    if (currentStep >= activeSteps.length) {
      setCurrentStep(Math.max(0, activeSteps.length - 1))
    }
  }, [activeSteps, currentStep])

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

      const res = await createOrderMutation.mutateAsync(payload)
      const createdOrderId = res?.orderId
      const createdInvoiceId = res?.invoiceId
      
      setOrderId(createdOrderId)
      setInvoiceId(createdInvoiceId)
      
      // Clear applied coupon from localStorage
      try {
        localStorage.removeItem('appliedCoupon')
      } catch (e) {
        console.warn('Failed to clear applied coupon:', e)
      }
      
      return { orderId: createdOrderId, invoiceId: createdInvoiceId }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create order')
      throw e
    } finally {
      setCreating(false)
    }
  }

  const payInvoiceNow = async (explicitInvoiceId, explicitOrderId) => {
    const targetInvoiceId = explicitInvoiceId || invoiceId
    const targetOrderId = explicitOrderId || orderId
    if (!targetInvoiceId) return
    try {
      setPaying(true)
      if (paymentMethod === 'mpesa_stk') {
        if (!payerPhone) return toast.error('Phone required')
        const res = await payInvoice.mutateAsync({ invoiceId: targetInvoiceId, method: 'mpesa_stk', payerPhone })
        if (res?.success) {
          const paymentId = res?.data?.paymentId
          const checkoutRequestId = res?.data?.daraja?.checkoutRequestId
          
          // Navigate to payment status page with method parameter
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
        }
      } else if (paymentMethod === 'paystack_card') {
        if (!payerEmail) return toast.error('Email required')
        const res = await payInvoice.mutateAsync({ invoiceId: targetInvoiceId, method: 'paystack_card', payerEmail })
        const paymentId = res?.data?.paymentId
        const reference = res?.data?.reference
        
        // Navigate to payment status page with method parameter
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
        
        const url = res?.data?.authorizationUrl
        if (url) window.open(url, '_blank')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to initiate payment')
      throw e // Re-throw to handle in handleCompleteOrder
    } finally {
      setPaying(false)
    }
  }


  const handleCompleteOrder = async () => {
    // Handle Cash and Post-to-Bill (order creation with instant navigation)
    if (paymentMode === 'post_to_bill' || (paymentMode === 'pay_now' && paymentMethod === 'cash')) {
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

        // Save checkout data to localStorage for retry functionality
        try {
          localStorage.setItem('checkoutData', JSON.stringify({
            payload,
            method: paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
          }))
        } catch (e) {
          console.warn('Failed to save checkout data:', e)
        }

        const res = await createOrderMutation.mutateAsync(payload)
        const createdOrderId = res?.orderId
        const createdInvoiceId = res?.invoiceId
        
        // Clear applied coupon from localStorage
        try {
          localStorage.removeItem('appliedCoupon')
        } catch (e) {
          console.warn('Failed to clear applied coupon:', e)
        }
        
        // Navigate to payment status with method parameter
        const method = paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
        const params = new URLSearchParams({
          method: method,
          orderId: createdOrderId,
          invoiceId: createdInvoiceId
        })
        navigate(`/payment-status?${params.toString()}`)
        
      } catch (error) {
        // Order creation failed - navigate to payment status with error indication
        const method = paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
        const params = new URLSearchParams({
          method: method,
          error: error?.response?.data?.message || 'Failed to create order'
        })
        navigate(`/payment-status?${params.toString()}`)
      } finally {
        setCreating(false)
      }
      return
    }

    // Handle M-Pesa and Paystack (order creation first, then payment initiation)
    if (paymentMode === 'pay_now' && (paymentMethod === 'mpesa_stk' || paymentMethod === 'paystack_card')) {
      let ensuredOrderId = orderId
      let ensuredInvoiceId = invoiceId

      try {
        if (!ensuredOrderId || !ensuredInvoiceId) {
          const created = await createOrder()
          ensuredOrderId = created?.orderId
          ensuredInvoiceId = created?.invoiceId
        }

        console.log('✅ handleCompleteOrder - Order IDs:', { ensuredOrderId, ensuredInvoiceId })

        // Initiate payment
        await payInvoiceNow(ensuredInvoiceId, ensuredOrderId)
      } catch (error) {
        console.error('Checkout failed:', error)
        // If order was created but payment failed, go to order details page
        if (ensuredOrderId) {
          navigate(`/orders/${ensuredOrderId}`)
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto">
        {/* Title and Step indicator */}
        <div className="flex flex-row items-center justify-between mb-6">
          <h1 className="title3">Checkout</h1>
          <span className="text-sm font-semibold text-primary mt-2 sm:mt-0">
            Step {currentStep + 1} of {activeSteps.length}
          </span>
        </div>
        
        {/* Step Header - Same approach as AddProduct page */}
        <div className="mb-6">
          {renderStepHeader()}
        </div>

        {/* Step content */}
        <div className="">
          {/* STEP 0: Location */}
          {currentStepKey === 'location' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Where are you ordering from?</h3>
              <div className="flex flex-col gap-3">
                <button 
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    location === 'in_shop' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setLocation('in_shop')}
                >
                  {location === 'in_shop' && (
                    <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
                  <div className="flex gap-x-4">
                    <div className={`text-2xl mb-2 ${location === 'in_shop' ? 'text-primary' : 'text-gray-500'}`}>
                      <FiMapPin />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">In Shop</div>
                      <div className="text-sm text-gray-500">
                        Ordering while you are inside the store
                      </div>
                    </div>
                  </div>
                </button>
                <button 
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    location === 'away' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setLocation('away')}
                >
                  {location === 'away' && (
                    <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
                  <div className="flex gap-x-4">
                    <div className={`text-2xl mb-2 ${location === 'away' ? 'text-primary' : 'text-gray-500'}`}>
                      <FiHome />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">Away</div>
                      <div className="text-sm text-gray-500">
                        Ordering from home, office, or another location
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Order Type */}
          {currentStepKey === 'orderType' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">How would you like to receive your order?</h3>
              <div className="flex flex-col gap-3">
                <button 
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    orderType === 'pickup' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setOrderType('pickup')}
                >
                  {orderType === 'pickup' && (
                    <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
                  <div className="flex gap-x-4">
                    <div className={`text-2xl mb-2 ${orderType === 'pickup' ? 'text-primary' : 'text-gray-500'}`}>
                      <FiPackage />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-gray-500">Collect your order from the store</div>
                    </div>
                  </div>
                </button>
                <button 
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    orderType === 'delivery' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setOrderType('delivery')}
                >
                  {orderType === 'delivery' && (
                    <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
                  <div className="flex gap-x-4">
                    <div className={`text-2xl mb-2 ${orderType === 'delivery' ? 'text-primary' : 'text-gray-500'}`}>
                      <FiTruck />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">Delivery</div>
                      <div className="text-sm text-gray-500">Have your order delivered to you</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Packaging */}
          {currentStepKey === 'packaging' && canShowPackaging && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Packaging Options</h3>
              <div className="space-y-3">
                {packagingOptions.map((opt) => (
                  <label key={opt._id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${selectedPackagingId === opt._id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="packaging" checked={selectedPackagingId === opt._id} onChange={() => setSelectedPackagingId(opt._id)} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {opt.name} {opt.isDefault && <span className="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Default</span>}
                        </div>
                        <div className="text-sm text-gray-600">KES {Number(opt.price).toFixed(0)}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Timing */}
          {currentStepKey === 'timing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">When would you like your order?</h3>
              <div className="space-y-4">
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
                
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="schedule" 
                    name="timing" 
                    checked={timing.isScheduled}
                    onChange={() => setTiming({ isScheduled: true, scheduledAt: new Date().toISOString().slice(0, 16) })}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="schedule" className="flex-1">
                    <div className="font-medium">Schedule for later</div>
                    <div className="text-sm text-gray-500">Choose a specific date and time</div>
                </label>
                </div>

                {timing.isScheduled && (
                  <div className="ml-7">
                  <input
                    type="datetime-local"
                      className="input w-full max-w-sm"
                      value={timing.scheduledAt || ''}
                    onChange={(e) => setTiming({ ...timing, scheduledAt: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                  />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Address */}
          {currentStepKey === 'address' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
              {canShowAddress ? (
                <div className="space-y-3">
                  <input 
                    className="input" 
                    placeholder="Enter your delivery address" 
                    value={addressId || ''} 
                    onChange={(e) => setAddressId(e.target.value)} 
                  />
                  <p className="text-sm text-gray-500">Enter the full address where you'd like your order delivered.</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiInfo className="w-5 h-5" />
                    <span className="font-medium">Pickup Selected</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">No delivery address required for pickup orders.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Payment */}
          {currentStepKey === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment Method</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <button 
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      paymentMode === 'post_to_bill' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`} 
                    onClick={() => setPaymentMode('post_to_bill')}
                  >
                    {paymentMode === 'post_to_bill' && (
                      <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-primary" />
                    )}
                    <div className="flex gap-x-4">
                      <div className={`text-2xl mb-2 ${paymentMode === 'post_to_bill' ? 'text-primary' : 'text-gray-500'}`}>
                        <FiList />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="font-medium">Post to Bill</div>
                        <div className="text-sm text-gray-500">Add to your bill and pay later</div>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      paymentMode === 'pay_now' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`} 
                    onClick={() => setPaymentMode('pay_now')}
                  >
                    {paymentMode === 'pay_now' && (
                      <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-primary" />
                    )}
                    <div className="flex gap-x-4">
                      <div className={`text-2xl mb-2 ${paymentMode === 'pay_now' ? 'text-primary' : 'text-gray-500'}`}>
                        <FiCreditCard />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="font-medium">Pay Now</div>
                        <div className="text-sm text-gray-500">Complete payment immediately</div>
                      </div>
                    </div>
                  </button>
                </div>

                {paymentMode === 'pay_now' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3">Choose Payment Method</h4>
                    <div className="space-y-3">
                      <button 
                        className={`relative w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === 'cash' 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setPaymentMethod('cash')}
                      >
                        {paymentMethod === 'cash' && (
                          <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-green-600" />
                        )}
                        <div className="flex gap-x-4">
                          <div className={`text-2xl mb-2 ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-500'}`}>
                            <FiDollarSign />
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="font-medium">Cash</div>
                            <div className="text-sm text-gray-500">Pay cash on delivery or pickup</div>
                          </div>
                        </div>
                        {paymentMethod === 'cash' && (
                          <div className="mt-3 text-sm text-gray-600">
                            You&apos;ll pay the rider or cashier when you receive your order.
                          </div>
                        )}
                      </button>
                      
                      <button 
                        className={`relative w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === 'mpesa_stk' 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setPaymentMethod('mpesa_stk')}
                      >
                        {paymentMethod === 'mpesa_stk' && (
                          <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-green-600" />
                        )}
                        <div className="flex gap-x-4">
                          <div className={`text-2xl mb-2 ${paymentMethod === 'mpesa_stk' ? 'text-green-600' : 'text-gray-500'}`}>
                            <FiSmartphone />
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="font-medium">M-Pesa STK</div>
                            <div className="text-sm text-gray-500">Prompt sent to your phone</div>
                          </div>
                        </div>
                        {paymentMethod === 'mpesa_stk' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input 
                              className="input w-full max-w-sm" 
                              placeholder="2547XXXXXXXX" 
                              value={payerPhone} 
                              onChange={(e) => setPayerPhone(e.target.value)} 
                            />
                          </div>
                        )}
                      </button>
                      
                      <button 
                        className={`relative w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === 'paystack_card' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setPaymentMethod('paystack_card')}
                      >
                        {paymentMethod === 'paystack_card' && (
                          <FiCheckCircle className="absolute top-3 right-3 h-4 w-4 text-blue-600" />
                        )}
                        <div className="flex gap-x-4">
                          <div className={`text-2xl mb-2 ${paymentMethod === 'paystack_card' ? 'text-blue-600' : 'text-gray-500'}`}>
                            <FiCreditCard />
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="font-medium">Card</div>
                            <div className="text-sm text-gray-500">Secure online card payment</div>
                          </div>
                        </div>
                        {paymentMethod === 'paystack_card' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input 
                              className="input w-full max-w-sm" 
                              placeholder="email@example.com" 
                              value={payerEmail} 
                              onChange={(e) => setPayerEmail(e.target.value)} 
                            />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: Summary */}
          {currentStepKey === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FiList className="text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
              </div>

              {/* Order Items (no edit) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiList className="text-primary" /> Order Items
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {(cart?.items || []).map((it) => (
                    <div key={it._id} className="flex items-start justify-between text-sm">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{it.productId?.title || 'Product'}</div>
                        {formatVariantOptions(it.variantOptions) && (
                          <div className="text-gray-500">{formatVariantOptions(it.variantOptions)}</div>
                        )}
                        <div className="text-gray-500">Qty: {it.quantity}</div>
                      </div>
                      <div className="font-medium text-gray-900">KES {(it.price * it.quantity).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiShoppingBag className="text-primary" /> Fulfillment
                    </span>
                  </div>
                  <button onClick={() => gotoStep('orderType')} className="text-gray-400 hover:text-gray-600">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {orderType === 'delivery' ? (
                    <FiTruck className="text-primary h-4 w-4" />
                  ) : (
                    <FiPackage className="text-primary h-4 w-4" />
                  )}
                  <span>
                    Method:{' '}
                    <span className="font-medium capitalize">{orderType}</span>
                  </span>
                </div>
              </div>

              {/* Timing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiClock className="text-primary" /> Timing
                    </span>
                  </div>
                  <button onClick={() => gotoStep('timing')} className="text-gray-400 hover:text-gray-600">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiClock className="h-4 w-4 text-primary" />
                  <span>
                    When:{' '}
                    <span className="font-medium">
                      {timing.isScheduled
                        ? `Scheduled for ${new Date(timing.scheduledAt).toLocaleString()}`
                        : 'Order now (30-45 mins)'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Packaging (editable shortcut) */}
              {canShowPackaging && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      
                      <span className="font-medium text-gray-800 flex items-center gap-2">
                        <FiPackage className="text-primary" /> Packaging
                      </span>
                    </div>
                    <button onClick={() => gotoStep('packaging')} className="text-gray-400 hover:text-gray-600">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPackage className="h-4 w-4 text-primary" />
                    <span>
                      Selected:{' '}
                      <span className="font-medium">
                        {packagingOptions.find(p => p._id === selectedPackagingId)?.name || 'Standard'}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiCreditCard className="text-primary" /> Payment Method
                    </span>
                  </div>
                  <button onClick={() => gotoStep('payment')} className="text-gray-400 hover:text-gray-600">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCreditCard className="h-4 w-4 text-primary" />
                  <span>
                    Method:{' '}
                    <span className="font-medium capitalize">
                      {paymentMode === 'post_to_bill'
                        ? 'Post to Bill'
                        : paymentMode === 'pay_now'
                          ? paymentMethod === 'cash'
                            ? 'Cash'
                            : paymentMethod === 'mpesa_stk'
                              ? 'M-Pesa'
                              : paymentMethod === 'paystack_card'
                                ? 'Card'
                                : 'Not selected'
                          : 'Not selected'}
                    </span>
                  </span>
                </div>
                {paymentMode === 'pay_now' && paymentMethod === 'mpesa_stk' && payerPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <FiSmartphone className="h-4 w-4 text-primary" />
                    <span>
                      Phone: <span className="font-medium">{payerPhone}</span>
                    </span>
                  </div>
                )}
                {paymentMode === 'pay_now' && paymentMethod === 'paystack_card' && payerEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <FiMail className="h-4 w-4 text-primary" />
                    <span>
                      Email: <span className="font-medium">{payerEmail}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="text-primary" />
                      <span className="font-medium text-gray-800">Price Breakdown</span>
                    </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <FiList className="h-3 w-3 text-gray-500" /> Subtotal:
                    </span>
                    <span className="font-medium">KES {totals.subtotal.toFixed(0)}</span>
                  </div>
                  <hr className="my-2" />
                  {canShowPackaging && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <FiPackage className="h-3 w-3 text-gray-500" /> Packaging:
                      </span>
                      <span className="font-medium">KES {Number(totals.packagingFee || 0).toFixed(0)}</span>
                    </div>
                  )}
                  {coupon?.code && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span className="flex items-center gap-1">
                        <FiTag className="h-3 w-3" /> Coupon ({coupon.code}):
                      </span>
                      <span>- KES {Number(totals.discount || 0).toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold mt-2">
                    <span className="flex items-center gap-1">
                      <FiDollarSign className="h-4 w-4 text-primary" /> Total:
                    </span>
                    <span>KES {totals.total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-10">
          <button 
            className="btn-outline flex items-center gap-2" 
            onClick={() => currentStep === 0 ? navigate('/cart') : back()}
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < activeSteps.length - 1 ? (
            <button 
              className="btn-primary flex items-center gap-2" 
              onClick={next}
            >
              Next
              <FiArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              className="btn-primary flex items-center gap-2" 
              onClick={handleCompleteOrder} 
              disabled={creating || paying || createOrderMutation.isPending || payInvoice.isPending}
            >
              {creating || paying || createOrderMutation.isPending || payInvoice.isPending ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Complete Order
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default Checkout




