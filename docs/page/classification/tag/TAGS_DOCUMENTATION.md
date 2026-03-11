# Tags List Screen Documentation

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
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList, FiLoader, FiTag } from 'react-icons/fi'
import { useGetTags, useDeleteTag } from '../../../hooks/useTags'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from '../../../components/common/StatusBadge'
import Pagination from '../../../components/common/Pagination'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetTags`, `useDeleteTag` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection (same structure as other classifications).

**`useGetTags` hook (from `hooks/useTags.js`):**
```javascript
export const useGetTags = (params = {}) => {
    return useQuery({
        queryKey: ['tags', params],
        queryFn: async () => {
            const response = await tagAPI.getAllTags(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

## UI Structure
(Same structure as Categories, with tag icon instead of logo)

## Planned Layout
(Same as Categories)

## Sketch Wireframe
(Same as Categories, with tag icon badge)

## Form Inputs
(Same structure as Categories, with tag icon display)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `tagAPI.getAllTags` and `tagAPI.deleteTag`.
- **List tags endpoint:** `GET /api/tags`.
- **Query parameters:** `{ page, limit, search, status }`.
- **Delete tag endpoint:** `DELETE /api/tags/:id`.
- **Response contract:** `response.data` contains `{ data: { tags: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalTags`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['tags'] })` is called.

## Components Used
(Same as Categories, with FiTag icon)

## Error Handling
(Same as Categories)

## Navigation Flow
- **Route:** `/tags`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a tag (redirects back to list).
- **Tag actions:**
  - "Edit" (edit icon) ➞ `/tags/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add tag:** "Add Tag" button ➞ `/tags/add`.

## Functions Involved
(Same structure as Categories)

## Future Enhancements
- Add tag color coding.
- Add tag grouping/categories.
- Add tag usage analytics.
- Add tag templates.
- Add tag duplication.
- Add tag import/export.
- Add tag autocomplete suggestions.
- Add tag popularity ranking.
