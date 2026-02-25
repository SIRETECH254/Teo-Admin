# Collections List Screen Documentation

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
import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList, FiLoader } from 'react-icons/fi'
import { useGetCollections, useDeleteCollection } from '../../../hooks/useCollections'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from '../../../components/common/StatusBadge'
import Pagination from '../../../components/common/Pagination'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetCollections`, `useDeleteCollection` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection (same structure as Brands/Categories).

**`useGetCollections` hook (from `hooks/useCollections.js`):**
```javascript
export const useGetCollections = (params = {}) => {
    return useQuery({
        queryKey: ['collections', params],
        queryFn: async () => {
            const response = await collectionAPI.getAllCollections(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

## UI Structure
(Same structure as Categories, without logo)

## Planned Layout
(Same as Categories)

## Sketch Wireframe
(Same as Categories)

## Form Inputs
(Same structure as Categories)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `collectionAPI.getAllCollections` and `collectionAPI.deleteCollection`.
- **List collections endpoint:** `GET /api/collections`.
- **Query parameters:** `{ page, limit, search, status }`.
- **Delete collection endpoint:** `DELETE /api/collections/:id`.
- **Response contract:** `response.data` contains `{ data: { collections: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalCollections`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['collections'] })` is called.

## Components Used
(Same as Categories)

## Error Handling
(Same as Categories)

## Navigation Flow
- **Route:** `/collections`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a collection (redirects back to list).
- **Collection actions:**
  - "Edit" (edit icon) ➞ `/collections/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add collection:** "Add Collection" button ➞ `/collections/add`.

## Functions Involved
(Same structure as Categories)

## Future Enhancements
- Add collection image/banner upload.
- Add collection featured products.
- Add collection display order/sorting.
- Add collection visibility settings.
- Add collection templates.
- Add collection duplication.
- Add collection import/export.
- Add collection analytics.
- Add collection SEO settings.
