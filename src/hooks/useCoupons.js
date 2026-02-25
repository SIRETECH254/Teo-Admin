import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponAPI } from '../api'
import toast from 'react-hot-toast'


// Get all coupons (admin only)
export const useGetAllCoupons = (params = {}) => {
    return useQuery({
        queryKey: ['coupons', 'all', params],
        queryFn: async () => {
            const response = await couponAPI.getAllCoupons(params)
            return response.data
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}


// Get coupon by ID
export const useGetCouponById = (couponId) => {
    return useQuery({
        queryKey: ['coupons', 'byId', couponId],
        queryFn: async () => {
            const response = await couponAPI.getCouponById(couponId)
            return response.data
        },
        enabled: !!couponId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}


// Get coupon statistics
export const useGetCouponStats = () => {
    return useQuery({
        queryKey: ['coupons', 'stats'],
        queryFn: async () => {
            const response = await couponAPI.getCouponStats()
            return response.data
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}


// Create coupon
export const useCreateCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (couponData) => {
            const response = await couponAPI.createCoupon(couponData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            toast.success('Coupon created successfully')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create coupon')
        }
    })
}


// Update coupon
export const useUpdateCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ couponId, couponData }) => {
            const response = await couponAPI.updateCoupon(couponId, couponData)
            return response.data
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            queryClient.invalidateQueries({ queryKey: ['coupons', 'byId', variables.couponId] })
            toast.success('Coupon updated successfully')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update coupon')
        }
    })
}


// Delete coupon
export const useDeleteCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (couponId) => {
            const response = await couponAPI.deleteCoupon(couponId)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            toast.success('Coupon deleted successfully')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete coupon')
        }
    })
}


// Validate coupon (public)
export const useValidateCoupon = () => {
    return useMutation({
        mutationFn: async (params) => {
            let response
            // Handle both object and array parameter formats
            if (Array.isArray(params)) {
                response = await couponAPI.validateCoupon(params[0], params[1])
            } else {
                response = await couponAPI.validateCoupon(params.code, params.orderAmount)
            }
            return response.data
        },
        onSuccess: (data) => {
            console.log('Coupon validation successful:', data)
            return data
        },
        onError: (error) => {
            console.error('Coupon validation error:', error)
            toast.error(error.response?.data?.message || 'Failed to validate coupon')
        }
    })
}


// Apply coupon to order
export const useApplyCoupon = () => {
    return useMutation({
        mutationFn: async ({ code, orderAmount }) => {
            const response = await couponAPI.applyCoupon(code, orderAmount)
            return response.data
        },
        onSuccess: () => {
            toast.success('Coupon applied successfully')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to apply coupon')
        }
    })
}


// Generate new coupon code
export const useGenerateNewCode = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (couponId) => {
            const response = await couponAPI.generateNewCode(couponId)
            return response.data
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coupons', 'byId', variables] })
            toast.success('New coupon code generated successfully')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to generate new code')
        }
    })
} 