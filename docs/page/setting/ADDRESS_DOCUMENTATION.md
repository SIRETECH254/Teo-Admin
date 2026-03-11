# Address Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```javascript
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiHome, FiBriefcase, FiStar, FiX, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AddressAutocomplete from '../../components/common/AddressAutocomplete'
import api from '../../api'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **API calls:** Direct API calls using `api` instance (not using TanStack Query hooks).
- **Address list:** `addresses` array containing all user addresses.
- **Modal states:**
  - `showAddModal`: Boolean to show/hide add address modal
  - `editingAddress`: Address object being edited (null when not editing)
  - `confirmDelete`: Object with `{ open: boolean, address: object }` for delete confirmation
- **Loading states:** `loading` for initial data fetch, `isDeleting` for delete operation.

**AddressAutocomplete component:**
- Uses LocationIQ API for address autocomplete
- Searches addresses with minimum 3 characters
- Transforms LocationIQ response to app format
- Automatically saves selected address via API

## UI Structure
- **Screen shell:** Full-width container with max-width constraint (`max-w-4xl mx-auto`) and padding (`p-6`).
- **Header section:** Back to Settings link, title, description, and Add Address button.
- **Addresses list:** Grid/list of address cards with type icon, name, address details, default badge, and actions.
- **Add address modal:** Modal with AddressAutocomplete component for searching and adding addresses.
- **Delete confirmation modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message with icon when no addresses exist.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ← Back to Settings                                   │ │
│  │  Addresses                    [Add Address]          │ │
│  │  Manage your delivery and billing addresses          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Address Cards                                        │ │
│  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │  🏠 Home (Default)                             │ │ │
│  │  │  123 Main Street                                │ │ │
│  │  │  Nairobi, Kenya                                │ │ │
│  │  │  [Set as Default] [Delete]                     │ │ │
│  │  └───────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ← Back to Settings                                           │
│                                                               │
│  Addresses                                    [➕ Add Address]│
│  Manage your delivery and billing addresses                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🏠 Home (Default)                                   │   │
│  │  123 Main Street                                     │   │
│  │  Nairobi, Kenya                                      │   │
│  │  [Set as Default] [🗑 Delete]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💼 Work                                            │   │
│  │  456 Business Avenue                                │   │
│  │  Mombasa, Kenya                                      │   │
│  │  [Set as Default] [🗑 Delete]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Add Address Modal** (with AddressAutocomplete)
  ```javascript
  {showAddModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full h-[70vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Search and Add Address</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                      <FiX className="h-5 w-5" />
                  </button>
              </div>
              <AddressAutocomplete
                  onSaved={(resp) => {
                      const created = resp?.data?.data?.address || resp?.data || resp
                      if (created) setAddresses(prev => [created, ...prev])
                      setShowAddModal(false)
                      toast.success('Address added successfully!')
                      navigate('/settings/address')
                  }}
              />
          </div>
      </div>
  )}
  ```

- **Address Card** (with type icon and default badge)
  ```javascript
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-lg ${iconColor}`}>
              <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
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
                          {address.regions.locality || ''}
                          {address.regions.administrative_area_level_1 || ''}
                      </p>
                  )}
                  {address.regions?.country && <p>{address.regions.country}</p>}
              </div>
          </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
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
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
              <FiTrash2 className="h-4 w-4" />
          </button>
      </div>
  </div>
  ```

- **Delete Confirmation Modal**
  ```javascript
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
                      disabled={isDeleting}
                  >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via direct `api.get`, `api.post`, `api.put`, `api.delete` calls.
- **List addresses endpoint:** `GET /api/addresses` (authenticated users only).
- **Create address endpoint:** `POST /api/addresses` (authenticated users only).
- **Update address endpoint:** `PUT /api/addresses/:id` (authenticated users only).
- **Delete address endpoint:** `DELETE /api/addresses/:id` (authenticated users only).
- **Set default address endpoint:** `PUT /api/addresses/:id/default` (authenticated users only).
- **Response contract:** `response.data.data.addresses` or `response.data` contains address array/list.
- **AddressAutocomplete API:** Uses LocationIQ API (`https://api.locationiq.com/v1/autocomplete`) with `VITE_LOCATIONIQ_TOKEN` environment variable.

## Components Used
- React + React Router DOM: `useNavigate`, `Link`.
- Custom components: `AddressAutocomplete`.
- Form elements: `input`, `button`, `div`, `img`.
- `react-icons/fi` for icons (FiMapPin, FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiHome, FiBriefcase, FiStar, FiX, FiAlertTriangle).
- Tailwind CSS classes for styling with custom classes (`.btn`, `.btn-primary`, `.btn-outline`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Spinner displayed while `loading` is true.
- **Empty state:** Message displayed when `addresses.length === 0` with icon and call-to-action.
- **API errors:** Errors caught in try-catch blocks, displayed via toast notifications.
- **Delete confirmation:** Confirmation modal prevents accidental deletions.

## Navigation Flow
- **Route:** `/settings/address`.
- **Entry points:**
  - From settings landing page via "Address" card.
  - Direct URL navigation.
- **Address actions:**
  - "Set as Default" button ➞ Updates default address via API.
  - "Delete" button ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add address:** "Add Address" button ➞ Opens modal with AddressAutocomplete, saves on selection.
- **Back navigation:** "Back to Settings" link ➞ `/settings`.

## Functions Involved

- **Address data loading effect** — Fetches addresses on component mount.
  ```javascript
  useEffect(() => {
      const fetchAddresses = async () => {
          try {
              const res = await api.get('/addresses')
              const list = res?.data?.data?.addresses || res?.data || []
              setAddresses(list)
          } catch (error) {
              toast.error('Failed to load addresses')
              console.error('Error fetching addresses:', error)
          } finally {
              setLoading(false)
          }
      }
      fetchAddresses()
  }, [])
  ```

- **`handleAddAddress`** — Adds new address (called by AddressAutocomplete).
  ```javascript
  const handleAddAddress = async (addressData) => {
      try {
          const res = await api.post('/addresses', addressData)
          const created = res?.data?.data?.address || res?.data
          if (created) setAddresses(prev => [created, ...prev])
          setShowAddModal(false)
          toast.success('Address added successfully!')
          navigate('/settings/address')
      } catch (error) {
          toast.error('Failed to add address')
          console.error('Error adding address:', error)
      }
  }
  ```

- **`handleUpdateAddress`** — Updates existing address.
  ```javascript
  const handleUpdateAddress = async (id, addressData) => {
      try {
          const res = await api.put(`/addresses/${id}`, addressData)
          const updated = res?.data?.data?.address || res?.data
          if (updated) {
              setAddresses(prev => prev.map(addr => 
                  (String(addr._id || addr.id) === String(id) ? updated : addr)
              ))
          }
          setEditingAddress(null)
          toast.success('Address updated successfully!')
      } catch (error) {
          toast.error('Failed to update address')
          console.error('Error updating address:', error)
      }
  }
  ```

- **`handleDeleteAddress`** — Deletes address.
  ```javascript
  const handleDeleteAddress = async (id) => {
      try {
          await api.delete(`/addresses/${id}`)
          setAddresses(prev => prev.filter(addr => String(addr._id || addr.id) !== String(id)))
          toast.success('Address deleted successfully!')
      } catch (error) {
          toast.error('Failed to delete address')
          console.error('Error deleting address:', error)
      }
  }
  ```

- **`confirmDeleteAddress`** — Confirms and executes address deletion.
  ```javascript
  const confirmDeleteAddress = async () => {
      if (!confirmDelete.address) return
      setIsDeleting(true)
      try {
          const id = confirmDelete.address._id || confirmDelete.address.id
          await handleDeleteAddress(id)
          setConfirmDelete({ open: false, address: null })
      } catch (error) {
          // error handled in handleDeleteAddress
      } finally {
          setIsDeleting(false)
      }
  }
  ```

- **`handleSetDefault`** — Sets address as default.
  ```javascript
  const handleSetDefault = async (id) => {
      try {
          await api.put(`/addresses/${id}/default`)
          setAddresses(prev => prev.map(addr => ({
              ...addr,
              isDefault: String(addr._id || addr.id) === String(id)
          })))
          toast.success('Default address updated!')
      } catch (error) {
          toast.error('Failed to update default address')
          console.error('Error setting default address:', error)
      }
  }
  ```

- **`getAddressIcon`** — Returns icon component based on address type.
  ```javascript
  const getAddressIcon = (type) => {
      switch (type) {
          case 'home': return FiHome
          case 'work': return FiBriefcase
          default: return FiMapPin
      }
  }
  ```

- **`getAddressTypeColor`** — Returns color classes based on address type.
  ```javascript
  const getAddressTypeColor = (type) => {
      switch (type) {
          case 'home': return 'text-blue-600 bg-blue-50'
          case 'work': return 'text-green-600 bg-green-50'
          default: return 'text-gray-600 bg-gray-50'
      }
  }
  ```

## Future Enhancements
- Add address editing functionality (currently only add/delete).
- Add address validation and verification.
- Add address geocoding and map display.
- Add address search and filtering.
- Add address sorting options.
- Add address labels/tags.
- Add address notes/comments.
- Add address sharing functionality.
- Add address import/export.
- Add address templates.
- Add address validation against postal services.
- Add address autocomplete for editing.
