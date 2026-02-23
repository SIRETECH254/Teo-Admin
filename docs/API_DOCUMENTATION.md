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
- **Update User Status/Roles**
  - **Endpoint:** `PUT /users/:userId/status`
  - **Request Body:**
    ```json
    {
      "status": "string",
      "roles": ["string"]
    }
    ```
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

#### Create Product
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

### Variant & Inventory Endpoints

**Base:** `/api/variants`

#### Create Variant
- **Endpoint:** `POST /variants`
- **Request Body:**
  ```json
  {
    "name": "string (e.g., Size)",
    "options": [
      { "value": "string (e.g., Small)" },
      { "value": "string (e.g., Large)" }
    ]
  }
  ```

#### Update SKU
- **Endpoint:** `PATCH /products/:productId/skus/:skuId`
- **Request Body:**
  ```json
  {
    "price": number,
    "stock": number,
    "sku": "string",
    "isActive": boolean
  }
  ```

---

### Marketing & Tool Endpoints

#### Coupons (`/api/coupons`)
- **Validate Coupon**
  - **Endpoint:** `POST /coupons/validate`
  - **Query Params:** `?orderAmount=number`
  - **Request Body:** `{ "code": "string" }`
- **Create Coupon**
  - **Endpoint:** `POST /coupons`
  - **Request Body:**
    ```json
    {
      "code": "string",
      "type": "percentage" | "fixed",
      "value": number,
      "minOrderAmount": number,
      "maxDiscount": number,
      "startDate": "date",
      "endDate": "date",
      "usageLimit": number,
      "isActive": boolean
    }
    ```

#### Packaging (`/api/packaging`)
- **Create Packaging**
  - **Endpoint:** `POST /packaging`
  - **Request Body:**
    ```json
    {
      "name": "string",
      "price": number,
      "isActive": boolean,
      "isDefault": boolean
    }
    ```

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
