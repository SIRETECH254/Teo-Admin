import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetUsers } from '../../hooks/useUsers'
import { useGetRoles } from '../../hooks/useRoles'
import { FiPlus, FiEdit, FiSearch, FiFilter, FiUsers, FiX, FiList, FiImage, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import { useDeleteUser } from '../../hooks/useUsers'


const Customers = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // active | inactive | verified | unverified | all
    const [filterRole, setFilterRole] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [confirmDelete, setConfirmDelete] = useState({ open: false, user: null })

    const navigate = useNavigate()

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    // Params mapping to backend
    const params = useMemo(() => {
        const p = {}
        if (debouncedSearch) p.search = debouncedSearch
        if (filterRole !== 'all') p.role = filterRole
        if (filterStatus !== 'all') p.status = filterStatus
        p.page = currentPage
        p.limit = itemsPerPage
        return p
    }, [debouncedSearch, filterRole, filterStatus, currentPage, itemsPerPage])

    const { data, isLoading, isError, error } = useGetUsers(params)
    const { data: rolesData } = useGetRoles({ limit: 100 })

    // Normalized data
    const users = useMemo(() => data?.data?.users || [], [data])
    const pagination = useMemo(() => data?.data?.pagination || {}, [data])
    const totalItems = useMemo(() => pagination.totalUsers || users.length, [pagination, users.length])
    const totalPages = useMemo(() => pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1))), [pagination.totalPages, totalItems, itemsPerPage])

    // Handlers
    const handleSelectUser = useCallback((userId) => {
        setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId])
    }, [])

    const handleSelectAll = useCallback(() => {
        setSelectedUsers(prev => {
            if (prev.length === users.length) return []
            return users.map(u => u._id || u.id)
        })
    }, [users])

    const handleEdit = useCallback((user) => {
        navigate(`/customers/${user._id || user.id}/edit`)
    }, [navigate])

    const deleteUser = useDeleteUser()
    const handleDelete = useCallback((user) => {
        setConfirmDelete({ open: true, user })
    }, [])
    const confirmDeleteUser = useCallback(async () => {
        try {
            await deleteUser.mutateAsync(confirmDelete.user._id || confirmDelete.user.id)
            setConfirmDelete({ open: false, user: null })
        } catch (e) {
            // handled by hook
        }
    }, [confirmDelete.user, deleteUser])

    const clearSearch = useCallback(() => {
        setSearchTerm('')
        setCurrentPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setFilterStatus('all')
        setFilterRole('all')
        setCurrentPage(1)
    }, [])

    // Get error message from API response
    const errorMessage = error?.response?.data?.message || 'Failed to load users.'

    return (
        <div className="p-4">

            {confirmDelete.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{confirmDelete.user?.name || confirmDelete.user?.email}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDelete({ open: false, user: null })}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={deleteUser.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                disabled={deleteUser.isPending}
                            >
                                {deleteUser.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-4">

                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Customers</h1>
                        <p className="text-gray-600">Manage your customers and their roles</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search users..."
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
                            to="/customers/new"
                            className="btn-primary inline-flex items-center justify-center w-full sm:w-auto"
                        >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <p className="text-sm text-gray-600">Total {totalItems} users</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>

                        <div className="relative">
                            <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                <option value="all">Role: All</option>
                                {(rolesData?.data?.roles || []).map(role => (
                                    <option key={role._id} value={role._id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

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

                        {(filterStatus !== 'all' || filterRole !== 'all') && (
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

            {/* Users Table */}
            <div className="table-container">
                <table className="table">
                    {/* Table header */}
                    <thead className="table-header">
                        <tr>
                            <th className="table-header-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </th>
                            <th className="table-header-cell">User</th>
                            <th className="table-header-cell">Email</th>
                            <th className="table-header-cell">Roles</th>
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
                                            <div className="table-cell-content">
                                                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300" />
                                                <div>
                                                    <div className="h-4 w-40 animate-pulse rounded bg-gray-300 mb-1" />
                                                    <div className="h-3 w-24 animate-pulse rounded bg-gray-300" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
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
                        {!isLoading && !isError && users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="table-cell-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FiUsers className="text-gray-400" size={48} />
                                        <p className="text-sm font-medium text-gray-700">No users found.</p>
                                        {debouncedSearch || filterStatus !== 'all' || filterRole !== 'all' ? (
                                            <p className="mt-2 text-sm text-gray-400">
                                                Try adjusting your search or filters.
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-sm text-gray-400">
                                                Users will appear here once they register.
                                            </p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* User rows */}
                        {!isLoading &&
                            !isError &&
                            users.map((user) => (
                                <tr key={user._id || user.id} className="table-row">
                                    <td className="table-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id || user.id)}
                                            onChange={() => handleSelectUser(user._id || user.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="table-cell">
                                        <div className="table-cell-content">
                                            {user.avatar ? (
                                                <img className="table-avatar" src={user.avatar} alt={user.name || user.email} />
                                            ) : (
                                                <div className="table-avatar-initials">
                                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.name || '—'}</div>
                                                <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell-text">
                                        {user.email}
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {(user.roles || []).map((r) => (
                                                <span key={r._id} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 border border-gray-200">
                                                    {r.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={user.isActive ? 'active' : 'inactive'} type="user-status" />
                                            {user.isVerified !== undefined && (
                                                <StatusBadge status={user.isVerified ? 'verified' : 'unverified'} type="user-status" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-primary transition hover:bg-primary/10"
                                                title="Edit user"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50"
                                                title="Delete user"
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
            {selectedUsers.length > 0 && !isLoading && !isError && (
                <div className="mt-4 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">{selectedUsers.length} of {users.length} selected</p>
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
                        currentPageCount={users.length}
                    />
                </div>
            )}
        </div>
    )
}


export default Customers 

