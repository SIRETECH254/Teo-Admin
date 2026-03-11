import { useQuery } from '@tanstack/react-query'
import { statsAPI, orderAPI } from '../api'


export const useOverviewStats = () => {
    return useQuery({
        queryKey: ['stats', 'overview'],
        queryFn: async () => {
            const response = await statsAPI.getOverview()
            // Backend returns: { success: true, data: { totalProducts, totalCategories, ... } }
            // response.data is the backend response, so return response.data.data for the actual stats
            return response.data?.data || response.data
        },
        staleTime: 1000 * 60, // 1 min
    })
}


export const useAnalytics = (params) => {
    return useQuery({
        queryKey: ['stats', 'analytics', params],
        queryFn: async () => {
            const response = await statsAPI.getAnalytics(params)
            // Backend returns: { success: true, data: { meta, ordersSeries, revenueSeries, ... } }
            // response.data is the backend response, so return response.data.data for the actual analytics
            return response.data?.data || response.data
        },
        staleTime: 1000 * 60, // 1 min
        keepPreviousData: true,
    })
}

// Get recent orders for dashboard
export const useGetRecentOrders = (params = { page: 1, limit: 5 }) => {
    return useQuery({
        queryKey: ['orders', 'recent', params],
        queryFn: async () => {
            const res = await orderAPI.getOrders(params)
            return res.data?.data?.orders || []
        },
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}
