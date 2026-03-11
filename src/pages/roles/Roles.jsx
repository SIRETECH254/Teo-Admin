import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit, FiSearch, FiFilter, FiX, FiList, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import { useGetRoles, useDeleteRole } from '../../hooks/useRoles'


const Roles = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterActive, setFilterActive] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedRoles, setSelectedRoles] = useState([])
    const [confirmDelete, setConfirmDelete] = useState({ open: false, role: null })

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    const params = useMemo(() => {
        const p = {}
        if (debouncedSearch) p.search = debouncedSearch
        if (filterActive !== 'all') p.isActive = filterActive === 'active'
        p.page = currentPage
        p.limit = itemsPerPage
        return p
    }, [debouncedSearch, filterActive, currentPage, itemsPerPage])

    const { data, isLoading: loading, isError, error } = useGetRoles(params)
    
    // Get error message from API response
    const errorMessage = error?.response?.data?.message || 'Failed to load roles.'
    const deleteRole = useDeleteRole()

    const roles = useMemo(() => data?.data?.roles || [], [data])
    const pagination = useMemo(() => data?.data?.pagination || {}, [data])
    const totalItems = useMemo(() => pagination.total || roles.length, [pagination, roles.length])
    const totalPages = useMemo(() => pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1))), [pagination.totalPages, totalItems, itemsPerPage])

    const handleSelect = (id) => {
        setSelectedRoles((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
    const handleSelectAll = () => {
        setSelectedRoles((prev) => prev.length === roles.length ? [] : roles.map(r => r._id))
    }

    const clearSearch = () => { setSearchTerm(''); setCurrentPage(1) }
    const clearFilters = () => { setFilterActive('all'); setCurrentPage(1) }

    const onDelete = (role) => setConfirmDelete({ open: true, role })
    const confirmDeleteRole = async () => {
        try {
            await deleteRole.mutateAsync(confirmDelete.role._id)
            setConfirmDelete({ open: false, role: null })
        } catch {}
    }


    return (
        <div className="p-4">

            {confirmDelete.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Role</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{confirmDelete.role?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setConfirmDelete({ open: false, role: null })} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={confirmDeleteRole} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-4">
                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Roles</h1>
                        <p className="text-gray-600">Manage application roles</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input type="text" placeholder="Search roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                            {searchTerm && (
                                <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="sm:w-auto">
                        <Link to="/roles/add" className="btn-primary inline-flex items-center justify-center w-full sm:w-auto">
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Role
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <p className="text-sm text-gray-600">Total {totalItems} roles</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
                                <option value="all">Status: All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="relative">
                            <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
                                {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
                            </select>
                        </div>
                        {(filterActive !== 'all') && (
                            <button onClick={clearFilters} className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                                <FiX className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Roles Table */}
            <div className="table-container">
                <table className="table">
                    {/* Table header */}
                    <thead className="table-header">
                        <tr>
                            <th className="table-header-cell">
                                <input type="checkbox" checked={selectedRoles.length === roles.length && roles.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 text-primary focus:ring-primary" />
                            </th>
                            <th className="table-header-cell">Role</th>
                            <th className="table-header-cell">Description</th>
                            <th className="table-header-cell">Status</th>
                            <th className="table-header-cell-right">Actions</th>
                        </tr>
                    </thead>

                    {/* Table body */}
                    <tbody className="table-body">
                        {/* Loading state: skeleton rows */}
                        {loading && (
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
                                            <div className="h-4 w-72 animate-pulse rounded bg-gray-300" />
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
                        {isError && !loading && (
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
                        {!loading && !isError && roles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="table-cell-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FiAlertTriangle className="text-gray-400" size={48} />
                                        <p className="text-sm font-medium text-gray-700">No roles found.</p>
                                        {debouncedSearch || filterActive !== 'all' ? (
                                            <p className="mt-2 text-sm text-gray-400">
                                                Try adjusting your search or filters.
                                            </p>
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Role rows */}
                        {!loading &&
                            !isError &&
                            roles.map((role) => (
                                <tr key={role._id} className="table-row">
                                    <td className="table-cell">
                                        <input type="checkbox" checked={selectedRoles.includes(role._id)} onChange={() => handleSelect(role._id)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    </td>
                                    <td className="table-cell-text font-medium text-gray-900">
                                        {role.name}
                                    </td>
                                    <td className="table-cell-text">
                                        {role.description || '—'}
                                    </td>
                                    <td className="table-cell">
                                        <StatusBadge status={role.isActive ? 'active' : 'inactive'} />
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/roles/${role._id}/edit`}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-primary transition hover:bg-primary/10"
                                                title="Edit role"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => onDelete(role)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50"
                                                title="Delete role"
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
            {selectedRoles.length > 0 && !loading && !isError && (
                <div className="mt-4 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">{selectedRoles.length} of {roles.length} selected</p>
                    </div>
                )}

            {/* Pagination - separate from table container */}
            {!loading && !isError && totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={pagination.currentPage || currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                        totalItems={totalItems}
                        pageSize={itemsPerPage}
                        currentPageCount={roles.length}
                    />
                    </div>
                )}
        </div>
    )
}


export default Roles 

