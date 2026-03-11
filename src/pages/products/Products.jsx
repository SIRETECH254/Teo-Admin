import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetProducts, useDeleteProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'

import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiPackage, FiAlertTriangle, FiX, FiList, FiImage, FiGrid, FiEye } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'

import StatusBadge from '../../components/common/StatusBadge'

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterBrand, setFilterBrand] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [confirmDelete, setConfirmDelete] = useState({ open: false, product: null })

    const navigate = useNavigate()
    const deleteProduct = useDeleteProduct()

    // Debounce search term
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    // Memoize API parameters to prevent unnecessary re-renders
    const params = useMemo(() => {
        const p = {}
        if (filterStatus === 'active') p.status = 'active'
        if (filterStatus === 'draft') p.status = 'draft'
        if (filterStatus === 'archived') p.status = 'archived'
        if (filterBrand !== 'all') p.brand = filterBrand
        if (filterCategory !== 'all') p.category = filterCategory
        if (debouncedSearch) p.search = debouncedSearch
        p.page = currentPage
        p.limit = itemsPerPage
        return p
    }, [filterStatus, filterBrand, filterCategory, debouncedSearch, currentPage, itemsPerPage])

    const { data, isLoading, isError, error } = useGetProducts(params)
    const { data: brandsData } = useGetBrands({ limit: 100 })
    const { data: categoriesData } = useGetCategories({ limit: 100 })

    // Memoize processed data to avoid re-computations
    const products = useMemo(() => data?.data || [], [data])
    const pagination = useMemo(() => data?.pagination || {}, [data])
    const totalItems = useMemo(() =>
        pagination.totalDocs || pagination.totalProducts || pagination.totalItems || products.length,
        [pagination, products.length]
    )
    const totalPages = useMemo(() =>
        pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1))),
        [pagination.totalPages, totalItems, itemsPerPage]
    )
    const brands = useMemo(() => brandsData?.data?.data?.brands || [], [brandsData])
    const categories = useMemo(() => categoriesData?.data?.data?.categories || [], [categoriesData])


    // Memoize event handlers to prevent unnecessary re-renders
    const handleSelectProduct = useCallback((productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }, [])

    // Memoize select all handler with products dependency
    const handleSelectAll = useCallback(() => {
        setSelectedProducts(prev => {
            if (prev.length === products.length) {
                return []
            } else {
                return products.map(prod => prod._id || prod.id)
            }
        })
    }, [products])

    const handleEdit = useCallback((product) => {
        navigate(`/products/${product._id || product.id}/edit`)
    }, [navigate])

    const handleViewDetails = useCallback((product) => {
        navigate(`/products/${product._id || product.id}/details`)
    }, [navigate])

    const handleDelete = useCallback((product) => {
        setConfirmDelete({ open: true, product })
    }, [])

    const confirmDeleteProduct = useCallback(async () => {
        try {
            await deleteProduct.mutateAsync(confirmDelete.product._id || confirmDelete.product.id)
            setConfirmDelete({ open: false, product: null })
        } catch (error) {
            console.error('Delete error:', error)
        }
    }, [confirmDelete.product, deleteProduct])

    const clearSearch = useCallback(() => {
        setSearchTerm('')
        setCurrentPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setFilterStatus('all')
        setFilterBrand('all')
        setFilterCategory('all')
        setCurrentPage(1)
    }, [])

    // Get error message from API response
    const errorMessage = error?.response?.data?.message || 'Failed to load products.'

    return (
        <div className="p-4">

            {/* Delete Confirmation Modal */}
            {confirmDelete.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{confirmDelete.product?.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDelete({ open: false, product: null })}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={deleteProduct.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteProduct}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                disabled={deleteProduct.isPending}
                            >
                                {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-4">

                {/* Title */}
                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Products</h1>
                        <p className="text-gray-600">Manage your product catalog with variants and SKUs</p>
                    </div>
                </div>

                {/* Search Bar and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search products..."
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
                            to="/products/add"
                            className="btn-primary inline-flex items-center justify-center w-full sm:w-auto"
                        >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Product Count and Filters */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <p className="text-sm text-gray-600">Total {totalItems} products</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Brand Filter */}
                        <div className="relative">
                            <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={filterBrand}
                                onChange={(e) => setFilterBrand(e.target.value)}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                <option value="all">Brand: All</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <FiGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                <option value="all">Category: All</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>{category.name}</option>
                                ))}
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
                                {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(filterStatus !== 'all' || filterBrand !== 'all' || filterCategory !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                            >
                                <FiX className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Products Table */}
            <div className="table-container">
                <table className="table">
                    {/* Table header */}
                    <thead className="table-header">
                        <tr>
                            <th className="table-header-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.length === products.length && products.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </th>
                            <th className="table-header-cell">
                                Product
                            </th>
                            <th className="table-header-cell">
                                Brand
                            </th>
                            <th className="table-header-cell">
                                Price
                            </th>
                            <th className="table-header-cell">
                                Status
                            </th>
                            <th className="table-header-cell-right">
                                Actions
                            </th>
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
                                            <div className="table-cell-content">
                                                <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-300" />
                                                <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-16 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-12 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
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
                        {!isLoading && !isError && products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="table-cell-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FiPackage className="text-gray-400" size={48} />
                                        <p className="text-sm font-medium text-gray-700">No products found.</p>
                                        {debouncedSearch || filterStatus !== 'all' || filterBrand !== 'all' || filterCategory !== 'all' ? (
                                            <p className="mt-2 text-sm text-gray-400">
                                                Try adjusting your search or filters.
                                            </p>
                                        ) : (
                                            <Link to="/products/add" className="mt-4 btn-primary inline-flex items-center">
                                                <FiPlus className="mr-2 h-4 w-4" />
                                                Add Product
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Product rows */}
                        {!isLoading &&
                            !isError &&
                            products.map((product) => (
                                <tr key={product._id || product.id} className="table-row">
                                    <td className="table-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id || product.id)}
                                            onChange={() => handleSelectProduct(product._id || product.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="table-cell">
                                        <div className="table-cell-content">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                                                    alt={product.title}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <FiImage className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                        </div>
                                    </td>
                                    <td className="table-cell-text">
                                        {typeof product.brand === 'object' && product.brand?.name 
                                            ? product.brand.name 
                                            : brands.find(brand => brand._id === product.brand)?.name || 'No brand'}
                                    </td>
                                    <td className="table-cell-text">
                                        <div className="text-sm text-gray-900">
                                            KES {product.basePrice?.toLocaleString() || '0'}
                                        </div>
                                        {product.comparePrice && (
                                            <div className="text-xs text-gray-500 line-through">
                                                KES {product.comparePrice.toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="table-cell">
                                        <StatusBadge status={product.status || 'draft'} type="product-status" />
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(product)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                                                title="View product details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-primary transition hover:bg-primary/10"
                                                title="Edit product"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50"
                                                title="Delete product"
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
            {selectedProducts.length > 0 && !isLoading && !isError && (
                <div className="mt-4 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                        {selectedProducts.length} of {products.length} selected
                    </p>
                </div>
            )}

            {/* Pagination - separate from table container */}
            {!isLoading && !isError && totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={pagination.page || currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                        totalItems={totalItems}
                        pageSize={itemsPerPage}
                        currentPageCount={products.length}
                    />
                </div>
            )}
        </div>
    )
}

export default Products 