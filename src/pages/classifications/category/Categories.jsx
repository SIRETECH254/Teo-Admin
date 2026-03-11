import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetCategories, useDeleteCategory } from '../../../hooks/useCategories'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList } from 'react-icons/fi'
import Pagination from '../../../components/common/Pagination'
import toast from 'react-hot-toast'
import StatusBadge from '../../../components/common/StatusBadge'


const Categories = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [selectedCategories, setSelectedCategories] = useState([])

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

    const { data, isLoading, isError, error } = useGetCategories(params)
    const categories = data?.data?.data?.categories || []
    const pagination = data?.data?.data?.pagination || {}
    const totalItems = pagination.totalCategories || pagination.totalItems || 0
    const totalPages = pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)))
    const [confirmDelete, setConfirmDelete] = useState({ open: false, category: null })
    const navigate = useNavigate()
    const deleteCategory = useDeleteCategory()

    // Handle category selection
    const handleSelectCategory = (categoryId) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    // Handle select all
    const handleSelectAll = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([])
        } else {
            setSelectedCategories(categories.map(cat => cat._id || cat.id))
        }
    }

    const handleEdit = (category) => {
        navigate(`/categories/${category._id || category.id}/edit`)
    }



    const clearSearch = () => {
        setSearchTerm('')
        setCurrentPage(1)
    }

    // Get error message from API response
    const errorMessage = error?.response?.data?.message || 'Failed to load categories.'

    return (
        <div className="p-4">

            <header className="mb-4">

                {/* title */}
                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Categories</h1>
                    <p className="text-gray-600">Manage your product categories</p>
                    </div>
            </div>

                {/* Search Bar and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search categories..."
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
                            to="/categories/add"
                            className="btn-primary inline-flex items-center justify-center w-full sm:w-auto"
                        >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </div>
                </div>

                {/* Product Count and Filters */}
                <div className="flex items-center justify-between">
                    <div className="hidden lg:block">
                        <p className="text-sm text-gray-600">Total {totalItems} categories</p>
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

            {/* Categories Table */}
            {/* Categories Table */}
            <div className="table-container">
                <table className="table">
                    {/* Table header */}
                    <thead className="table-header">
                        <tr>
                            <th className="table-header-cell">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedCategories.length === categories.length && categories.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-primary focus:ring-primary" 
                                            />
                                        </th>
                            <th className="table-header-cell">Category</th>
                            <th className="table-header-cell">Products</th>
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
                                            <div>
                                                <div className="h-4 w-40 animate-pulse rounded bg-gray-300 mb-1" />
                                                <div className="h-3 w-32 animate-pulse rounded bg-gray-300" />
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300" />
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
                                <td colSpan={5} className="table-cell-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FiAlertTriangle className="text-red-500" size={48} />
                                        <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Empty state */}
                        {!isLoading && !isError && categories.length === 0 && (
                            <tr>
                                <td colSpan={5} className="table-cell-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FiGrid className="text-gray-400" size={48} />
                                        <p className="text-sm font-medium text-gray-700">No categories found.</p>
                                        {debouncedSearch || filterStatus !== 'all' ? (
                                            <p className="mt-2 text-sm text-gray-400">
                                                Try adjusting your search or filters.
                                            </p>
                                        ) : (
                                            <Link to="/categories/add" className="mt-4 btn-primary inline-flex items-center">
                                                <FiPlus className="mr-2 h-4 w-4" />
                                                Add Category
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Category rows */}
                        {!isLoading &&
                            !isError &&
                            categories.map((category) => (
                                <tr key={category._id || category.id} className="table-row">
                                    <td className="table-cell">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedCategories.includes(category._id || category.id)}
                                                    onChange={() => handleSelectCategory(category._id || category.id)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary" 
                                                />
                                            </td>
                                    <td className="table-cell">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            <div className="text-sm text-gray-500">{category.slug}</div>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {category.productCount || 0} products
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                                <StatusBadge status={category.status || (category.isActive ? 'active' : 'inactive')} type="category-status" />
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-primary transition hover:bg-primary/10"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete({ open: true, category })}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50"
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
            {selectedCategories.length > 0 && !isLoading && !isError && (
                <div className="mt-4 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                    {selectedCategories.length} of {categories.length} selected
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
                                    currentPageCount={categories.length}
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
                            <h3 className="text-lg font-semibold text-gray-900">Delete category?</h3>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">Are you sure you want to delete "{confirmDelete.category?.name}"? This action cannot be undone.</p>
                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete({ open: false, category: null })}
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await deleteCategory.mutateAsync(confirmDelete.category?._id || confirmDelete.category?.id)
                                        toast.success('Category deleted')
                                    } catch (err) {
                                        toast.error(err.response?.data?.message || 'Failed to delete')
                                    } finally {
                                        setConfirmDelete({ open: false, category: null })
                                    }
                                }}
                                className="btn-primary bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                            >
                                {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Categories 