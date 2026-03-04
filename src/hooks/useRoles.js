import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import toast from 'react-hot-toast'

// Get all roles
export const useGetRoles = (params = {}) => {
    return useQuery({
        queryKey: ['roles', params],
        queryFn: async () => {
            const res = await api.get('/roles', { params })
            return res.data
        },
        staleTime: 1000 * 60 * 10,
    })
}

// Get role by ID
export const useGetRoleById = (roleId) => {
    return useQuery({
        queryKey: ['role', roleId],
        queryFn: async () => {
            const res = await api.get(`/roles/${roleId}`)
            return res.data?.data?.role
        },
        enabled: !!roleId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// Create role
export const useCreateRole = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (roleData) => {
            await api.post('/roles', roleData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            toast.success('Role created successfully')
        },
        onError: (error) => {
            console.error('Error creating role:', error)
            toast.error(error?.response?.data?.message || 'Failed to create role')
        }
    })
}

// Update role
export const useUpdateRole = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ roleId, roleData }) => {
            await api.put(`/roles/${roleId}`, roleData)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] })
            toast.success('Role updated successfully')
        },
        onError: (error) => {
            console.error('Error updating role:', error)
            toast.error(error?.response?.data?.message || 'Failed to update role')
        }
    })
}

// Delete role
export const useDeleteRole = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (roleId) => {
            await api.delete(`/roles/${roleId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            toast.success('Role deleted successfully')
        },
        onError: (error) => {
            console.error('Error deleting role:', error)
            toast.error(error?.response?.data?.message || 'Failed to delete role')
        }
    })
}
