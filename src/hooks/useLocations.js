import { useQuery } from '@tanstack/react-query'
import { locationAPI } from '../api'

// Search for locations
export const useSearchLocations = (query) => {
    return useQuery({
        queryKey: ['locations', 'search', query],
        queryFn: async () => {
            const res = await locationAPI.searchLocations(query)
            return res?.data?.data || res?.data || []
        },
        enabled: (query || '').trim().length >= 3,
        staleTime: 24 * 60 * 60 * 1000, // Locations don't change often
        gcTime: 24 * 60 * 60 * 1000,
    })
}
