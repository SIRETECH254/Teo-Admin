# TanStack Query Documentation

## Overview

This document provides comprehensive documentation for TanStack Query (React Query) implementation in the TEO-ADMIN application. TanStack Query is used for server state management, providing data fetching, caching, synchronization, and updating capabilities.

**Location:** All TanStack Query hooks are located in the `src/hooks/` folder.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Setup and Configuration](#setup-and-configuration)
3. [QueryClient Configuration](#queryclient-configuration)
4. [Custom Hooks Pattern](#custom-hooks-pattern)
5. [Query Hooks (useQuery)](#query-hooks-usequery)
6. [Mutation Hooks (useMutation)](#mutation-hooks-usemutation)
7. [Cache Invalidation Strategies](#cache-invalidation-strategies)
8. [Error Handling Patterns](#error-handling-patterns)
9. [Best Practices](#best-practices)
10. [Usage Examples](#usage-examples)
11. [Integration with Existing Code](#integration-with-existing-code)
12. [Troubleshooting](#troubleshooting)
13. [Notes](#notes)

---

## Introduction

TanStack Query (formerly React Query) is a powerful data synchronization library for React applications. It provides:

- **Automatic Caching**: Data is cached automatically with configurable stale times
- **Background Refetching**: Keeps data fresh automatically
- **Request Deduplication**: Prevents duplicate requests
- **Optimistic Updates**: Update UI before server confirms
- **Error Handling**: Built-in error states and retry logic
- **Loading States**: Built-in loading and fetching states

### Why TanStack Query?

- Reduces boilerplate code for data fetching
- Provides excellent developer experience
- Handles complex caching scenarios automatically
- Works seamlessly with existing API layer (axios)
- Integrates well with Redux for client state

---

## Setup and Configuration

### Installation

```bash
npm install @tanstack/react-query
```

### Provider Setup

The QueryClientProvider is set up in `src/main.jsx`:

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Wrap your app
<QueryClientProvider client={queryClient}>
  {/* Your app */}
</QueryClientProvider>
```

---

## QueryClient Configuration

### Default Options

The QueryClient is configured with the following default options:

- **staleTime**: `5 * 60 * 1000` (5 minutes)
  - Data is considered fresh for 5 minutes
  - No refetch occurs during this time

- **gcTime**: `10 * 60 * 1000` (10 minutes, formerly cacheTime)
  - Unused data is garbage collected after 10 minutes
  - Data remains in cache for this duration even if not used

- **retry**: `1`
  - Failed requests are retried once
  - Reduces unnecessary network calls

- **refetchOnWindowFocus**: `false`
  - Prevents automatic refetch when window regains focus
  - Better for admin dashboard workflows

### Mutation Default Options

- **retry**: `1`
  - Failed mutations are retried once

---

## Custom Hooks Pattern

### Folder Structure

All TanStack Query hooks are organized in the `src/hooks/` folder:

```
src/
└── hooks/
    ├── useBrands.js
    ├── useCart.js
    ├── useCategories.js
    ├── useCollections.js
    ├── useCoupons.js
    ├── usePackaging.js
    ├── useProducts.js
    ├── useReviews.js
    ├── useRoles.js
    ├── useStats.js
    ├── useStoreConfig.js
    ├── useTags.js
    ├── useUsers.js
    └── useVariants.js
```

**Note:** Some hooks still use the deprecated `cacheTime` property instead of `gcTime`. The hooks using `cacheTime` are:
- `useUsers.js`
- `useProducts.js`

These should be updated to use `gcTime` in the future for consistency.

### Hook Naming Convention

- **Query Hooks**: `useGet[Resource]` or `useGet[Resource]ById`
  - Example: `useGetUsers`, `useGetUserById`, `useGetProducts`, `useGetProductById`

- **Mutation Hooks**: `use[Action][Resource]`
  - Example: `useCreateProduct`, `useUpdateUser`, `useDeleteCoupon`, `useCreateBrand`

---

## Query Hooks (useQuery)

Query hooks are used for GET operations (fetching data).

### Basic Structure

```javascript
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api';

export const useGetUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
```

### Query Hook Options

- **queryKey**: Array that uniquely identifies the query
  - Format: `['resource', params/id]`
  - Used for cache management and invalidation

- **queryFn**: Async function that fetches data
  - Must return a Promise
  - Typically calls API and returns `response.data`

- **enabled**: Boolean to conditionally enable/disable query
  - Useful when query depends on other data
  - Example: `enabled: !!userId`

- **staleTime**: Time in milliseconds before data is considered stale
  - Default: 5 minutes (from QueryClient config)

- **gcTime**: Time in milliseconds before unused data is garbage collected
  - Default: 10 minutes (from QueryClient config)

### Query Hook Return Value

```typescript
const {
  data,           // The data returned from queryFn
  isLoading,      // True if query is fetching for the first time
  isFetching,     // True if query is fetching (including refetches)
  isError,        // True if query encountered an error
  error,          // Error object if query failed
  refetch,        // Function to manually refetch
  isSuccess,      // True if query succeeded
} = useGetUsers();
```

### Conditional Queries

```typescript
export const useGetUserById = (userId) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data;
    },
    enabled: !!userId, // Only run if userId exists
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
```

---

## Mutation Hooks (useMutation)

Mutation hooks are used for POST, PUT, PATCH, and DELETE operations.

### Basic Structure

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAPI } from '../api';

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData) => {
      const response = await serviceAPI.createService(serviceData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service created successfully');
    },
    onError: (error) => {
      console.error('Create service error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create service';
      console.error('Error:', errorMessage);
    },
  });
};
```

### Mutation Hook Options

- **mutationFn**: Async function that performs the mutation
  - Receives variables as parameter
  - Must return a Promise

- **onSuccess**: Callback executed on successful mutation
  - Typically used for cache invalidation and notifications

- **onError**: Callback executed on mutation failure
  - Typically used for error handling and notifications

### Mutation Hook Return Value

```typescript
const {
  mutate,         // Function to trigger mutation
  mutateAsync,    // Async function that returns a Promise
  isPending,      // True if mutation is in progress
  isError,        // True if mutation failed
  error,          // Error object if mutation failed
  isSuccess,      // True if mutation succeeded
  data,           // Data returned from successful mutation
  reset,          // Function to reset mutation state
} = useCreateService();

// Usage
mutate(serviceData);
// or
await mutateAsync(serviceData);
```

### Mutation with Variables

```typescript
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, serviceData }) => {
      const response = await serviceAPI.updateService(serviceId, serviceData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and specific service
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      console.log('Service updated successfully');
    },
    onError: (error) => {
      console.error('Update service error:', error);
    },
  });
};
```

---

## Cache Invalidation Strategies

### Invalidate Queries

Invalidate queries to trigger refetch:

```javascript
// Invalidate all queries with key 'users'
queryClient.invalidateQueries({ queryKey: ['users'] });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: ['user', userId] });

// Invalidate all queries starting with 'appointment'
queryClient.invalidateQueries({ queryKey: ['appointment'] });
```

### Refetch Queries

Manually refetch queries:

```javascript
// Refetch all 'appointments' queries
queryClient.refetchQueries({ queryKey: ['appointments'] });
```

### Update Query Data

Update cache directly without refetching:

```javascript
queryClient.setQueryData(['user', userId], (oldData) => {
  return { ...oldData, ...updatedData };
});
```

### Common Patterns

1. **After Create**: Invalidate list query
   ```javascript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['services'] });
   }
   ```

2. **After Update**: Invalidate both list and item queries
   ```javascript
   onSuccess: (_, variables) => {
     queryClient.invalidateQueries({ queryKey: ['appointments'] });
     queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
   }
   ```

3. **After Delete**: Invalidate list query
   ```javascript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['users'] });
   }
   ```

---

## Error Handling Patterns

### Query Error Handling

```javascript
const { data, isError, error } = useGetUsers();

if (isError) {
  const errorMessage = error?.response?.data?.message || 'Failed to fetch users';
  // Handle error (show toast, alert, etc.)
}
```

### Mutation Error Handling

```javascript
const createService = useCreateService();

const handleCreate = async (formData) => {
  try {
    await createService.mutateAsync(formData);
    // Success handling
  } catch (error) {
    const errorMessage = error?.response?.data?.message || 'Failed to create service';
    // Error handling
  }
};
```

### Global Error Handling

Errors are logged in the mutation's `onError` callback. For user-facing errors, consider:

- Toast notifications (can be added later)
- Alert dialogs
- Error state in UI components

---

## Best Practices

### 1. Query Key Structure

- Use consistent, hierarchical query keys
- Include all parameters that affect the query
- Example: `['appointments', { page: 1, limit: 10 }]`

### 2. Stale Time Configuration

- Set appropriate stale times based on data freshness requirements
- Use longer stale times for relatively static data
- Use shorter stale times for frequently changing data

### 3. Conditional Queries

- Use `enabled` option to prevent unnecessary queries
- Example: `enabled: !!appointmentId` prevents query when appointmentId is missing

### 4. Cache Invalidation

- Invalidate related queries after mutations
- Invalidate both list and detail queries after updates
- Consider optimistic updates for better UX

### 5. Error Handling

- Always handle errors in mutations
- Provide user-friendly error messages
- Log errors for debugging

### 7. Performance

- Use `staleTime` to reduce unnecessary refetches
- Use `gcTime` to manage cache size
- Consider pagination for large datasets

---

## Usage Examples

### Example 1: Fetching Data

```typescript
import { useGetUsers } from '../hooks/useUsers';

function UsersList() {
  const { data, isLoading, isError, error } = useGetUsers({ page: 1, limit: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      {data?.data?.items?.map((user) => (
        <div key={user._id}>{user.firstName} {user.lastName}</div>
      ))}
    </div>
  );
}
```

### Example 2: Creating Data

```typescript
import { useCreateProduct } from '../hooks/useProducts';

function CreateProductForm() {
  const createProduct = useCreateProduct();

  const handleSubmit = async (formData) => {
    try {
      await createProduct.mutateAsync(formData);
      // Navigate or show success message
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <button onClick={() => handleSubmit(formData)} disabled={createProduct.isPending}>
      {createProduct.isPending ? 'Creating...' : 'Create Product'}
    </button>
  );
}
```

### Example 3: Updating Data

```typescript
import { useUpdateProduct } from '../hooks/useProducts';

function EditProduct({ productId }) {
  const updateProduct = useUpdateProduct();

  const handleUpdate = async (productData) => {
    try {
      await updateProduct.mutateAsync({ productId, productData });
      // Show success message
    } catch (error) {
      // Error handling
    }
  };

  return <button onClick={() => handleUpdate({ title: 'Updated Product' })}>Update</button>;
}
```

### Example 4: Conditional Query

```typescript
import { useGetProductById } from '../hooks/useProducts';

function ProductDetails({ productId }) {
  const { data, isLoading } = useGetProductById(productId || '');

  if (!productId) return <div>No product selected</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.data?.product?.title}</div>;
}
```

### Example 5: Multiple Queries

```typescript
import { useGetProducts } from '../hooks/useProducts';
import { useOverviewStats } from '../hooks/useStats';

function Dashboard() {
  const { data: products } = useGetProducts({ page: 1, limit: 5 });
  const { data: stats } = useOverviewStats();

  return (
    <div>
      <div>Products: {products?.data?.items?.length}</div>
      <div>Total Sales: {stats?.data?.overview?.totalSales}</div>
    </div>
  );
}
```

---

## Integration with Existing Code

### API Layer

TanStack Query hooks use the existing API layer (`src/api/index.js`):

```javascript
import { productAPI } from '../api';

export const useGetProductById = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await productAPI.getProductById(productId);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
```

### Redux Integration

- TanStack Query handles server state (data from API)
- Redux handles client state (UI state, auth state)
- Both can coexist in the same application

### Auth Context

- Authentication is handled in `AuthContext` (`src/contexts/AuthContext.jsx`)
- API interceptors handle token management (`src/api/config.js`)
- TanStack Query hooks automatically use authenticated requests

---

## Troubleshooting

### Common Issues

1. **Queries not refetching**
   - Check `staleTime` configuration
   - Verify query keys are correct
   - Ensure `refetchOnWindowFocus` is not blocking

2. **Cache not invalidating**
   - Verify query keys match exactly
   - Check that `invalidateQueries` is called in `onSuccess`

3. **Multiple requests**
   - Check if queries are enabled unnecessarily
   - Verify request deduplication is working

---

## Notes

- All hooks follow JavaScript conventions
- Error handling uses console.error (toast notifications can be added later)
- Cache invalidation follows consistent patterns
- Query keys are structured as arrays: `['resource', params/id]`
- Hooks are organized by resource type for better maintainability
- Import paths in examples may need adjusting depending on component location

---

## Available Hooks by Resource

### Product Hooks (`useProducts.js`)

- `useGetProducts(params)` - Fetch all products with optional filtering
- `useGetProductById(productId)` - Fetch a single product by ID
- `useCreateProduct()` - Create a new product
- `useUpdateProduct()` - Update an existing product
- `useDeleteProduct()` - Delete a product
- `useUploadProductImages()` - Upload images for a product
- `useDeleteProductImage()` - Delete a product image
- `useSetPrimaryImage()` - Set a product's primary image
- `useUpdateSKU()` - Update a product SKU
- `useDeleteSKU()` - Delete a product SKU
- `useGenerateSKUs()` - Generate SKUs for a product

### User Hooks (`useUsers.js`)

- `useGetUsers(params)` - Fetch all users (admin only)
- `useGetUserById(userId)` - Fetch a single user by ID
- `useUpdateUserStatus()` - Update user status/roles
- `useDeleteUser()` - Delete a user

### Coupon Hooks (`useCoupons.js`)

- `useGetAllCoupons(params)` - Fetch all coupons (admin only)
- `useGetCouponById(couponId)` - Fetch a single coupon by ID
- `useGetCouponStats()` - Get coupon statistics
- `useCreateCoupon()` - Create a new coupon
- `useUpdateCoupon()` - Update an existing coupon
- `useDeleteCoupon()` - Delete a coupon
- `useValidateCoupon()` - Validate a coupon code (public)
- `useApplyCoupon()` - Apply a coupon to an order
- `useGenerateNewCode()` - Generate a new coupon code

### Category Hooks (`useCategories.js`)

- `useGetCategories(params)` - Fetch all categories
- `useGetCategoryById(categoryId)` - Fetch a single category by ID
- `useCreateCategory()` - Create a new category
- `useUpdateCategory()` - Update an existing category
- `useDeleteCategory()` - Delete a category

### Brand Hooks (`useBrands.js`)

- `useGetBrands(params)` - Fetch all brands
- `useGetBrandById(brandId)` - Fetch a single brand by ID
- `useCreateBrand()` - Create a new brand
- `useUpdateBrand()` - Update an existing brand
- `useDeleteBrand()` - Delete a brand

### Variant Hooks (`useVariants.js`)

- `useGetVariants(params)` - Fetch all variants
- `useGetVariantById(variantId)` - Fetch a single variant by ID
- `useGetActiveVariants()` - Fetch only active variants
- `useCreateVariant()` - Create a new variant
- `useUpdateVariant()` - Update an existing variant
- `useDeleteVariant()` - Delete a variant

### Stats Hooks (`useStats.js`)

- `useOverviewStats()` - Fetch store overview statistics
- `useAnalytics(params)` - Fetch analytics data with optional date range

### Store Config Hooks (`useStoreConfig.js`)

- `useGetStoreConfig()` - Fetch store configuration
- `useGetStoreConfigStatus()` - Fetch store configuration status
- `useCreateStoreConfig()` - Create store configuration
- `useUpdateStoreConfig()` - Update store configuration
- `useDeleteStoreConfig()` - Delete store configuration
- `useInitStoreConfig()` - Initialize default store configuration

---

**Last Updated:** February 2026  
**Version:** 1.0.0

