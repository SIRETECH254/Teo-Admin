# Customers List Screen Documentation

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
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetUsers } from '../../hooks/useUsers'
import { useGetRoles } from '../../hooks/useRoles'
import { FiPlus, FiEdit, FiSearch, FiFilter, FiUsers, FiX, FiList, FiImage, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import { useDeleteUser } from '../../hooks/useUsers'
```

## Context and State Management
- **TanStack Query hooks:** `useGetUsers`, `useDeleteUser` for data fetching and mutations, `useGetRoles` for role filter options.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `filterStatus`: User status filter ('all', 'active', 'inactive', 'verified', 'unverified')
  - `filterRole`: Role filter ('all' or role ID)
  - `currentPage`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `selectedUsers`: Array of selected user IDs for bulk operations
  - `confirmDelete`: Object with `{ open: boolean, user: object }` for delete confirmation modal

**`useGetUsers` hook (from `hooks/useUsers.js`):**
```javascript
export const useGetUsers = (params = {}) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await userAPI.getAllUsers(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useDeleteUser` hook (from `hooks/useUsers.js`):**
```javascript
export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId) => {
            const response = await userAPI.deleteUser(userId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success(data.message || 'User deleted successfully')
            return data
        },
        onError: (error) => {
            console.error('Delete user error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete user')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Header section:** Title, description, search bar, and action buttons.
- **Filters section:** Status filter, role filter, and rows per page selector.
- **Users table:** Responsive table with user information including avatar, name, email, roles, status badges, and actions.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message with icon when no users exist.
- **Loading state:** Skeleton loader with animated placeholders including avatar placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Customers                                            │ │
│  │  Manage your customers and their roles                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Add Customer]        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Total X users  [Status] [Role] [Rows per page]      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Users Table                                          │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] User | Email | Roles | Status | Actions    │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] [👤] John | john@... | Admin | Active | ...│ │ │
│  │  │ [ ] [👤] Jane | jane@... | User | Active | ...  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Pagination                                            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Customers                                                    │
│  Manage your customers and their roles                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search users...]        [➕ Add Customer]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Total 25 users  [Status: All ▼] [Role: All ▼] [Rows: 10 ▼] │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] User          │ Email │ Roles │ Status │ Actions  │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] [👤] John Doe │ john@ │ Admin │ Active │ ✏️ 🗑   │ │
│  │     01/15/2025   │ .com  │       │ Verified│         │ │
│  │ [ ] [👤] Jane     │ jane@ │ User  │ Active │ ✏️ 🗑   │ │
│  │     01/14/2025   │ .com  │       │ Unverified│       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  [← Previous]  Page 1 of 3  [Next →]                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Search Input**
  ```javascript
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
          >
              <FiX className="h-4 w-4" />
          </button>
      )}
  </div>
  ```

- **Status Filter**
  ```javascript
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
  ```

- **Role Filter**
  ```javascript
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
  ```

- **User Avatar Display** (with fallback to icon)
  ```javascript
  <div className="h-10 w-10 flex-shrink-0 mr-3">
      {user.avatar ? (
          <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.name || user.email} />
      ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <FiImage className="h-5 w-5 text-gray-400" />
          </div>
      )}
  </div>
  ```

- **Status Badges** (Active/Inactive and Verified/Unverified)
  ```javascript
  <div className="flex items-center gap-2 text-xs">
      <span className={`px-2 py-0.5 rounded ${user.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
          {user.isActive ? 'Active' : 'Inactive'}
      </span>
      <span className={`px-2 py-0.5 rounded ${user.isVerified ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
          {user.isVerified ? 'Verified' : 'Unverified'}
      </span>
  </div>
  ```

- **Delete Confirmation Modal**
  ```javascript
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
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `userAPI.getAllUsers` and `userAPI.deleteUser`.
- **List users endpoint:** `GET /api/users` (admin only).
- **Query parameters:** `{ page, limit, search, status, role }`.
- **Delete user endpoint:** `DELETE /api/users/:id` (admin only).
- **Response contract:** `response.data` contains `{ data: { users: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalUsers`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['users'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`, `Link`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `img`.
- `react-icons/fi` for icons (FiPlus, FiEdit, FiSearch, FiFilter, FiUsers, FiX, FiList, FiImage, FiTrash2, FiAlertTriangle).
- Custom components: `Pagination`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.bg-light`).

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true, including avatar placeholders.
- **Empty state:** Message displayed when `users.length === 0` with icon and call-to-action.
- **Delete errors:** Handled in `useDeleteUser` hook's `onError` callback, displayed via toast notification.
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.

## Navigation Flow
- **Route:** `/customers`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a customer (redirects back to list).
- **User actions:**
  - "Edit" (edit icon) ➞ `/customers/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add customer:** "Add Customer" button ➞ `/customers/new`.
- **Pagination:** Changing page updates URL params and refetches data.

## Functions Involved

- **`handleSelectUser`** — Toggles user selection for bulk operations.
  ```javascript
  const handleSelectUser = useCallback((userId) => {
      setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId])
  }, [])
  ```

- **`handleSelectAll`** — Selects or deselects all users.
  ```javascript
  const handleSelectAll = useCallback(() => {
      setSelectedUsers(prev => {
          if (prev.length === users.length) return []
          return users.map(u => u._id || u.id)
      })
  }, [users])
  ```

- **`handleEdit`** — Navigates to edit user page.
  ```javascript
  const handleEdit = useCallback((user) => {
      navigate(`/customers/${user._id || user.id}/edit`)
  }, [navigate])
  ```

- **`handleDelete`** — Opens delete confirmation modal.
  ```javascript
  const handleDelete = useCallback((user) => {
      setConfirmDelete({ open: true, user })
  }, [])
  ```

- **`confirmDeleteUser`** — Confirms and executes user deletion.
  ```javascript
  const confirmDeleteUser = useCallback(async () => {
      try {
          await deleteUser.mutateAsync(confirmDelete.user._id || confirmDelete.user.id)
          setConfirmDelete({ open: false, user: null })
      } catch (e) {
          // handled by hook
      }
  }, [confirmDelete.user, deleteUser])
  ```

- **`clearSearch`** — Clears search term and resets to first page.
  ```javascript
  const clearSearch = useCallback(() => {
      setSearchTerm('')
      setCurrentPage(1)
  }, [])
  ```

- **`clearFilters`** — Clears all filters and resets to first page.
  ```javascript
  const clearFilters = useCallback(() => {
      setFilterStatus('all')
      setFilterRole('all')
      setCurrentPage(1)
  }, [])
  ```

- **Search debouncing effect** — Debounces search term to prevent excessive API calls.
  ```javascript
  useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
      return () => clearTimeout(t)
  }, [searchTerm])
  ```

## Future Enhancements
- Add bulk delete functionality for selected users.
- Add bulk status update (activate/deactivate multiple users).
- Add bulk role assignment.
- Add user export functionality (CSV, Excel).
- Add user import functionality.
- Add user activity logs.
- Add user login history.
- Add user avatar upload functionality.
- Add user sorting options (by name, email, date, status).
- Add user templates for quick creation.
- Add user duplication functionality.
- Add user search by phone number.
- Add user verification status bulk update.
