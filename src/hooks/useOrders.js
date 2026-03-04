import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderAPI } from '../api'
import toast from 'react-hot-toast'

// Get all orders
export const useGetOrders = (params = {}) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: async () => {
            const res = await orderAPI.getOrders(params)
            const payload = res.data?.data || {}
            return {
                orders: payload.orders || [],
                pagination: payload.pagination || {}
            }
        },
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Get order by ID
export const useGetOrderById = (orderId) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const res = await orderAPI.getOrderById(orderId)
            return res.data?.data?.order
        },
        enabled: !!orderId,
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })
}

// Create order
export const useCreateOrder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload) => {
            const res = await orderAPI.createOrder(payload)
            return res.data?.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['cart'] })
        },
        onError: (error) => {
            console.error('Error creating order:', error)
            toast.error(error?.response?.data?.message || 'Failed to create order')
        }
    })
}

// Update order status
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ orderId, status }) => {
            await orderAPI.updateOrderStatus(orderId, status)
            return { orderId, status }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order', data.orderId] })
            toast.success('Order status updated')
        },
        onError: (error) => {
            console.error('Error updating order status:', error)
            toast.error('Failed to update status')
        }
    })
}

// Delete order
export const useDeleteOrder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (orderId) => {
            await orderAPI.deleteOrder(orderId)
            return orderId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            toast.success('Order deleted')
        },
        onError: (error) => {
            console.error('Error deleting order:', error)
            toast.error('Failed to delete order')
        }
    })
}
