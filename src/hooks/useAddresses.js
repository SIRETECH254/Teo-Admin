import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressAPI } from '../api'
import toast from 'react-hot-toast'

// Get all addresses
export const useGetAddresses = () => {
    return useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const res = await addressAPI.getUserAddresses()
            const list = res?.data?.data?.addresses || res?.data || []
            return list
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// Get default address
export const useGetDefaultAddress = () => {
    return useQuery({
        queryKey: ['addresses', 'default'],
        queryFn: async () => {
            const res = await addressAPI.getDefaultAddress()
            return res?.data?.data?.address || res?.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// Get address by ID
export const useGetAddressById = (addressId) => {
    return useQuery({
        queryKey: ['address', addressId],
        queryFn: async () => {
            const res = await addressAPI.getAddressById(addressId)
            return res?.data?.data?.address || res?.data
        },
        enabled: !!addressId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// Create address
export const useCreateAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (addressData) => {
            const res = await addressAPI.createAddress(addressData)
            return res?.data?.data?.address || res?.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['addresses', 'default'] })
            toast.success('Address added successfully!')
        },
        onError: (error) => {
            console.error('Error adding address:', error)
            toast.error('Failed to add address')
        }
    })
}

// Update address
export const useUpdateAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, addressData }) => {
            const res = await addressAPI.updateAddress(id, addressData)
            return res?.data?.data?.address || res?.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['address', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['addresses', 'default'] })
            toast.success('Address updated successfully!')
        },
        onError: (error) => {
            console.error('Error updating address:', error)
            toast.error('Failed to update address')
        }
    })
}

// Delete address
export const useDeleteAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id) => {
            await addressAPI.deleteAddress(id)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['addresses', 'default'] })
            toast.success('Address deleted successfully!')
        },
        onError: (error) => {
            console.error('Error deleting address:', error)
            toast.error('Failed to delete address')
        }
    })
}

// Set default address
export const useSetDefaultAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id) => {
            const res = await addressAPI.setDefaultAddress(id)
            return res?.data?.data?.address || res?.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['addresses', 'default'] })
            toast.success('Default address updated!')
        },
        onError: (error) => {
            console.error('Error setting default address:', error)
            toast.error('Failed to update default address')
        }
    })
}

// Admin: Get all addresses
export const useGetAllAddresses = (params = {}) => {
    return useQuery({
        queryKey: ['addresses', 'admin', params],
        queryFn: async () => {
            const res = await addressAPI.getAllAddresses(params)
            return res?.data
        },
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })
}
