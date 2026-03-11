# Roles List Screen Documentation

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
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit, FiSearch, FiFilter, FiX, FiList, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import api from '../../api'
```

## Context and State Management
- **State management:** Local component state managed with `useState` hooks.
- **API calls:** Direct API calls using `api` instance (not using TanStack Query hooks).
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `searchTerm`: Current search input value
  - `debouncedSearch`: Debounced search term (300ms delay)
  - `filterActive`: Role status filter ('all', 'active', 'inactive')
  - `currentPage`: Current page number
  - `itemsPerPage`: Number of items per page (5, 10, 20, 50)
  - `selectedRoles`: Array of selected role IDs for bulk operations
  - `confirmDelete`: Object with `{ open: boolean, role: object }` for delete confirmation modal
  - `data`: API response data
  - `loading`: Loading state for API calls

**API call pattern:**
```javascript
const load = useCallback(async () => {
    setLoading(true)
    try {
        const res = await api.get('/roles', { params })
        setData(res.data)
    } finally {
        setLoading(false)
    }
}, [params])
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-4`).
- **Header section:** Title, description, search bar, and action buttons.
- **Filters section:** Status filter and rows per page selector.
- **Roles table:** Responsive table with role information including name, description, status, and actions.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Empty state:** Centered message with call-to-action when no roles exist.
- **Loading state:** Skeleton loader with animated placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Roles                                                │ │
│  │  Manage application roles                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Add Role]          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Total X roles  [Status] [Rows per page]             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Roles Table                                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Role | Description | Status | Actions      │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] Admin | Full access | Active | ...         │ │ │
│  │  │ [ ] Manager | Limited access | Active | ...    │ │ │
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
│  Roles                                                        │
│  Manage application roles                                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search roles...]        [➕ Add Role]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Total 10 roles  [Status: All ▼] [Rows per page: 10 ▼]     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Role          │ Description │ Status │ Actions   │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] Admin         │ Full access │ Active │ ✏️ 🗑     │ │
│  │ [ ] Manager       │ Limited     │ Active │ ✏️ 🗑     │ │
│  │ [ ] Viewer        │ Read only   │ Active │ ✏️ 🗑     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  [← Previous]  Page 1 of 2  [Next →]                        │
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
          placeholder="Search roles..." 
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
          value={filterActive} 
          onChange={(e) => setFilterActive(e.target.value)} 
          className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
      >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
      </select>
  </div>
  ```

- **Rows Per Page Selector**
  ```javascript
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
  ```

- **Delete Confirmation Modal**
  ```javascript
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
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/index.js` via direct `api.get` and `api.delete` calls.
- **List roles endpoint:** `GET /api/roles`.
- **Query parameters:** `{ page, limit, search, isActive }`.
- **Delete role endpoint:** `DELETE /api/roles/:id`.
- **Response contract:** `response.data` contains `{ data: { roles: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `total`.
- **No cache invalidation:** Uses direct API calls, so data is refetched on each load.

## Components Used
- React + React Router DOM: `Link`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`.
- `react-icons/fi` for icons (FiPlus, FiEdit, FiSearch, FiFilter, FiX, FiList, FiTrash2, FiAlertTriangle).
- Custom components: `Pagination`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.bg-light`).

## Error Handling
- **Loading states:** Skeleton loader displayed while `loading` is true.
- **Empty state:** Message displayed when `roles.length === 0` with call-to-action to add role.
- **Delete errors:** Errors are silently caught in `confirmDeleteRole` function (no error display).
- **Search debouncing:** 300ms debounce prevents excessive API calls while user types.

## Navigation Flow
- **Route:** `/roles`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a role (redirects back to list).
- **Role actions:**
  - "Edit" (edit icon) ➞ `/roles/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add role:** "Add Role" button ➞ `/roles/add`.
- **Pagination:** Changing page updates params and refetches data.

## Functions Involved

- **`load`** — Fetches roles from API with current params.
  ```javascript
  const load = useCallback(async () => {
      setLoading(true)
      try {
          const res = await api.get('/roles', { params })
          setData(res.data)
      } finally {
          setLoading(false)
      }
  }, [params])
  ```

- **`handleSelect`** — Toggles role selection for bulk operations.
  ```javascript
  const handleSelect = (id) => {
      setSelectedRoles((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  ```

- **`handleSelectAll`** — Selects or deselects all roles.
  ```javascript
  const handleSelectAll = () => {
      setSelectedRoles((prev) => prev.length === roles.length ? [] : roles.map(r => r._id))
  }
  ```

- **`onDelete`** — Opens delete confirmation modal.
  ```javascript
  const onDelete = (role) => setConfirmDelete({ open: true, role })
  ```

- **`confirmDeleteRole`** — Confirms and executes role deletion.
  ```javascript
  const confirmDeleteRole = async () => {
      try {
          await api.delete(`/roles/${confirmDelete.role._id}`)
          setConfirmDelete({ open: false, role: null })
          load()
      } catch {}
  }
  ```

- **`clearSearch`** — Clears search term and resets to first page.
  ```javascript
  const clearSearch = () => { setSearchTerm(''); setCurrentPage(1) }
  ```

- **`clearFilters`** — Clears all filters and resets to first page.
  ```javascript
  const clearFilters = () => { setFilterActive('all'); setCurrentPage(1) }
  ```

- **Search debouncing effect** — Debounces search term to prevent excessive API calls.
  ```javascript
  useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
      return () => clearTimeout(t)
  }, [searchTerm])
  ```

## Future Enhancements
- Add bulk delete functionality for selected roles.
- Add bulk status update (activate/deactivate multiple roles).
- Add role permissions management.
- Add role duplication functionality.
- Add role usage statistics (how many users have each role).
- Add role hierarchy/parent-child relationships.
- Add role export functionality (CSV, Excel).
- Add role import functionality.
- Add role templates for quick creation.
- Add role sorting options (by name, status, date).
- Add role activity logs.
- Add role assignment history.
