import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleAPI } from '../api'
import toast from 'react-hot-toast'

// Get all roles
export const useGetRoles = (params = {}) => {
    return useQuery({
        queryKey: ['roles', params],
        queryFn: async () => {
            const res = await roleAPI.getAllRoles(params)
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
            const res = await roleAPI.getRoleById(roleId)
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
            const res = await roleAPI.createRole(roleData)
            return res.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            toast.success(data?.message || 'Role created successfully')
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
            const res = await roleAPI.updateRole(roleId, roleData)
            return res.data
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] })
            toast.success(data?.message || 'Role updated successfully')
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
            const res = await roleAPI.deleteRole(roleId)
            return res.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            toast.success(data?.message || 'Role deleted successfully')
        },
        onError: (error) => {
            console.error('Error deleting role:', error)
            toast.error(error?.response?.data?.message || 'Failed to delete role')
        }
    })
}

// Assign role to user
export const useAssignRoleToUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ roleId, userId }) => {
            const res = await roleAPI.assignRoleToUser(roleId, userId)
            return res.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['role'] })
            toast.success(data?.message || 'Role assigned successfully')
        },
        onError: (error) => {
            console.error('Error assigning role:', error)
            toast.error(error?.response?.data?.message || 'Failed to assign role')
        }
    })
}

// Remove role from user
export const useRemoveRoleFromUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ roleId, userId }) => {
            const res = await roleAPI.removeRoleFromUser(roleId, userId)
            return res.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['role'] })
            toast.success(data?.message || 'Role removed successfully')
        },
        onError: (error) => {
            console.error('Error removing role:', error)
            toast.error(error?.response?.data?.message || 'Failed to remove role')
        }
    })
}

// Get users by role
export const useGetUsersByRole = (roleId, params = {}) => {
    return useQuery({
        queryKey: ['role', roleId, 'users', params],
        queryFn: async () => {
            const res = await roleAPI.getUsersByRole(roleId, params)
            return res.data
        },
        enabled: !!roleId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}
