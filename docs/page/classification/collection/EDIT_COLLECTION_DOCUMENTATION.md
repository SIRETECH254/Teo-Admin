# Edit Collection Screen Documentation

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
import { useNavigate, useParams } from 'react-router-dom'
import { FiEdit, FiLoader } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useGetCollectionById, useUpdateCollection } from '../../../hooks/useCollections'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetCollectionById`, `useUpdateCollection` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Form state:** `formData` object (same structure as AddCollection, pre-populated from API).

**`useGetCollectionById` hook (from `hooks/useCollections.js`):**
```javascript
export const useGetCollectionById = (collectionId) => {
    return useQuery({
        queryKey: ['collection', collectionId],
        queryFn: async () => {
            const response = await collectionAPI.getCollectionById(collectionId)
            return response.data
        },
        enabled: !!collectionId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useUpdateCollection` hook (from `hooks/useCollections.js`):**
```javascript
export const useUpdateCollection = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ collectionId, ...collectionData }) => {
            const response = await collectionAPI.updateCollection(collectionId, collectionData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] })
            queryClient.invalidateQueries({ queryKey: ['collection'] })
            toast.success(data.message || 'Collection updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update collection error:', error)
            toast.error(error.response?.data?.message || 'Failed to update collection')
        }
    })
}
```

## UI Structure
(Same as AddCollection, with loading and error states)

## Planned Layout
(Same as AddCollection)

## Sketch Wireframe
(Same as AddCollection)

## Form Inputs
(Same as AddCollection, but with pre-populated values)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `collectionAPI.getCollectionById` and `collectionAPI.updateCollection`.
- **Get collection endpoint:** `GET /api/collections/:id`.
- **Update collection endpoint:** `PUT /api/collections/:id`.
- **Payload:** `{ name: string, description: string, isActive: boolean }`.
- **Response contract:** `response.data` contains `{ success: true, message: string, data: collection }`.
- **Cache invalidation:** After successful update, both `['collections']` and `['collection', id]` queries are invalidated.

## Components Used
(Same as AddCollection)

## Error Handling
(Same as AddCollection, with loading and error states)

## Navigation Flow
- **Route:** `/collections/:id/edit`.
- **Entry points:**
  - From collections list page via "Edit" button.
  - Direct URL navigation with collection ID.
- **On mount:** Collection data is fetched and form is pre-populated.
- **On successful update:** `navigate('/collections')` redirects to collections list.

## Functions Involved

- **`handleSubmit`** — Validates form and submits via mutation (same structure as AddCollection).
- **Collection data loading effect** — Loads collection data and populates form (same structure as EditBrand).

(Other functions same as AddCollection)

## Future Enhancements
(Same as AddCollection)
