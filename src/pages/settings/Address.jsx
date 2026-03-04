import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiHome, FiBriefcase, FiStar, FiX, FiAlertTriangle } from 'react-icons/fi'
import AddressAutocomplete from '../../components/common/AddressAutocomplete'
import { useGetAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '../../hooks/useAddresses'

const Address = () => {
  const navigate = useNavigate()
  const { data: addresses = [], isLoading: loading } = useGetAddresses()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, address: null })

  const handleAddAddress = async (addressData) => {
    try {
      await createAddress.mutateAsync(addressData)
      setShowAddModal(false)
      navigate('/settings/address')
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdateAddress = async (id, addressData) => {
    try {
      await updateAddress.mutateAsync({ id, addressData })
      setEditingAddress(null)
    } catch (error) {
      // Error handled by hook
    }
  }

  const confirmDeleteAddress = async () => {
    if (!confirmDelete.address) return
    try {
      const id = confirmDelete.address._id || confirmDelete.address.id
      await deleteAddress.mutateAsync(id)
      setConfirmDelete({ open: false, address: null })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress.mutateAsync(id)
    } catch (error) {
      // Error handled by hook
    }
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return FiHome
      case 'work':
        return FiBriefcase
      default:
        return FiMapPin
    }
  }

  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'home':
        return 'text-blue-600 bg-blue-50'
      case 'work':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Delete Confirmation Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Address</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{confirmDelete.address?.name || confirmDelete.address?.label || 'this address'}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete({ open: false, address: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAddress}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleteAddress.isPending}
              >
                {deleteAddress.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Settings
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Addresses</h1>
            <p className="text-gray-600">Manage your delivery and billing addresses</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Address
          </button>
        </div>
      </div>

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <FiMapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
            <p className="text-gray-600 mb-4">Add your first address to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          addresses.map((address) => {
            const Icon = getAddressIcon(address.type)
            const iconColor = getAddressTypeColor(address.type)

            return (
              <div
                key={address._id || address.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {address.name || address.label}
                        </h3>
                        {address.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                            <FiStar className="h-3 w-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 space-y-1">
                        <p>{address.address || address.street}</p>
                        {address.regions && (
                          <p>
                            {(address.regions.locality || '')}{address.regions.locality ? ', ' : ''}
                            {(address.regions.administrative_area_level_1 || '')}
                          </p>
                        )}
                        {address.regions?.country && <p>{address.regions.country}</p>}
                      </div>
                      {/* Small screens: actions below location/details */}
                      <div className="flex items-center gap-2 mt-2 sm:hidden">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address._id || address.id)}
                            className="text-sm text-primary hover:text-primary-dark font-medium"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete({ open: true, address })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Delete address"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Large screens: actions on the right */}
                  <div className="hidden sm:flex items-center gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address._id || address.id)}
                        className="text-sm text-primary hover:text-primary-dark font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                    {/* Edit action removed per request */}
                    <button
                      onClick={() => setConfirmDelete({ open: true, address })}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete address"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full h-[70vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Search and Add Address</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" aria-label="Close">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <AddressAutocomplete
              onSaved={(resp) => {
                // Try to read standard response shapes
                const created = resp?.data?.data?.address || resp?.data || resp
                if (created) setAddresses(prev => [created, ...prev])
                setShowAddModal(false)
                toast.success('Address added successfully!')
                // Mirror AddProduct success: navigate to list to view the new address
                navigate('/settings/address')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Address Modal Component
const AddressModal = ({ address, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: 'home',
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type || 'home',
        label: address.label || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'Kenya',
      })
    }
  }, [address])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {address ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., Home, Office"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="input"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (address ? 'Update Address' : 'Add Address')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Address