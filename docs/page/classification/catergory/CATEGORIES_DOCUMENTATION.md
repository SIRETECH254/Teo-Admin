# Categories List Screen Documentation

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
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetCategories, useDeleteCategory } from '../../../hooks/useCategories'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList } from 'react-icons/fi'
import Pagination from '../../../components/common/Pagination'
import toast from 'react-hot-toast'
import StatusBadge from '../../../components/common/StatusBadge'
```

## Context and State Management
- **TanStack Query hooks:** `useGetCategories`, `useDeleteCategory` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection (same structure as Brands).

**`useGetCategories` hook (from `hooks/useCategories.js`):**
```javascript
export const useGetCategories = (params = {}) => {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: async () => {
            const response = await categoryAPI.getAllCategories(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

## UI Structure
(Same structure as Brands, but without logo display)

## Planned Layout
(Same as Brands, but without logo column)

## Sketch Wireframe
(Same as Brands, but without logo column)

## Form Inputs
(Same structure as Brands)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `categoryAPI.getAllCategories` and `categoryAPI.deleteCategory`.
- **List categories endpoint:** `GET /api/categories`.
- **Query parameters:** `{ page, limit, search, status }`.
- **Delete category endpoint:** `DELETE /api/categories/:id`.
- **Response contract:** `response.data` contains `{ data: { categories: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalCategories`.
- **Cache invalidation:** After delete, `queryClient.invalidateQueries({ queryKey: ['categories'] })` is called.

## Components Used
(Same as Brands, without logo-related code)

## Error Handling
(Same as Brands)

## Navigation Flow
- **Route:** `/categories`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After creating/editing a category (redirects back to list).
- **Category actions:**
  - "Edit" (edit icon) ➞ `/categories/:id/edit`.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Add category:** "Add Category" button ➞ `/categories/add`.

## Functions Involved
(Same structure as Brands)

## Future Enhancements
- Add category hierarchy/parent-child relationships.
- Add category image/icon upload.
- Add category breadcrumb display.
- Add category product count drill-down.
- Add category sorting options.
- Add category templates.
- Add category duplication.
- Add category import/export.
- Add category analytics.
- Add category SEO settings.
