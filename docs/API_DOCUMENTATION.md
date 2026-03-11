# TEO-ADMIN API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints available in the TEO-ADMIN application (E-commerce for TEO KICKS). The API follows RESTful conventions and uses JWT-based authentication with role-based access control.

**Base URL:** `https://teo-kicks.onrender.com/api`

All API endpoints are prefixed with `/api`, so the full URL format is: `https://teo-kicks.onrender.com/api/{endpoint}`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Authentication Flow

1. **Login/Register** - Obtain access token and refresh token
2. **OTP Verification** - Verify account via OTP sent to email/phone
3. **Token Storage** - Tokens are stored in localStorage
4. **Automatic Refresh** - Access tokens are automatically refreshed when expired (401 response)
5. **Token Refresh** - Use refresh token to get a new access token via `/auth/refresh`

---

## API Endpoints

### Auth Endpoints

**Base:** `/api/auth`

#### Login
- **Endpoint:** `POST /auth/login`
- **Description:** User login (email + password)
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response Body (Success):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "roles": ["string"]
      },
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

#### Register
- **Endpoint:** `POST /auth/register`
- **Description:** User registration
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
  }
  ```

#### Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verify account via OTP
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

#### Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Description:** Send password reset email
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Reset Password
- **Endpoint:** `POST /auth/reset-password/:token`
- **Description:** Reset password with token
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "newPassword": "newpassword123"
  }
  ```

#### Get Current User
- **Endpoint:** `GET /auth/me`
- **Description:** Get current authenticated user profile
- **Auth Required:** Yes

#### Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Logout current user
- **Auth Required:** Yes

#### Google OAuth
- **Endpoint:** `GET /auth/google`
- **Description:** Initiate Google OAuth flow (redirects to Google)
- **Auth Required:** No

#### Google OAuth Callback
- **Endpoint:** `POST /auth/google/callback`
- **Description:** Handle Google OAuth callback with authorization code
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "code": "authorization_code_from_google"
  }
  ```

#### Google OAuth Mobile
- **Endpoint:** `POST /auth/google/mobile`
- **Description:** Handle Google OAuth with ID token (for mobile apps)
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "idToken": "google_id_token"
  }
  ```

---

### User Endpoints

**Base:** `/api/users`

#### Profile Management
- `GET /users/profile` - Get own profile
- `PUT /users/profile` - Update own profile
- `PUT /users/change-password` - Change own password

#### Admin User Management
- **List All Users**
  - **Endpoint:** `GET /users`
  - **Query Params:** `{ page, limit, search, role, status }`
- **Get User by ID**
  - **Endpoint:** `GET /users/:userId`
- **Update User Status/Roles**
  - **Endpoint:** `PUT /users/:userId/status`
  - **Request Body:**
    ```json
    {
      "status": "string",
      "roles": ["string"]
    }
    ```
- **Delete User**
  - **Endpoint:** `DELETE /users/:userId`
- **Admin Create Customer**
  - **Endpoint:** `POST /users/admin-create`
  - **Request Body:**
    ```json
    {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string"
    }
    ```

---

### Product Endpoints

**Base:** `/api/products`

#### List All Products
- **Endpoint:** `GET /products`
- **Query Params:** `{ page, limit, search, brand, category, status, minPrice, maxPrice }`

#### Product Management
- **Get All Products**
  - **Endpoint:** `GET /products`
  - **Query Params:** `{ page, limit, search, brand, category, status, minPrice, maxPrice }`
- **Get Product by ID**
  - **Endpoint:** `GET /products/:id`
- **Create Product**
  - **Endpoint:** `POST /products`
  - **Content-Type:** `multipart/form-data`
  - **Body Fields:**
    - `title`: string
    - `description`: string (HTML)
    - `shortDescription`: string
    - `brand`: string (ID)
    - `basePrice`: number
    - `comparePrice`: number
    - `status`: "draft" | "active" | "archived"
    - `weight`: number
    - `trackInventory`: boolean
    - `categories`: string (JSON array of IDs)
    - `collections`: string (JSON array of IDs)
    - `tags`: string (JSON array of IDs)
    - `variants`: string (JSON array of IDs)
    - `features`: string (JSON array of strings)
    - `images`: File[] (Multiple product images)
- **Update Product**
  - **Endpoint:** `PUT /products/:id`
  - **Content-Type:** `multipart/form-data`
- **Delete Product**
  - **Endpoint:** `DELETE /products/:id`
- **Product Images**
  - `POST /products/:id/images` - Upload product images
  - `DELETE /products/:productId/images/:imageId` - Delete product image
  - `PUT /products/:productId/images/:imageId/primary` - Set primary image
- **Product SKUs**
  - `PATCH /products/:productId/skus/:skuId` - Update SKU
  - `DELETE /products/:productId/skus/:skuId` - Delete SKU
  - `POST /products/:productId/generate-skus` - Generate SKUs

---

### Order & Transaction Endpoints

#### Create Order
- **Endpoint:** `POST /orders`
- **Description:** Create a new order from cart
- **Request Body:**
  ```json
  {
    "location": { "lat": number, "lng": number, "address": "string" },
    "type": "delivery" | "pickup",
    "timing": "now" | "scheduled",
    "addressId": "string (optional)",
    "paymentPreference": {
      "mode": "pay_now" | "post_to_bill",
      "method": "mpesa_stk" | "paystack" | "cash" | null
    },
    "packagingOptionId": "string (optional)",
    "couponCode": "string (optional)",
    "cartId": null,
    "metadata": {}
  }
  ```
- **Response Body (Success):**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "string"
    }
  }
  ```

#### Pay Invoice
- **Endpoint:** `POST /payments/pay-invoice`
- **Description:** Initiate payment for an invoice
- **Request Body:**
  ```json
  {
    "invoiceId": "string",
    "method": "mpesa_stk" | "paystack",
    "payerPhone": "string (required for mpesa_stk)",
    "payerEmail": "string (required for paystack)"
  }
  ```
- **Response Body (M-Pesa Success):**
  ```json
  {
    "success": true,
    "data": {
      "paymentId": "string",
      "daraja": {
        "checkoutRequestId": "string"
      }
    }
  }
  ```

---

### Category Endpoints

**Base:** `/api/categories`

- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category
- `GET /categories/tree` - Get category tree
- `GET /categories/with-products` - Get categories with products

### Brand Endpoints

**Base:** `/api/brands`

- `GET /brands` - Get all brands
- `GET /brands/:id` - Get brand by ID
- `POST /brands` - Create brand
- `PUT /brands/:id` - Update brand
- `DELETE /brands/:id` - Delete brand
- `GET /brands/popular` - Get popular brands

### Tag Endpoints

**Base:** `/api/tags`

- `GET /tags` - Get all tags
- `GET /tags/:id` - Get tag by ID
- `POST /tags` - Create tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag
- `GET /tags/type/:type` - Get tags by type
- `GET /tags/popular` - Get popular tags

### Collection Endpoints

**Base:** `/api/collections`

- `GET /collections` - Get all collections
- `GET /collections/:id` - Get collection by ID
- `POST /collections` - Create collection
- `PUT /collections/:id` - Update collection
- `DELETE /collections/:id` - Delete collection
- `POST /collections/:id/products` - Add product to collection
- `DELETE /collections/:id/products/:productId` - Remove product from collection

### Variant Endpoints

**Base:** `/api/variants`

- `GET /variants` - Get all variants
- `GET /variants/:id` - Get variant by ID
- `GET /variants/active` - Get active variants
- `POST /variants` - Create variant
- `PUT /variants/:id` - Update variant
- `DELETE /variants/:id` - Delete variant
- `POST /variants/:variantId/options` - Add option to variant
- `PUT /variants/:variantId/options/:optionId` - Update variant option
- `DELETE /variants/:variantId/options/:optionId` - Remove option from variant

### Cart Endpoints

**Base:** `/api/cart`

- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/items/:skuId` - Update cart item quantity
- `DELETE /cart/items/:skuId` - Remove item from cart
- `DELETE /cart/clear` - Clear cart
- `GET /cart/validate` - Validate cart

---

### Review Endpoints

**Base:** `/api/reviews`

- `GET /reviews/products/:productId` - Get reviews for a product
- `GET /reviews/:reviewId` - Get a single review
- `GET /reviews/user/reviews` - Get user's reviews
- `POST /reviews/products/:productId` - Create a review
- `PUT /reviews/:reviewId` - Update a review
- `DELETE /reviews/:reviewId` - Delete a review
- `PATCH /reviews/:reviewId/approve` - Approve/Reject review (admin only)

### Marketing & Tool Endpoints

#### Coupons (`/api/coupons`)

- `GET /coupons` - Get all coupons (admin only)
- `GET /coupons/:couponId` - Get coupon by ID
- `GET /coupons/stats` - Get coupon statistics (admin only)
- `POST /coupons` - Create coupon (admin only)
- `PUT /coupons/:couponId` - Update coupon (admin only)
- `DELETE /coupons/:couponId` - Delete coupon (admin only)
- `POST /coupons/validate` - Validate coupon (public)
  - **Query Params:** `?orderAmount=number`
  - **Request Body:** `{ "code": "string" }`
- `POST /coupons/apply` - Apply coupon to order (protected)
- `PATCH /coupons/:couponId/generate-code` - Generate new coupon code (admin only)

#### Packaging (`/api/packaging`)

- `GET /packaging` - Get all packaging options
- `GET /packaging/:id` - Get packaging by ID
- `GET /packaging/public` - Get active packaging (public)
- `GET /packaging/public/default` - Get default packaging (public)
- `POST /packaging` - Create packaging option
- `PATCH /packaging/:id` - Update packaging option
- `DELETE /packaging/:id` - Delete packaging option
- `PATCH /packaging/:id/default` - Set default packaging

### Stats Endpoints

**Base:** `/api/stats`

- `GET /stats/overview` - Get store overview statistics
- `GET /stats/analytics` - Get store analytics (with optional date range params)

### Store Configuration Endpoints

**Base:** `/api/store-config`

- `GET /store-config` - Get store configuration
- `GET /store-config/status` - Get store configuration status
- `POST /store-config` - Create store configuration (admin only)
- `PUT /store-config` - Update store configuration (admin only)
- `DELETE /store-config` - Delete store configuration (admin only)
- `POST /store-config/init` - Initialize default store configuration (admin only)

### Invoice & Receipt Endpoints

**Base:** `/api/invoices` and `/api/receipts`

- `GET /invoices/:invoiceId` - Get invoice by ID
- `GET /receipts/:receiptId` - Get receipt by ID

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

**Last Updated:** February 2026  
**Version:** 1.2.0
