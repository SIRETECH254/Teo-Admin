import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetVariants, useDeleteVariant } from '../../hooks/useVariants'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList, FiEye } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/common/StatusBadge'


const Variants = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [selectedVariants, setSelectedVariants] = useState([])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    const params = {}
    if (filterStatus === 'active') params.status = 'active'
    if (filterStatus === 'inactive') params.status = 'inactive'
    if (filterStatus === 'all') delete params.status
    if (debouncedSearch) params.search = debouncedSearch
    params.page = currentPage
    params.limit = itemsPerPage

    const { data, isLoading, isError, error } = useGetVariants(params)
    
    // Get error message from API response
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load variants.'
    
    // The API returns { data: { success: true, data: [...], pagination: {...} } }
    const variants = Array.isArray(data?.data?.data) ? data?.data?.data : []
    const pagination = data?.data?.pagination || {}
    const totalItems = pagination.total || 0
    const totalPages = pagination.pages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)))
    const [confirmDelete, setConfirmDelete] = useState({ open: false, variant: null })
    const navigate = useNavigate()
    const deleteVariant = useDeleteVariant()

    // Handle variant selection
    const handleSelectVariant = (variantId) => {
        setSelectedVariants(prev =>
            prev.includes(variantId)
                ? prev.filter(id => id !== variantId)
                : [...prev, variantId]
        )
    }

    // Handle select all
    const handleSelectAll = () => {
        if (selectedVariants.length === variants.length) {
            setSelectedVariants([])
        } else {
            setSelectedVariants(variants.map(variant => variant._id))
        }
    }

    const handleEdit = (variant) => {
        navigate(`/variants/${variant._id}/edit`)
    }



    const clearSearch = () => {
        setSearchTerm('')
        setCurrentPage(1)
    }


    return (
        <div className="p-4">

            <header className="mb-4">

                {/* title */}
                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Variants</h1>
                        <p className="text-gray-600">Manage your product variants and options</p>
                    </div>
                </div>

                {/* Search Bar and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search variants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    aria-label="Clear search"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="sm:w-auto">
                        <Link
                            to="/variants/add"
                            className="btn-primary inline-flex items-center justify-center w-full sm:w-auto"
                        >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Variant
                        </Link>
                    </div>
                </div>

                {/* Product Count and Filters */}
                <div className="flex items-center justify-between">
                    <div className="hidden lg:block">
                        <p className="text-sm text-gray-600">Total {totalItems} variants</p>
                    </div>
                    <div className="flex gap-4">
                        {/* Status Filter */}
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                <option value="all">Status: All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Rows per page */}
                        <div className="relative">
                            <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows per page: {n}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

            </header>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FiAlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error loading variants</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error.message || 'An error occurred while loading variants.'}</p>
                                {import.meta.env.DEV && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer">Error details</summary>
                                        <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                                            {JSON.stringify(error, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Variants Table */}
            <div className="table-container">
                <table className="table">
                    {/* Table header */}
                    <thead className="table-header">
                        <tr>
                            <th className="table-header-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedVariants.length === variants.length && variants.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </th>
                            <th className="table-header-cell">Variant</th>
                            <th className="table-header-cell">Options</th>
                            <th className="table-header-cell">Type</th>
                            <th className="table-header-cell">Status</th>
                            <th className="table-header-cell-right">Actions</th>
                        </tr>
                    </thead>

                    {/* Table body */}
                    <tbody className="table-body">
                        {/* Loading state: skeleton rows */}
                        {isLoading && (
                            <>
                                {[...Array(5)].map((_, index) => (
                                    <tr key={`skeleton-${index}`}>
                                        <td className="table-cell">
                                            <div className="h-4 w-4 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                                                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}

                        {/* Error state */}
                        {isError && !isLoading && (
                            <tr>
                                <td colSpan={6} className="table-cell-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FiAlertTriangle className="text-red-500" size={48} />
                                        <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Empty state */}
                        {!isLoading && !isError && variants.length === 0 && (
                            <tr>
                                <td colSpan={6} className="table-cell-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FiGrid className="text-gray-400" size={48} />
                                        <p className="text-sm font-medium text-gray-700">No variants found.</p>
                                        {debouncedSearch || filterStatus !== 'all' ? (
                                            <p className="mt-2 text-sm text-gray-400">
                                                Try adjusting your search or filters.
                                            </p>
                                        ) : (
                                            <Link to="/variants/add" className="mt-4 btn-primary inline-flex items-center">
                                                <FiPlus className="mr-2 h-4 w-4" />
                                                Add Variant
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Variant rows */}
                        {!isLoading &&
                            !isError &&
                            variants.map((variant) => (
                                <tr key={variant._id} className="table-row">
                                    <td className="table-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedVariants.includes(variant._id)}
                                            onChange={() => handleSelectVariant(variant._id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="table-cell-text font-medium text-gray-900">
                                        {variant.name}
                                    </td>
                                    <td className="table-cell">
                                        <div className="text-sm text-gray-900">
                                            {variant.options?.length || 0} options
                                        </div>
                                        {variant.options?.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {variant.options.slice(0, 3).map(opt => opt.value).join(', ')}
                                                {variant.options.length > 3 && ` +${variant.options.length - 3} more`}
                                            </div>
                                        )}
                                    </td>
                                    <td className="table-cell-text">
                                        Simple
                                    </td>
                                    <td className="table-cell">
                                        <StatusBadge status={variant.isActive !== false ? 'active' : 'inactive'} type="variant-status" />
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/variants/${variant._id}`)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                                                title="View variant details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(variant)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-primary transition hover:bg-primary/10"
                                                title="Edit variant"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete({ open: true, variant })}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50"
                                                title="Delete variant"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Selection Info */}
            {selectedVariants.length > 0 && !isLoading && !isError && (
                <div className="mt-4 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                        {selectedVariants.length} of {variants.length} selected
                    </p>
                </div>
            )}

            {/* Pagination - separate from table container */}
            {!isLoading && !isError && totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={pagination.currentPage || currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                        totalItems={totalItems}
                        pageSize={itemsPerPage}
                        currentPageCount={variants.length}
                        align="center"
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete.open && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <FiAlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete variant?</h3>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">Are you sure you want to delete "{confirmDelete.variant?.name}"? This action cannot be undone.</p>
                            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    onClick={() => setConfirmDelete({ open: false, variant: null })}
                                    className="btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await deleteVariant.mutateAsync(confirmDelete.variant?._id || confirmDelete.variant?.id)
                                            toast.success('Variant deleted successfully')
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || 'Failed to delete variant')
                                        } finally {
                                            setConfirmDelete({ open: false, variant: null })
                                        }
                                    }}
                                    className="btn-primary bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                                >
                                    {deleteVariant.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default Variants