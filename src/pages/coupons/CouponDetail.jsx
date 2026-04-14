import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
    FiArrowLeft, 
    FiEdit2, 
    FiTrash2, 
    FiRefreshCw, 
    FiTag, 
    FiCalendar, 
    FiUsers, 
    FiInfo, 
    FiCheckCircle, 
    FiXCircle, 
    FiAlertTriangle,
    FiClock,
    FiUser
} from 'react-icons/fi'
import { useGetCouponById, useDeleteCoupon, useGenerateNewCode } from '../../hooks/useCoupons'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

const CouponDetail = () => {
    const { couponId } = useParams()
    const navigate = useNavigate()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Data fetching
    const { 
        data: couponData, 
        isLoading, 
        isError, 
        error, 
        refetch 
    } = useGetCouponById(couponId)
    
    const deleteCouponMutation = useDeleteCoupon()
    const generateNewCodeMutation = useGenerateNewCode()

    const coupon = couponData?.data || null
    const usageHistory = coupon?.lastUsedBy || []

    // Handlers
    const handleDelete = async () => {
        try {
            await deleteCouponMutation.mutateAsync(couponId)
            navigate('/coupons')
        } catch (err) {
            // Error handled by hook
        }
    }

    const handleGenerateNewCode = async () => {
        try {
            await generateNewCodeMutation.mutateAsync(couponId)
            refetch()
        } catch (err) {
            // Error handled by hook
        }
    }

    // Helpers
    const formatValue = (type, value) => {
        if (type === 'percentage') return `${value}%`
        return `KSH ${value.toLocaleString()}`
    }

    const getCouponStatus = (coupon) => {
        if (!coupon.isActive) return 'inactive'
        if (coupon.isExpired) return 'expired'
        if (coupon.isUsageLimitReached) return 'limit-reached'
        return 'active'
    }

    // Loading State
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Error State
    if (isError) {
        return (
            <div className="p-6 text-center">
                <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Failed to load coupon</h2>
                <p className="text-gray-600 mt-2">{error?.response?.data?.message || 'Please try again later'}</p>
                <button 
                    onClick={() => navigate('/coupons')}
                    className="mt-6 btn-primary"
                >
                    Back to Coupons
                </button>
            </div>
        )
    }

    if (!coupon) return null

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/coupons')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">{coupon.code}</h1>
                            <StatusBadge status={getCouponStatus(coupon)} type="coupon-status" />
                        </div>
                        <p className="text-gray-600 mt-1">{coupon.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerateNewCode}
                        disabled={generateNewCodeMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <FiRefreshCw className={`h-4 w-4 ${generateNewCodeMutation.isPending ? 'animate-spin' : ''}`} />
                        Regenerate Code
                    </button>
                    <Link
                        to={`/coupons/${couponId}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Edit
                    </Link>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <FiTrash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Summary Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <FiInfo className="text-primary h-5 w-5" />
                            <h2 className="font-semibold text-gray-900">Description & Details</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 leading-relaxed">
                                {coupon.description || 'No description provided for this coupon.'}
                            </p>
                            
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium mb-1">Discount Type</p>
                                    <p className="text-lg font-bold text-blue-900 capitalize">{coupon.discountType}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-green-50/50 border border-green-100">
                                    <p className="text-sm text-green-600 font-medium mb-1">Discount Value</p>
                                    <p className="text-lg font-bold text-green-900">{formatValue(coupon.discountType, coupon.discountValue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage History */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FiUsers className="text-primary h-5 w-5" />
                                <h2 className="font-semibold text-gray-900">Usage History</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {usageHistory.length} total uses
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Used At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {usageHistory.length > 0 ? (
                                        usageHistory.map((usage, idx) => (
                                            <tr key={usage._id || idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                            <FiUser className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{usage.user?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {usage.user?.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm">
                                                    {new Date(usage.usedAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                                No usage history recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FiTag className="text-primary" />
                            Usage Stats
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-gray-500">Usage Count</span>
                                <span className="font-bold text-gray-900">{coupon.usedCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-gray-500">Usage Limit</span>
                                <span className="font-bold text-gray-900">
                                    {coupon.hasUsageLimit ? coupon.usageLimit : '∞ Unlimited'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-gray-500">Remaining</span>
                                <span className="font-bold text-primary">
                                    {coupon.hasUsageLimit ? Math.max(0, coupon.usageLimit - coupon.usedCount) : '∞'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-500">First Time Only</span>
                                {coupon.isFirstTimeOnly ? (
                                    <FiCheckCircle className="text-green-500 h-5 w-5" />
                                ) : (
                                    <FiXCircle className="text-gray-300 h-5 w-5" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Expiry Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FiCalendar className="text-primary" />
                            Schedule & Expiry
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Created At</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {new Date(coupon.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Expiry Date</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {coupon.hasExpiry ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}
                                </span>
                            </div>
                            {coupon.hasExpiry && !coupon.isExpired && (
                                <div className="mt-4 p-3 bg-orange-50 rounded-lg flex items-center gap-3">
                                    <FiClock className="text-orange-600" />
                                    <div className="text-xs">
                                        <p className="font-semibold text-orange-900">Active until</p>
                                        <p className="text-orange-700">{new Date(coupon.expiryDate).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Restrictions */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">Min/Max Restrictions</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Minimum Order Amount</p>
                                <p className="font-medium text-gray-900">
                                    {coupon.minimumOrderAmount > 0 ? `KSH ${coupon.minimumOrderAmount.toLocaleString()}` : 'No Minimum'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Maximum Discount Amount</p>
                                <p className="font-medium text-gray-900">
                                    {coupon.maximumDiscountAmount ? `KSH ${coupon.maximumDiscountAmount.toLocaleString()}` : 'No Maximum'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Delete Coupon?
                        </h3>
                        <p className="text-gray-600 text-center mb-8">
                            This will permanently remove <span className="font-bold">{coupon.code}</span>. 
                            Users will no longer be able to apply this coupon. This action cannot be undone.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteCouponMutation.isPending}
                                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteCouponMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CouponDetail 