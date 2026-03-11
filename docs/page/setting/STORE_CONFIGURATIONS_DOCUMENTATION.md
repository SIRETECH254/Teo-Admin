# Store Configurations Screen Documentation

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
import { FiSettings, FiGlobe, FiCreditCard, FiTruck, FiClock, FiDollarSign, FiArrowLeft, FiSave, FiRefreshCw, FiPlus, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  useGetStoreConfig,
  useCreateStoreConfig,
  useUpdateStoreConfig,
  useDeleteStoreConfig,
  useInitStoreConfig
} from '../../hooks/useStoreConfig'
```

## Context and State Management
- **TanStack Query hooks:** `useGetStoreConfig`, `useCreateStoreConfig`, `useUpdateStoreConfig`, `useDeleteStoreConfig`, `useInitStoreConfig` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Tab state:** `activeTab` string ('general', 'hours', 'payment', 'shipping', 'notifications').
- **Form state:** `formData` object containing all store configuration fields:
  - `storeName`: Store name (required)
  - `storeEmail`: Contact email (required)
  - `storePhone`: Contact phone (required)
  - `storeAddress`: Object with `{ street, city, country, postalCode }`
  - `businessHours`: Array of objects with `{ day, open, close, isOpen }` for each day of the week
  - `paymentMethods`: Object with `{ mpesa: { enabled, shortcode }, card: { enabled, paystackKey }, cash: { enabled, description } }`
  - `shippingSettings`: Object with `{ freeShippingThreshold, baseDeliveryFee, feePerKm }`
  - `notificationSettings`: Object with `{ emailNotifications, smsNotifications, orderConfirmations, stockAlerts }`
  - `isActive`: Boolean for store active status

**`useGetStoreConfig` hook (from `hooks/useStoreConfig.js`):**
```javascript
export const useGetStoreConfig = () => {
    return useQuery({
        queryKey: ['storeConfig'],
        queryFn: () => storeConfigAPI.getStoreConfig(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}
```

**`useUpdateStoreConfig` hook (from `hooks/useStoreConfig.js`):**
```javascript
export const useUpdateStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (configData) => storeConfigAPI.updateStoreConfig(configData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data.data?.message || 'Store configuration updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to update store configuration')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with max-width constraint (`max-w-6xl mx-auto`) and padding (`p-4 md:p-6`).
- **Header section:** Back to Settings link, title, description, and action buttons (Reset to Default, Delete Config).
- **Status message:** Blue info banner when no configuration exists.
- **Tab navigation:** Horizontal tab navigation with icons (General, Business Hours, Payment, Shipping, Notifications).
- **Tab content:** Dynamic content based on active tab, all within a single form.
- **Form actions:** Cancel and Save buttons at bottom.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ← Back to Settings                                   │ │
│  │  ⚙️ Store Configuration                               │ │
│  │  Manage your store settings and preferences          │ │
│  │  [Reset to Default] [Delete Config]                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [General] [Business Hours] [Payment] [Shipping]     │ │
│  │  [Notifications]                                      │ │
│  │  ───────────────────────────────────────────────────  │ │
│  │                                                       │ │
│  │  Tab Content (varies by tab)                        │ │
│  │                                                       │ │
│  │  [Cancel] [Save Configuration]                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ← Back to Settings                                           │
│                                                               │
│  ⚙️ Store Configuration                                       │
│  Manage your store settings and preferences                    │
│  [Reset to Default] [Delete Config]                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [General] [Business Hours] [Payment] [Shipping]    │   │
│  │ [Notifications]                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  General Information                                │   │
│  │  Store Name *    Contact Email *                    │   │
│  │  [_____________]  [_____________]                   │   │
│  │  Contact Phone *                                     │   │
│  │  [_____________]                                     │   │
│  │  Store Address                                       │   │
│  │  [Street] [City]                                     │   │
│  │  [Country] [Postal Code]                            │   │
│  │  ☑ Store is Active                                   │   │
│  │                                                     │   │
│  │  [Cancel] [Save Configuration]                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Tab Navigation Buttons**
  ```javascript
  <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center gap-2 py-4 px-2 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
          activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
  >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {tab.label}
  </button>
  ```

- **General Tab - Store Name Input**
  ```javascript
  <input
      type="text"
      name="storeName"
      value={formData.storeName}
      onChange={handleInputChange}
      className="input"
      placeholder="Enter store name"
      required
  />
  ```

- **General Tab - Store Address Fields**
  ```javascript
  <input
      type="text"
      placeholder="Street Address"
      value={formData.storeAddress.street}
      onChange={(e) => handleAddressChange('street', e.target.value)}
      className="input"
  />
  ```

- **Business Hours Tab - Day Toggle and Time Inputs**
  ```javascript
  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      <div className="w-24">
          <span className="text-sm font-medium text-gray-700 capitalize">{hour.day}</span>
      </div>
      <label className="flex items-center">
          <input
              type="checkbox"
              checked={hour.isOpen}
              onChange={(e) => handleBusinessHoursChange(index, 'isOpen', e.target.checked)}
              className="mr-2"
          />
          <span className="text-sm text-gray-600">Open</span>
      </label>
      {hour.isOpen && (
          <>
              <input
                  type="time"
                  value={hour.open}
                  onChange={(e) => handleBusinessHoursChange(index, 'open', e.target.value)}
                  className="input w-32"
              />
              <span className="text-gray-500">to</span>
              <input
                  type="time"
                  value={hour.close}
                  onChange={(e) => handleBusinessHoursChange(index, 'close', e.target.value)}
                  className="input w-32"
              />
          </>
      )}
  </div>
  ```

- **Payment Tab - M-Pesa Configuration**
  ```javascript
  <div className="border border-gray-200 rounded-lg p-4">
      <label className="flex items-center">
          <input
              type="checkbox"
              checked={formData.paymentMethods.mpesa.enabled}
              onChange={(e) => handlePaymentMethodToggle('mpesa', 'enabled', e.target.checked)}
              className="mr-2"
          />
          <span className="text-sm text-gray-600">Enabled</span>
      </label>
      {formData.paymentMethods.mpesa.enabled && (
          <input
              type="text"
              value={formData.paymentMethods.mpesa.shortcode}
              onChange={(e) => handlePaymentMethodToggle('mpesa', 'shortcode', e.target.value)}
              className="input"
              placeholder="Enter M-Pesa shortcode"
          />
      )}
  </div>
  ```

- **Shipping Tab - Shipping Settings Inputs**
  ```javascript
  <input
      type="number"
      value={formData.shippingSettings.freeShippingThreshold}
      onChange={(e) => handleShippingChange('freeShippingThreshold', e.target.value)}
      className="input"
      placeholder="5000"
      min="0"
  />
  ```

- **Notifications Tab - Notification Toggles**
  ```javascript
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div>
          <h4 className="font-medium text-gray-900">Email Notifications</h4>
          <p className="text-sm text-gray-500">Receive order updates via email</p>
      </div>
      <input
          type="checkbox"
          checked={formData.notificationSettings.emailNotifications}
          onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
      />
  </div>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `storeConfigAPI` methods.
- **Get config endpoint:** `GET /api/store-config` (admin only).
- **Create config endpoint:** `POST /api/store-config` (admin only).
- **Update config endpoint:** `PUT /api/store-config` (admin only).
- **Delete config endpoint:** `DELETE /api/store-config` (admin only).
- **Init config endpoint:** `POST /api/store-config/init` (admin only).
- **Payload:** Full `formData` object with all configuration fields.
- **Response contract:** `response.data.data.config` contains the configuration object.
- **Cache invalidation:** After create/update/delete/init, `queryClient.invalidateQueries({ queryKey: ['storeConfig'] })` is called.

## Components Used
- React + React Router DOM: `Link`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `button`, `form`, `label`, `div`, `select`, `option`.
- `react-icons/fi` for icons (FiSettings, FiGlobe, FiCreditCard, FiTruck, FiClock, FiDollarSign, FiArrowLeft, FiSave, FiRefreshCw, FiTrash2).
- Tailwind CSS classes for styling with custom classes (`.btn`, `.btn-primary`, `.btn-outline`, `.input`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Spinner displayed while `configLoading` is true.
- **Error state:** Red error banner with retry button when `configError` exists.
- **Form submission errors:** Handled in mutation hooks' `onError` callbacks, displayed via toast notifications.
- **Form validation:** Required fields marked with asterisk (*), HTML5 validation.

## Navigation Flow
- **Route:** `/settings/store-configurations`.
- **Entry points:**
  - From settings landing page via "Store Configurations" card.
  - Direct URL navigation.
- **On successful save:** Stays on same page, shows success toast, data is refreshed.
- **Back navigation:** "Back to Settings" link ➞ `/settings`.

## Functions Involved

- **`handleInputChange`** — Updates simple form fields.
  ```javascript
  const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target
      if (type === 'checkbox') {
          setFormData(prev => ({ ...prev, [name]: checked }))
      } else {
          setFormData(prev => ({ ...prev, [name]: value }))
      }
  }
  ```

- **`handleNestedInputChange`** — Updates nested form fields (e.g., shippingSettings).
  ```javascript
  const handleNestedInputChange = (category, field, value, type = 'text') => {
      setFormData(prev => ({
          ...prev,
          [category]: {
              ...prev[category],
              [field]: type === 'number' ? Number(value) : value
          }
      }))
  }
  ```

- **`handleAddressChange`** — Updates store address fields.
  ```javascript
  const handleAddressChange = (field, value) => {
      setFormData(prev => ({
          ...prev,
          storeAddress: {
              ...prev.storeAddress,
              [field]: value
          }
      }))
  }
  ```

- **`handleBusinessHoursChange`** — Updates business hours for a specific day.
  ```javascript
  const handleBusinessHoursChange = (index, field, value) => {
      setFormData(prev => ({
          ...prev,
          businessHours: prev.businessHours.map((hour, i) =>
              i === index ? { ...hour, [field]: value } : hour
          )
      }))
  }
  ```

- **`handlePaymentMethodToggle`** — Updates payment method settings.
  ```javascript
  const handlePaymentMethodToggle = (method, field, value) => {
      setFormData(prev => ({
          ...prev,
          paymentMethods: {
              ...prev.paymentMethods,
              [method]: {
                  ...prev.paymentMethods[method],
                  [field]: value
              }
          }
      }))
  }
  ```

- **`handleShippingChange`** — Updates shipping settings.
  ```javascript
  const handleShippingChange = (field, value, type = 'number') => {
      setFormData(prev => ({
          ...prev,
          shippingSettings: {
              ...prev.shippingSettings,
              [field]: type === 'number' ? Number(value) : value
          }
      }))
  }
  ```

- **`handleNotificationChange`** — Updates notification settings.
  ```javascript
  const handleNotificationChange = (field, value) => {
      setFormData(prev => ({
          ...prev,
          notificationSettings: {
              ...prev.notificationSettings,
              [field]: value
          }
      }))
  }
  ```

- **`handleSubmit`** — Saves configuration (create or update).
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()
      try {
          if (hasConfig) {
              await updateConfigMutation.mutateAsync(formData)
          } else {
              await createConfigMutation.mutateAsync(formData)
          }
      } catch (error) {
          console.error('Error saving store configuration:', error)
      }
  }
  ```

- **`handleInitConfig`** — Initializes default configuration.
  ```javascript
  const handleInitConfig = async () => {
      try {
          await initConfigMutation.mutateAsync()
      } catch (error) {
          console.error('Error initializing store configuration:', error)
      }
  }
  ```

- **`handleDeleteConfig`** — Deletes configuration with confirmation.
  ```javascript
  const handleDeleteConfig = async () => {
      if (window.confirm('Are you sure you want to delete the store configuration? This action cannot be undone.')) {
          try {
              await deleteConfigMutation.mutateAsync()
          } catch (error) {
              console.error('Error deleting store configuration:', error)
          }
      }
  }
  ```

- **Data loading effect** — Loads configuration data and populates form.
  ```javascript
  useEffect(() => {
      if (config) {
          setFormData({
              storeName: config.storeName || '',
              storeEmail: config.storeEmail || '',
              // ... populate all fields from config
          })
      }
  }, [config])
  ```

## Future Enhancements
- Add configuration templates/presets.
- Add configuration import/export functionality.
- Add configuration version history.
- Add configuration validation with detailed error messages.
- Add configuration preview/test mode.
- Add configuration backup/restore functionality.
- Add configuration change audit log.
- Add configuration rollback functionality.
- Add configuration sharing between stores.
- Add configuration scheduling (time-based changes).
- Add configuration A/B testing.
- Add configuration analytics and insights.
