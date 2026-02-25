import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartAPI } from '../api'
import toast from 'react-hot-toast'

// Get user's cart
export const useGetCart = () => {
    return useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const response = await cartAPI.getCart()
            return response.data
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Add item to cart
export const useAddToCart = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (item) => {
            const response = await cartAPI.addToCart(item)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Item added to cart successfully')
            return data
        },
        onError: (error) => {
            console.error('Error adding to cart:', error)
            toast.error(error.response?.data?.message || 'Failed to add item to cart')
        }
    })
}

// Update cart item quantity
export const useUpdateCartItem = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ skuId, quantity }) => {
            const response = await cartAPI.updateCartItem(skuId, quantity)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Cart updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Error updating cart item:', error)
            toast.error(error.response?.data?.message || 'Failed to update cart item')
        }
    })
}

// Remove item from cart
export const useRemoveFromCart = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (skuId) => {
            const response = await cartAPI.removeFromCart(skuId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Item removed from cart successfully')
            return data
        },
        onError: (error) => {
            console.error('Error removing from cart:', error)
            toast.error(error.response?.data?.message || 'Failed to remove item from cart')
        }
    })
}

// Clear cart
export const useClearCart = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await cartAPI.clearCart()
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Cart cleared successfully')
            return data
        },
        onError: (error) => {
            console.error('Error clearing cart:', error)
            toast.error(error.response?.data?.message || 'Failed to clear cart')
        }
    })
}

// Validate cart
export const useValidateCart = () => {
    return useQuery({
        queryKey: ['cart', 'validate'],
        queryFn: async () => {
            const response = await cartAPI.validateCart()
            return response.data
        },
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
} 