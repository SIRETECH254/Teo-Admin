# Reviews List Screen Documentation

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
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiFilter, FiX, FiEdit2, FiTrash2, FiEye, FiCheck, FiX as FiXIcon } from 'react-icons/fi'
import { useGetAllReviews, useDeleteReview, useApproveReview } from '../../hooks/useReviews'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetAllReviews`, `useDeleteReview`, `useApproveReview` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Form state:** Multiple state variables for filters, search, pagination, and selection:
  - `currentPage`: Current page number
  - `searchTerm`: Current search input value
  - `statusFilter`: Review status filter ('all', 'approved', 'pending', 'rejected')
  - `ratingFilter`: Rating filter ('all', '5', '4', '3', '2', '1')
  - `selectedReviews`: Array of selected review IDs for bulk operations
  - `showFilters`: Boolean to toggle filters panel visibility
  - `deleteModal`: Object with `{ show: boolean, reviewId: string }` for delete confirmation
  - `approveModal`: Object with `{ show: boolean, reviewId: string, isApproved: boolean }` for approve/reject confirmation

**`useGetAllReviews` hook (from `hooks/useReviews.js`):**
```javascript
export const useGetAllReviews = (params = {}) => {
    return useQuery({
        queryKey: ['reviews', params],
        queryFn: async () => {
            const response = await reviewAPI.getAllReviews(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useDeleteReview` hook (from `hooks/useReviews.js`):**
```javascript
export const useDeleteReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (reviewId) => {
            const response = await reviewAPI.deleteReview(reviewId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] })
            toast.success(data.message || 'Review deleted successfully')
            return data
        },
        onError: (error) => {
            console.error('Delete review error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete review')
        }
    })
}
```

**`useApproveReview` hook (from `hooks/useReviews.js`):**
```javascript
export const useApproveReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ reviewId, isApproved }) => {
            const response = await reviewAPI.approveReview(reviewId, { isApproved })
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] })
            toast.success(data.message || 'Review updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Approve review error:', error)
            toast.error(error.response?.data?.message || 'Failed to update review')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with padding (`p-6`).
- **Header section:** Title and description.
- **Search and filters section:** Search input with collapsible filters panel (status and rating filters).
- **Bulk actions bar:** Appears when reviews are selected, shows count and bulk delete button.
- **Reviews table:** Responsive table with review information including comment, product, user, rating stars, status badge, date, and actions.
- **Pagination:** Bottom pagination component for navigating pages.
- **Delete modal:** Confirmation modal overlay for delete operations.
- **Approve/Reject modal:** Confirmation modal overlay for approve/reject operations.
- **Empty state:** Centered message with icon when no reviews found.
- **Loading state:** Skeleton loader with animated placeholders.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Reviews Management                                   │ │
│  │  Manage all product reviews in the system            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Search...]                    [Filters ▼]          │ │
│  │  ────────────────────────────────────────────────────  │ │
│  │  Status: [All ▼]  Rating: [All ▼]  [Clear Filters]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  X review(s) selected  [Delete Selected]             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Reviews Table                                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ [✓] Review | Product | User | Rating | Status  │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ [ ] Great! | Product A | John | ⭐⭐⭐⭐⭐ | ... │ │ │
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
│  Reviews Management                                           │
│  Manage all product reviews in the system                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search reviews...]        [Filters ▼]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Status: [All ▼]  Rating: [All ▼]  [Clear Filters]          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] Review        │ Product │ User │ Rating │ Status│ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ [ ] Great product!│ Product │ John │ ⭐⭐⭐⭐⭐│ Pending│ │
│  │     Very satisfied│ A       │      │        │       │ │
│  │ [ ] Good quality  │ Product │ Jane │ ⭐⭐⭐⭐ │Approved│ │
│  │     Fast delivery │ B       │      │        │       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  [← Previous]  Page 1 of 5  [Next →]                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Search Input**
  ```javascript
  <form onSubmit={handleSearch} className="relative">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
          type="text"
          placeholder="Search reviews by product name, user name, or comment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      {searchTerm && (
          <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
              <FiX className="h-4 w-4" />
          </button>
      )}
  </form>
  ```

- **Filter Toggle Button**
  ```javascript
  <button
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
  >
      <FiFilter className="h-4 w-4" />
      Filters
      {showFilters && <FiX className="h-4 w-4" />}
  </button>
  ```

- **Status Filter**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
      </select>
  </div>
  ```

- **Rating Filter**
  ```javascript
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
      <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
      </select>
  </div>
  ```

- **Rating Stars Display**
  ```javascript
  <div className="flex items-center">
      <span className="text-sm text-gray-900 mr-2">{review.rating}</span>
      <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
              <span
                  key={star}
                  className={`text-sm ${
                      star <= review.rating
                          ? 'text-orange-400'
                          : 'text-gray-300'
                  }`}
              >
                  ★
              </span>
          ))}
      </div>
  </div>
  ```

- **Delete Confirmation Modal**
  ```javascript
  {deleteModal.show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Review</h3>
              <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                  <button
                      onClick={() => setDeleteModal({ show: false, reviewId: null })}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={handleDeleteReview}
                      disabled={deleteReviewMutation.isPending}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                      {deleteReviewMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

- **Approve/Reject Confirmation Modal**
  ```javascript
  {approveModal.show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {approveModal.isApproved ? 'Approve' : 'Reject'} Review
              </h3>
              <p className="text-gray-600 mb-6">
                  Are you sure you want to {approveModal.isApproved ? 'approve' : 'reject'} this review?
              </p>
              <div className="flex gap-3">
                  <button
                      onClick={() => setApproveModal({ show: false, reviewId: null, isApproved: true })}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={handleApproveReview}
                      disabled={approveReviewMutation.isPending}
                      className={`flex-1 px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                          approveModal.isApproved 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                  >
                      {approveReviewMutation.isPending 
                          ? (approveModal.isApproved ? 'Approving...' : 'Rejecting...') 
                          : (approveModal.isApproved ? 'Approve' : 'Reject')
                      }
                  </button>
              </div>
          </div>
      </div>
  )}
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `reviewAPI.getAllReviews`, `reviewAPI.deleteReview`, `reviewAPI.approveReview`.
- **List reviews endpoint:** `GET /api/reviews` (admin only).
- **Query parameters:** `{ page, limit, search, status, rating }`.
- **Delete review endpoint:** `DELETE /api/reviews/:id` (admin only).
- **Approve/reject review endpoint:** `PUT /api/reviews/:id/approve` (admin only).
- **Payload for approve:** `{ isApproved: boolean }`.
- **Response contract:** `response.data` contains `{ data: { reviews: [...], pagination: {...} } }`.
- **Pagination:** Response includes `pagination` object with `currentPage`, `totalPages`, `totalReviews`.
- **Cache invalidation:** After delete/approve, `queryClient.invalidateQueries({ queryKey: ['reviews'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `select`, `option`, `button`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `img`.
- `react-icons/fi` for icons (FiSearch, FiFilter, FiX, FiEdit2, FiTrash2, FiEye, FiCheck, FiXIcon).
- Custom components: `Pagination`, `StatusBadge`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Empty state:** Message displayed when `reviews.length === 0` with icon and helpful text.
- **Error state:** Error message displayed if API call fails.
- **Delete errors:** Handled in `useDeleteReview` hook's `onError` callback, displayed via toast notification.
- **Approve/reject errors:** Handled in `useApproveReview` hook's `onError` callback, displayed via toast notification.

## Navigation Flow
- **Route:** `/reviews`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - After approving/rejecting/deleting a review (stays on same page with refreshed data).
- **Review actions:**
  - "View" (eye icon) ➞ `/reviews/:id` (view review details).
  - "Edit" (edit icon) ➞ `/reviews/:id/edit` (edit review).
  - "Approve" (check icon) ➞ Opens confirmation modal, then approves and refreshes list.
  - "Reject" (X icon) ➞ Opens confirmation modal, then rejects and refreshes list.
  - "Delete" (trash icon) ➞ Opens confirmation modal, then deletes and refreshes list.
- **Bulk actions:** Bulk delete available when reviews are selected.

## Functions Involved

- **`handleSearch`** — Handles search form submission.
  ```javascript
  const handleSearch = (e) => {
      e.preventDefault()
      setCurrentPage(1)
      refetch()
  }
  ```

- **`clearSearch`** — Clears search term and resets to first page.
  ```javascript
  const clearSearch = () => {
      setSearchTerm('')
      setCurrentPage(1)
      refetch()
  }
  ```

- **`clearFilters`** — Clears all filters and resets to first page.
  ```javascript
  const clearFilters = () => {
      setStatusFilter('all')
      setRatingFilter('all')
      setCurrentPage(1)
      refetch()
  }
  ```

- **`handleSelectReview`** — Toggles review selection for bulk operations.
  ```javascript
  const handleSelectReview = (reviewId) => {
      setSelectedReviews(prev => 
          prev.includes(reviewId) 
              ? prev.filter(id => id !== reviewId)
              : [...prev, reviewId]
      )
  }
  ```

- **`handleSelectAll`** — Selects or deselects all reviews.
  ```javascript
  const handleSelectAll = () => {
      if (selectedReviews.length === reviews.length) {
          setSelectedReviews([])
      } else {
          setSelectedReviews(reviews.map(review => review._id))
      }
  }
  ```

- **`handleDeleteReview`** — Confirms and executes review deletion.
  ```javascript
  const handleDeleteReview = async () => {
      try {
          await deleteReviewMutation.mutateAsync(deleteModal.reviewId)
          setDeleteModal({ show: false, reviewId: null })
          refetch()
          toast.success('Review deleted successfully')
      } catch (error) {
          toast.error('Failed to delete review')
      }
  }
  ```

- **`handleApproveReview`** — Confirms and executes review approval/rejection.
  ```javascript
  const handleApproveReview = async () => {
      try {
          await approveReviewMutation.mutateAsync({
              reviewId: approveModal.reviewId,
              isApproved: approveModal.isApproved
          })
          setApproveModal({ show: false, reviewId: null, isApproved: true })
          refetch()
          toast.success(`Review ${approveModal.isApproved ? 'approved' : 'rejected'} successfully`)
      } catch (error) {
          toast.error(`Failed to ${approveModal.isApproved ? 'approve' : 'reject'} review`)
      }
  }
  ```

- **`handleBulkDelete`** — Deletes multiple selected reviews.
  ```javascript
  const handleBulkDelete = async () => {
      if (selectedReviews.length === 0) {
          toast.error('Please select reviews to delete')
          return
      }

      try {
          await Promise.all(selectedReviews.map(reviewId => 
              deleteReviewMutation.mutateAsync(reviewId)
          ))
          setSelectedReviews([])
          refetch()
          toast.success(`${selectedReviews.length} reviews deleted successfully`)
      } catch (error) {
          toast.error('Failed to delete some reviews')
      }
  }
  ```

## Future Enhancements
- Add bulk approve/reject functionality for selected reviews.
- Add review response/reply functionality.
- Add review editing capability.
- Add review filtering by product.
- Add review filtering by date range.
- Add review export functionality (CSV, Excel).
- Add review analytics and insights.
- Add review moderation queue.
- Add review spam detection.
- Add review helpfulness voting.
- Add review sorting options (by date, rating, status).
- Add review search by user email/name.
- Add review image attachments display.
