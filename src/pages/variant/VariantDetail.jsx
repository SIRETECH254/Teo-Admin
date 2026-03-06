import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiEdit, FiTag, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi'
import { useGetVariantById } from '../../hooks/useVariants'
import StatusBadge from '../../components/common/StatusBadge'

const VariantDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useGetVariantById(id)

  // Parse variant data similar to EditVariant.jsx
  const payload = data?.data
  const variant = payload?.data || payload?.variant || data?.variant || data

  // Error message extraction
  const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load variant.'

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded bg-gray-300" />
                <div>
                  <div className="h-8 w-48 animate-pulse rounded bg-gray-300 mb-2" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                </div>
              </div>
              <div className="h-10 w-24 animate-pulse rounded bg-gray-300" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <div className="h-6 w-32 animate-pulse rounded bg-gray-300 mb-4" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-300 mb-2" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300" />
            </div>
            <div>
              <div className="h-6 w-24 animate-pulse rounded bg-gray-300 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-300" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FiAlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading variant</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/variants')}
            className="btn-primary"
          >
            Back to Variants
          </button>
        </div>
      </div>
    )
  }

  // Data state
  if (!variant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FiTag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Variant not found</h2>
          <p className="text-gray-600 mb-6">The variant you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/variants')}
            className="btn-primary"
          >
            Back to Variants
          </button>
        </div>
      </div>
    )
  }

  const options = Array.isArray(variant.options) ? variant.options : []
  const isActive = variant.isActive !== false

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/variants')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
                <span className="font-medium">All Variants</span>
              </button>
            </div>
            <button
              onClick={() => navigate(`/variants/${id}/edit`)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FiEdit className="h-4 w-4" />
              Edit Variant
            </button>
          </div>
        </div>

        {/* Variant Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="title2 mb-2">{variant.name || 'Unnamed Variant'}</h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <StatusBadge status={isActive ? 'active' : 'inactive'} type="variant-status" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium text-gray-900">Simple</span>
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Options</h2>
            <span className="text-sm text-gray-600">{options.length} option{options.length !== 1 ? 's' : ''}</span>
          </div>

          {options.length === 0 ? (
            <div className="text-center py-8">
              <FiTag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No options available for this variant.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={option._id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{option.value || 'Unnamed option'}</span>
                  </div>
                  {isActive ? (
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FiXCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VariantDetail
