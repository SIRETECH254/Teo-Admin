import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useSearchLocations } from '../../hooks/useLocations'
import { useCreateAddress } from '../../hooks/useAddresses'


const AddressAutocomplete = ({ onSaved, userId }) => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results = [], isLoading: loading } = useSearchLocations(debouncedQuery)
  const { mutateAsync: createAddress } = useCreateAddress()

  const transformLocation = (place) => ({
    name: place.name || place.formatted_address,
    coordinates: {
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
    },
    regions: {
      country: 'Kenya',
      locality: place.name || null,
      plus_code: null,
      political: null,
      sublocality: null,
      sublocality_level_1: null,
      administrative_area_level_1: null,
    },
    address: place.formatted_address,
    details: null,
    isDefault: false,
    userId: userId || null,
  })

  const handleSelectPlace = async (place) => {
    try {
      const payload = transformLocation(place)
      const created = await createAddress(payload)
      
      // Clear local state BEFORE notifying parent
      setQuery('')
      if (onSaved) onSaved(created)
    } catch (e) {
      console.error('Failed to save address:', e)
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input"
      />
      {loading && <div className="text-sm text-gray-500">Searching...</div>}
      {Array.isArray(results) && results.length > 0 ? (
        <ul className="border rounded-md divide-y">
          {results.map((place) => (
            <li
              key={place.place_id}
              className="p-2 hover:bg-gray-50 cursor-pointer space-y-2"
              onClick={() => handleSelectPlace(place)}
            >
              <div className="text-sm text-gray-700">{place.name}</div>
              <div className="text-xs text-gray-500">{place.formatted_address}</div>
            </li>
          ))}
        </ul>
      ) : (
        debouncedQuery.trim().length >= 3 && !loading && (
          <div className="border rounded-md p-6 flex items-center justify-center min-h-40">
            <div className="text-center">
              <div className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
                <FiSearch className="w-5 h-5" />
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-gray-500">No results for</span> <span className="font-semibold">“{query}”</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Try a different spelling or another nearby place</div>
            </div>
          </div>
        )
      )}
    </div>
  )
}


export default AddressAutocomplete
