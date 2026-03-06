import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { storeConfigAPI } from '../api'
import toast from 'react-hot-toast'

// Get store configuration
export const useGetStoreConfig = () => {
    return useQuery({
        queryKey: ['storeConfig'],
        queryFn: async () => {
            const response = await storeConfigAPI.getStoreConfig()
            // Backend returns: { success: true, data: { config: {...} } }
            // Return the inner data object for easier access
            return response.data?.data || response.data
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Get store configuration status
export const useGetStoreConfigStatus = () => {
    return useQuery({
        queryKey: ['storeConfig', 'status'],
        queryFn: async () => {
            const response = await storeConfigAPI.getStoreConfigStatus()
            // Backend returns: { success: true, data: { exists: boolean, config: {...} } }
            // Return the inner data object for easier access
            return response.data?.data || response.data
        },
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Create store configuration
export const useCreateStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (configData) => {
            const response = await storeConfigAPI.createStoreConfig(configData)
            // Backend returns: { success: true, message: "...", data: { config: {...} } }
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data?.message || 'Store configuration created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to create store configuration')
        }
    })
}

// Update store configuration
export const useUpdateStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (configData) => {
            const response = await storeConfigAPI.updateStoreConfig(configData)
            // Backend returns: { success: true, message: "...", data: { config: {...} } }
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data?.message || 'Store configuration updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to update store configuration')
        }
    })
}

// Initialize default store configuration
export const useInitStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await storeConfigAPI.initStoreConfig()
            // Backend returns: { success: true, message: "...", data: { config: {...} } }
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data?.message || 'Default store configuration initialized successfully')
            return data
        },
        onError: (error) => {
            console.error('Init store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to initialize store configuration')
        }
    })
}