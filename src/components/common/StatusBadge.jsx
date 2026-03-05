import React from 'react'
import {
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiAlertCircle,
    FiShield,
    FiArchive,
    FiEdit,
    FiPackage,
    FiTruck,
    FiCreditCard,
    FiHelpCircle,
    FiStar,
    FiTag,
    FiRotateCcw,
    FiDollarSign,
} from 'react-icons/fi'

/**
 * StatusBadge component for displaying status badges with icons
 * 
 * @param {string|boolean} status - The status string (e.g., 'active', 'draft', 'PENDING', 'approved')
 * @param {string} [type] - The type of badge (optional, for backward compatibility)
 * @param {string} [className] - Optional additional className
 */
const StatusBadge = ({
    status,
    type,
    className = '',
}) => {
    /**
     * Get icon component based on status and type
     */
    const getIcon = (status, badgeType) => {
        if (!badgeType) {
            // Backward compatibility: no icon for simple status
            return null
        }

        const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase()

        switch (badgeType) {
            case 'product-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'DRAFT':
                        return <FiEdit className="h-3 w-3" />
                    case 'ARCHIVED':
                        return <FiArchive className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'user-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                    case 'FALSE':
                        return <FiXCircle className="h-3 w-3" />
                    case 'VERIFIED':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'UNVERIFIED':
                        return <FiClock className="h-3 w-3" />
                    case 'ADMIN':
                        return <FiShield className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'coupon-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                        return <FiXCircle className="h-3 w-3" />
                    case 'EXPIRED':
                        return <FiAlertCircle className="h-3 w-3" />
                    case 'LIMIT-REACHED':
                    case 'LIMIT_REACHED':
                        return <FiAlertCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'category-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                    case 'FALSE':
                        return <FiXCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'brand-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                    case 'FALSE':
                        return <FiXCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'tag-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                    case 'FALSE':
                        return <FiXCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'collection-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                    case 'FALSE':
                        return <FiXCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'variant-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                    case 'FALSE':
                        return <FiXCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'review-status':
                switch (upperStatus) {
                    case 'APPROVED':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'PENDING':
                    case 'FALSE':
                        return <FiClock className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'packaging-status':
                switch (upperStatus) {
                    case 'ACTIVE':
                    case 'TRUE':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'INACTIVE':
                    case 'FALSE':
                        return <FiXCircle className="h-3 w-3" />
                    case 'DEFAULT':
                        return <FiTag className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'invoice-status':
                switch (upperStatus) {
                    case 'PENDING':
                        return <FiClock className="h-3 w-3" />
                    case 'PAID':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'CANCELLED':
                        return <FiXCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'delivery-status':
                switch (upperStatus) {
                    case 'ASSIGNED':
                        return <FiPackage className="h-3 w-3" />
                    case 'PICKED':
                        return <FiTruck className="h-3 w-3" />
                    case 'DELIVERED':
                        return <FiCheckCircle className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'order-status':
                switch (upperStatus) {
                    case 'PLACED':
                        return <FiClock className="h-3 w-3" />
                    case 'CONFIRMED':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'PACKED':
                        return <FiPackage className="h-3 w-3" />
                    case 'SHIPPED':
                        return <FiTruck className="h-3 w-3" />
                    case 'OUT_FOR_DELIVERY':
                        return <FiTruck className="h-3 w-3" />
                    case 'DELIVERED':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'CANCELLED':
                        return <FiXCircle className="h-3 w-3" />
                    case 'REFUNDED':
                        return <FiRotateCcw className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            case 'payment-status':
                switch (upperStatus) {
                    case 'UNPAID':
                        return <FiDollarSign className="h-3 w-3" />
                    case 'PENDING':
                        return <FiClock className="h-3 w-3" />
                    case 'PAID':
                        return <FiCheckCircle className="h-3 w-3" />
                    case 'PARTIALLY_REFUNDED':
                        return <FiRotateCcw className="h-3 w-3" />
                    case 'REFUNDED':
                        return <FiRotateCcw className="h-3 w-3" />
                    default:
                        return <FiHelpCircle className="h-3 w-3" />
                }

            default:
                return <FiHelpCircle className="h-3 w-3" />
        }
    }

    /**
     * Get status variant (background and text colors) based on status and type
     */
    const getStatusVariant = (status, badgeType) => {
        // Backward compatibility: use simple logic if no type provided
        if (!badgeType) {
            const statusLower = (typeof status === 'string' ? status : String(status)).toLowerCase()
        switch (statusLower) {
            case 'active':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-800',
                        iconColor: '#16A34A',
                    }
            case 'inactive':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-800',
                        iconColor: '#DC2626',
                    }
            case 'expired':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-800',
                        iconColor: '#DC2626',
                    }
            case 'limit-reached':
                    return {
                        bg: 'bg-orange-100',
                        text: 'text-orange-800',
                        iconColor: '#EA580C',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-800',
                        iconColor: '#4B5563',
                    }
            }
        }

        const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase()

        if (badgeType === 'product-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'DRAFT':
                    return {
                        bg: 'bg-yellow-100',
                        text: 'text-yellow-700',
                        iconColor: '#CA8A04',
                    }
                case 'ARCHIVED':
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'user-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                case 'FALSE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                case 'VERIFIED':
                    return {
                        bg: 'bg-blue-100',
                        text: 'text-blue-700',
                        iconColor: '#2563EB',
                    }
                case 'UNVERIFIED':
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
                case 'ADMIN':
                    return {
                        bg: 'bg-purple-100',
                        text: 'text-purple-700',
                        iconColor: '#7C3AED',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'coupon-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                case 'EXPIRED':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                case 'LIMIT-REACHED':
                case 'LIMIT_REACHED':
                    return {
                        bg: 'bg-orange-100',
                        text: 'text-orange-700',
                        iconColor: '#EA580C',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'category-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                case 'FALSE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'brand-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                case 'FALSE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'tag-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                case 'FALSE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'collection-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                case 'FALSE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'variant-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                case 'FALSE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'review-status') {
            switch (upperStatus) {
                case 'APPROVED':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'PENDING':
                case 'FALSE':
                    return {
                        bg: 'bg-yellow-100',
                        text: 'text-yellow-700',
                        iconColor: '#CA8A04',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'packaging-status') {
            switch (upperStatus) {
                case 'ACTIVE':
                case 'TRUE':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'INACTIVE':
                case 'FALSE':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                case 'DEFAULT':
                    return {
                        bg: 'bg-blue-100',
                        text: 'text-blue-700',
                        iconColor: '#2563EB',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'invoice-status') {
            switch (upperStatus) {
                case 'PENDING':
                    return {
                        bg: 'bg-yellow-100',
                        text: 'text-yellow-700',
                        iconColor: '#CA8A04',
                    }
                case 'PAID':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                case 'CANCELLED':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-700',
                        iconColor: '#DC2626',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'delivery-status') {
            switch (upperStatus) {
                case 'ASSIGNED':
                    return {
                        bg: 'bg-blue-100',
                        text: 'text-blue-700',
                        iconColor: '#2563EB',
                    }
                case 'PICKED':
                    return {
                        bg: 'bg-yellow-100',
                        text: 'text-yellow-700',
                        iconColor: '#CA8A04',
                    }
                case 'DELIVERED':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-700',
                        iconColor: '#16A34A',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'order-status') {
            switch (upperStatus) {
                case 'PLACED':
                    return {
                        bg: 'bg-sky-100',
                        text: 'text-sky-800',
                        iconColor: '#0284C7',
                    }
                case 'CONFIRMED':
                    return {
                        bg: 'bg-blue-100',
                        text: 'text-blue-800',
                        iconColor: '#2563EB',
                    }
                case 'PACKED':
                    return {
                        bg: 'bg-indigo-100',
                        text: 'text-indigo-800',
                        iconColor: '#4F46E5',
                    }
                case 'SHIPPED':
                    return {
                        bg: 'bg-purple-100',
                        text: 'text-purple-800',
                        iconColor: '#7C3AED',
                    }
                case 'OUT_FOR_DELIVERY':
                    return {
                        bg: 'bg-amber-100',
                        text: 'text-amber-800',
                        iconColor: '#F59E0B',
                    }
                case 'DELIVERED':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-800',
                        iconColor: '#16A34A',
                    }
                case 'CANCELLED':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-800',
                        iconColor: '#DC2626',
                    }
                case 'REFUNDED':
                    return {
                        bg: 'bg-rose-100',
                        text: 'text-rose-800',
                        iconColor: '#E11D48',
                    }
                default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        if (badgeType === 'payment-status') {
            switch (upperStatus) {
                case 'UNPAID':
                    return {
                        bg: 'bg-violet-100',
                        text: 'text-violet-800',
                        iconColor: '#7C3AED',
                    }
                case 'PENDING':
                    return {
                        bg: 'bg-yellow-100',
                        text: 'text-yellow-800',
                        iconColor: '#CA8A04',
                    }
                case 'PAID':
                    return {
                        bg: 'bg-green-100',
                        text: 'text-green-800',
                        iconColor: '#16A34A',
                    }
                case 'PARTIALLY_REFUNDED':
                    return {
                        bg: 'bg-orange-100',
                        text: 'text-orange-800',
                        iconColor: '#EA580C',
                    }
                case 'REFUNDED':
                    return {
                        bg: 'bg-red-100',
                        text: 'text-red-800',
                        iconColor: '#DC2626',
                    }
            default:
                    return {
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                        iconColor: '#4B5563',
                    }
            }
        }

        return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563',
        }
    }

    /**
     * Format status text for display
     */
    const formatStatus = (status, badgeType) => {
        // Backward compatibility: use simple formatting if no type provided
        if (!badgeType) {
            const statusLower = (typeof status === 'string' ? status : String(status)).toLowerCase()
            switch (statusLower) {
                case 'active':
                    return 'Active'
                case 'inactive':
                    return 'Inactive'
                case 'expired':
                    return 'Expired'
                case 'limit-reached':
                    return 'Limit Reached'
                default:
                    return typeof status === 'string' ? status : 'Unknown'
            }
        }

        // Handle boolean values
        if (typeof status === 'boolean') {
            if (badgeType === 'user-status' || badgeType === 'packaging-status') {
                return status ? 'Active' : 'Inactive'
            }
            if (badgeType === 'category-status') {
                return status ? 'Active' : 'Inactive'
            }
            if (badgeType === 'brand-status') {
                return status ? 'Active' : 'Inactive'
            }
            if (badgeType === 'tag-status') {
                return status ? 'Active' : 'Inactive'
            }
            if (badgeType === 'collection-status') {
                return status ? 'Active' : 'Inactive'
            }
            if (badgeType === 'variant-status') {
                return status ? 'Active' : 'Inactive'
            }
            if (badgeType === 'review-status') {
                return status ? 'Approved' : 'Pending'
            }
        }

        const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase()
        const statusStr = typeof status === 'string' ? status : String(status)

        // Handle order-status specific formatting
        if (badgeType === 'order-status') {
            switch (upperStatus) {
                case 'PLACED':
                    return 'Placed'
                case 'CONFIRMED':
                    return 'Confirmed'
                case 'PACKED':
                    return 'Packed'
                case 'SHIPPED':
                    return 'Shipped'
                case 'OUT_FOR_DELIVERY':
                    return 'Out for delivery'
                case 'DELIVERED':
                    return 'Delivered'
                case 'CANCELLED':
                    return 'Cancelled'
                case 'REFUNDED':
                    return 'Refunded'
                default:
                    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
            }
        }

        // Handle payment-status specific formatting
        if (badgeType === 'payment-status') {
            switch (upperStatus) {
                case 'UNPAID':
                    return 'Unpaid'
                case 'PENDING':
                    return 'Pending'
                case 'PAID':
                    return 'Paid'
                case 'PARTIALLY_REFUNDED':
                    return 'Partially Refunded'
                case 'REFUNDED':
                    return 'Refunded'
                default:
                    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
            }
        }

        // Replace underscores with spaces and capitalize
        return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
    }

    const variant = getStatusVariant(status, type)
    const icon = getIcon(status, type)

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap font-medium ${variant.bg} ${variant.text} ${className}`}
        >
            {icon && <span style={{ color: variant.iconColor }}>{icon}</span>}
            <span>{formatStatus(status, type)}</span>
        </span>
    )
}

export default StatusBadge

