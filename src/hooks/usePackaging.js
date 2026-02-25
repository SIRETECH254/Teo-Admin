import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { packagingAPI } from '../api'
import toast from 'react-hot-toast'


export const useGetPackaging = (params = {}) => {
    return useQuery({
        queryKey: ['packaging', params],
        queryFn: async () => {
            const response = await packagingAPI.getPackaging(params)
            return response.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}


export const useGetPackagingById = (id) => {
    return useQuery({
        queryKey: ['packaging', id],
        queryFn: async () => {
            const response = await packagingAPI.getById(id)
            return response.data
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}


export const useCreatePackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data) => {
            const response = await packagingAPI.create(data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success('Packaging option created')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create packaging option')
        }
    })
}


export const useUpdatePackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await packagingAPI.update(id, data)
            return response.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            queryClient.invalidateQueries({ queryKey: ['packaging', variables.id] })
            toast.success('Packaging option updated')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update packaging option')
        }
    })
}


export const useDeletePackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id) => {
            const response = await packagingAPI.remove(id)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success('Packaging option deleted')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete packaging option')
        }
    })
}


export const useSetDefaultPackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id) => {
            const response = await packagingAPI.setDefault(id)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success('Default packaging updated')
            return data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to set default packaging')
        }
    })
}


// Public consumption (checkout)
export const useGetActivePackagingPublic = () => {
    return useQuery({
        queryKey: ['packaging', 'public', 'active'],
        queryFn: async () => {
            const response = await packagingAPI.getActivePublic()
            return response.data
        },
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })
}


export const useGetDefaultPackagingPublic = () => {
    return useQuery({
        queryKey: ['packaging', 'public', 'default'],
        queryFn: () => packagingAPI.getDefaultPublic(),
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })
}


