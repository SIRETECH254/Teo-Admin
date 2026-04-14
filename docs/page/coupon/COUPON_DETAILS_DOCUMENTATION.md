# Coupon Detail Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [API Integration](#api-integration)
- [Functions Involved](#functions-involved)

## Imports
```javascript
import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
    FiArrowLeft, FiEdit2, FiTrash2, FiRefreshCw, FiTag, 
    FiCalendar, FiUsers, FiInfo, FiCheckCircle, FiXCircle, 
    FiAlertTriangle, FiClock, FiUser
} from 'react-icons/fi'
import { useGetCouponById, useDeleteCoupon, useGenerateNewCode } from '../../hooks/useCoupons'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:**
  - `useGetCouponById`: Fetches detailed coupon data using the `couponId` parameter.
  - `useDeleteCoupon`: Mutation for deleting the coupon.
  - `useGenerateNewCode`: Mutation for regenerating the coupon's unique code.
- **State management:**
  - `couponId`: Extracted from the URL parameters via `useParams`.
  - `showDeleteModal`: Boolean state to control the visibility of the delete confirmation modal.

## UI Structure
- **Header:**
  - Back button to the Coupons list.
  - Coupon Code and Status Badge.
  - Action buttons: Regenerate Code, Edit, and Delete.
- **Main Content (Two-Column Layout):**
  - **Left Column:**
    - **Description & Details Card:** Displays the coupon description, discount type, and value.
    - **Usage History Card:** Displays a table of recent coupon applications including User Name, Email, and Timestamp.
  - **Right Column (Sidebar):**
    - **Usage Stats Card:** Shows used count vs. limit and remaining uses.
    - **Schedule & Expiry Card:** Displays creation and expiry dates with a countdown/status indicator.
    - **Restrictions Card:** Shows minimum order amount and maximum discount amount.
- **Modals:**
  - **Delete Confirmation Modal:** A safe-check before permanent deletion.

## API Integration
- **Get Coupon Details:** `GET /api/coupons/:couponId`
- **Delete Coupon:** `DELETE /api/coupons/:couponId`
- **Regenerate Code:** `PATCH /api/coupons/:couponId/generate-code`

## Functions Involved
- **`handleDelete`:** Executes the deletion mutation and redirects to the coupons list on success.
- **`handleGenerateNewCode`:** Triggers the code regeneration and refetches the coupon data to show the new code.
- **`getCouponStatus`:** Helper function to determine the visual status (active, inactive, expired, limit-reached) based on coupon properties.
- **`formatValue`:** Formats the discount value based on whether it is a percentage or a fixed currency amount.
