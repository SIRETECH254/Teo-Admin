import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSettings, FiGlobe, FiCreditCard, FiTruck, FiClock, FiDollarSign, FiArrowLeft, FiEdit, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi'
import {
  useGetStoreConfig
} from '../../hooks/useStoreConfig'

const StoreConfigurations = () => {
  const [activeTab, setActiveTab] = useState('general')
  const { data: configData, isLoading, isError, error } = useGetStoreConfig()

  const config = configData?.config
  const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load store configuration.'

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'hours', label: 'Business Hours', icon: FiClock },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'notifications', label: 'Notifications', icon: FiGlobe },
  ]

  const renderTabContent = () => {
    if (!config) return null

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FiSettings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Store Name</p>
                    <p className="font-medium text-gray-900">{config.storeName || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <FiMail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Email</p>
                    <p className="font-medium text-gray-900">{config.storeEmail || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FiPhone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Phone</p>
                    <p className="font-medium text-gray-900">{config.storePhone || 'Not set'}</p>
                  </div>
                </div>

                {config.storeAddress && (
                  <div className="md:col-span-2 flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <FiMapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Store Address</p>
                      <p className="font-medium text-gray-900">
                        {[config.storeAddress.street, config.storeAddress.city, config.storeAddress.country, config.storeAddress.postalCode]
                          .filter(Boolean)
                          .join(', ') || 'Not set'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {config.isActive ? (
                      <FiCheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <FiXCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Store Status</p>
                    <p className="font-medium text-gray-900">{config.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'hours':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-3">
                {config.businessHours?.map((hour) => (
                  <div key={hour.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {hour.day}
                        </span>
                      </div>
                      {hour.isOpen ? (
                        <div className="flex items-center gap-2">
                          <FiClock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">
                            {hour.open} - {hour.close}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Closed</span>
                      )}
                    </div>
                    {hour.isOpen ? (
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FiXCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {/* M-Pesa */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">M-Pesa</h4>
                        <p className="text-sm text-gray-500">Mobile money payments</p>
                      </div>
                    </div>
                    {config.paymentMethods?.mpesa?.enabled ? (
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FiXCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {config.paymentMethods?.mpesa?.enabled && config.paymentMethods?.mpesa?.shortcode && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Shortcode:</span> {config.paymentMethods.mpesa.shortcode}
                    </div>
                  )}
                </div>

                {/* Card Payments */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Card Payments</h4>
                        <p className="text-sm text-gray-500">Visa, Mastercard via Paystack</p>
                      </div>
                    </div>
                    {config.paymentMethods?.card?.enabled ? (
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FiXCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {config.paymentMethods?.card?.enabled && config.paymentMethods?.card?.paystackKey && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Paystack Key:</span> {config.paymentMethods.card.paystackKey.substring(0, 20)}...
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                    </div>
                    {config.paymentMethods?.cash?.enabled ? (
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FiXCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {config.paymentMethods?.cash?.enabled && config.paymentMethods?.cash?.description && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Description:</span> {config.paymentMethods.cash.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'shipping':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FiTruck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Free Shipping Threshold</p>
                    <p className="font-medium text-gray-900">KES {config.shippingSettings?.freeShippingThreshold?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <FiTruck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Base Delivery Fee</p>
                    <p className="font-medium text-gray-900">KES {config.shippingSettings?.baseDeliveryFee?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FiTruck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fee Per Kilometer</p>
                    <p className="font-medium text-gray-900">KES {config.shippingSettings?.feePerKm?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FiMail className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive order updates via email</p>
                    </div>
                  </div>
                  {config.notificationSettings?.emailNotifications ? (
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FiXCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FiPhone className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive order updates via SMS</p>
                    </div>
                  </div>
                  {config.notificationSettings?.smsNotifications ? (
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FiXCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Order Confirmations</h4>
                      <p className="text-sm text-gray-500">Send confirmation when orders are placed</p>
                    </div>
                  </div>
                  {config.notificationSettings?.orderConfirmations ? (
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FiXCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FiAlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Stock Alerts</h4>
                      <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
                    </div>
                  </div>
                  {config.notificationSettings?.stockAlerts ? (
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FiXCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto overflow-x-hidden">
      {/* Loading skeleton */}
      {isLoading && (
        <div className="mb-6 md:mb-8">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="h-10 w-64 animate-pulse rounded bg-gray-300 mb-2" />
          <div className="h-4 w-96 animate-pulse rounded bg-gray-300" />
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FiAlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading store configuration</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Link to="/settings" className="btn-primary inline-block">
              Back to Settings
            </Link>
          </div>
        </div>
      )}

      {/* Data state */}
      {!isLoading && !isError && (
        <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Settings
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FiSettings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Store Configuration
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                View your store settings and preferences
              </p>
            </div>
          </div>

          {config && (
            <Link
              to="/settings/store-configurations/edit"
              className="btn-primary inline-flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <FiEdit className="h-4 w-4" />
              Edit Configuration
            </Link>
          )}
        </div>
      </div>

      {/* Status Message */}
      {!config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <FiSettings className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">No Store Configuration Found</h3>
              <p className="text-sm text-blue-700">
                Create your store configuration to enable all store features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation - Full Width */}
      {config && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <nav className="flex flex-nowrap min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {renderTabContent()}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default StoreConfigurations
