import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft, FiPackage, FiUser, FiCreditCard } from 'react-icons/fi';
import { useGetPaymentById, useQueryMpesaByCheckoutId, usePayInvoice } from '../hooks/usePayments';
import { useGetOrderById } from '../hooks/useOrders';

const FALLBACK_TIMEOUT = 60000; // 60 seconds

const PaymentStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract params from URL
  const paymentId = searchParams.get('paymentId');
  const checkoutId = searchParams.get('checkoutRequestId') || searchParams.get('checkoutId');
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method')?.toUpperCase() || 'MPESA';
  const invoiceId = searchParams.get('invoiceId');
  const payerPhone = searchParams.get('payerPhone');
  const payerEmail = searchParams.get('payerEmail');

  // TanStack Queries
  const { data: paymentData, isLoading: isLoadingPayment, refetch: refetchPayment } = useGetPaymentById(paymentId);
  const { data: orderData, isLoading: isLoadingOrder } = useGetOrderById(orderId);
  const { refetch: refetchMpesaStatus } = useQueryMpesaByCheckoutId(checkoutId, { enabled: false });
  const payInvoice = usePayInvoice();

  // Local State
  const [socketStatus, setSocketStatus] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const timeoutRef = useRef(null);

  // Derived Status
  const currentStatus = useMemo(() => {
    if (socketStatus) return socketStatus;
    if (paymentData?.status) return paymentData.status;
    return 'PENDING';
  }, [socketStatus, paymentData?.status]);

  /**
   * Cleanup function for sockets and timeouts
   */
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

  /**
   * Maps Daraja result codes to UI states
   */
  const handleMpesaResultCode = useCallback((resultCode, resultMessage) => {
    clearPaymentTimers();
    
    // Explicitly convert to number and handle null/undefined/string/number
   // Ensure we handle string codes from API (e.g., "0")
   const code = resultCode === 'string' ? parseInt(resultCode, 10) : resultCode;

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

  /**
   * Initializes websocket connection and event listeners
   */
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
      console.log('callback.received', payload);
      handleMpesaResultCode(payload.code, payload.message);

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
            // Priority: payload.resultCode -> payload.raw.ResultCode -> fallback to existing logic
            const code = fallbackData.resultCode ?? fallbackData.raw?.ResultCode;
            const message = fallbackData.resultDesc ?? fallbackData.raw?.ResultDesc;
            
            handleMpesaResultCode(code, message);
            
          }
        } catch (err) {
          console.error('Fallback query failed:', err);
        }
      }, FALLBACK_TIMEOUT);
    }
  }, [clearPaymentTimers, handleMpesaResultCode, checkoutId, refetchMpesaStatus]);

  // Initial setup
  useEffect(() => {
    if (paymentId) {
      startTracking(paymentId, method);
    }
    return () => clearPaymentTimers();
  }, [paymentId, method, startTracking, clearPaymentTimers]);

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
        
        // Update URL and state
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

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-light  p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl py-8 px-4 text-center border border-gray-100">
        
        {/* Status Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6">
            {statusDisplay.icon}
          </div>
          <h1 className={`title2 ${statusDisplay.color}`}>
            {statusDisplay.title}
          </h1>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            {statusDisplay.message}
          </p>
        </div>

        {/* Payment Details Section */}
        {orderData && (
          <div className="space-y-6 mb-8 text-left">
            {/* Order Items Section */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiPackage className="text-primary" /> Items Purchased
              </h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {(orderData.items || []).map((it, idx) => {
                  const productImage = it?.productId?.primaryImage || it?.productId?.images?.find(img => img?.isPrimary)?.url || it?.productId?.images?.[0]?.url;
                  const variantEntries = (() => {
                    if (!it?.variantOptions) return [];
                    return Object.entries(it.variantOptions || {});
                  })();
                  const variantText = variantEntries.length > 0 ? variantEntries.map(([k, v]) => `${k}: ${v}`).join(', ') : null;

                  return (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="h-14 w-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <img src={productImage} alt={it.title} className="h-full w-full object-cover" />
                        ) : (
                          <FiPackage className="h-6 w-6 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-start sm:flex-row sm:justify-between gap-2">

                        <div className="">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{it.title}</h4>
                          {variantText && (
                            <p className="text-gray-500 text-xs truncate">{variantText}</p>
                          )}
                          <p className="text-primary font-bold text-xs mt-1">
                            Qty: {it.quantity} × KSh {(it.unitPrice || 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">
                            KSh {((it.unitPrice || 0) * it.quantity).toLocaleString()}
                          </p>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Breakdown Section */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Payment Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">KSh {orderData.pricing?.subtotal?.toLocaleString()}</span>
                </div>
                {(orderData.pricing?.discounts || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600">Discounts</span>
                    <span className="font-medium text-green-600">- KSh {orderData.pricing?.discounts?.toLocaleString()}</span>
                  </div>
                )}
                {(orderData.pricing?.deliveryFee || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-gray-900">KSh {orderData.pricing?.deliveryFee?.toLocaleString()}</span>
                  </div>
                )}
                {(orderData.pricing?.packagingFee || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Packaging Fee</span>
                    <span className="font-medium text-gray-900">KSh {orderData.pricing?.packagingFee?.toLocaleString()}</span>
                  </div>
                )}
                {(orderData.pricing?.tax || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">KSh {orderData.pricing?.tax?.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className="text-xl font-black text-primary">KSh {orderData.pricing?.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Metadata Section */}
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Order Ref</p>
                  <p className="text-sm font-bold text-gray-900">#{orderId?.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                    {method}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Fulfillment</p>
                  <p className="text-xs font-semibold text-gray-700 capitalize">{orderData.type || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-xs font-semibold text-gray-700">{orderData.location === 'in_shop' ? 'In Shop' : 'Away'}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Real-time Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span className="text-gray-500">{socketConnected ? 'Live Connection Active' : 'Connecting...'}</span>
          </div>
          {isFallbackActive && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <FiLoader className="animate-spin" />
              <span>Running Fallback Check</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {(currentStatus === 'SUCCESS' || currentStatus === 'PAID') ? (
            <button 
              onClick={() => navigate('/orders')} 
              className="btn-primary w-full py-4 text-lg"
            >
              View My Orders
            </button>
          ) : (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') ? (
            <>
              <button 
                onClick={handleRetry} 
                disabled={isRetrying || payInvoice.isPending}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {(isRetrying || payInvoice.isPending) ? <FiLoader className="animate-spin" /> : 'Retry Payment'}
              </button>
              <button 
                onClick={() => navigate(`/orders/${orderId}`)} 
                className="btn-outline w-full py-4"
              >
                View Order Details
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate(`/orders/${orderId}`)} 
              className="btn-secondary w-full py-4"
            >
              View Order Details
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentStatus;
