import { useMutation, useQuery } from '@tanstack/react-query'
import { paymentAPI } from '../api'
import toast from 'react-hot-toast'

// Pay invoice
export const usePayInvoice = () => {
    return useMutation({
        mutationFn: async (data) => {
            const res = await paymentAPI.payInvoice(data)
            return res.data
        },
        onError: (error) => {
            console.error('Error paying invoice:', error)
            toast.error(error?.response?.data?.message || 'Failed to initiate payment')
        }
    })
}

// Get payment by ID
export const useGetPaymentById = (paymentId) => {
    return useQuery({
        queryKey: ['payment', paymentId],
        queryFn: async () => {
            const res = await paymentAPI.getPaymentById(paymentId)
            return res.data
        },
        enabled: !!paymentId,
        staleTime: 30 * 1000, // 30 seconds
    })
}

// Query M-Pesa status by checkout request ID
export const useQueryMpesaByCheckoutId = (checkoutRequestId) => {
    return useQuery({
        queryKey: ['mpesa-status', checkoutRequestId],
        queryFn: async () => {
            const res = await paymentAPI.queryMpesaByCheckoutId(checkoutRequestId)
            return res.data?.data || {}
        },
        enabled: !!checkoutRequestId,
        staleTime: 10 * 1000, // 10 seconds
        retry: false,
    })
}
