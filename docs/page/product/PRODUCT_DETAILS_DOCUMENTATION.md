# Product Details Screen Documentation

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
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProductById } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { useAddToCart } from '../../hooks/useCart'
import { FiArrowLeft, FiShoppingCart, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiImage, FiCheck, FiPlus, FiMinus, FiHeart, FiShare2, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import VariantSelector from '../../components/common/VariantSelector'
import CartSuccessModal from '../../components/common/CartSuccessModal'
import ReviewsSection from '../../components/common/ReviewsSection'
import toast from 'react-hot-toast'
```

## Context and State Management
- **TanStack Query hooks:** `useGetProductById`, `useGetBrands`, `useGetCategories`, `useGetCollections`, `useGetTags`, `useGetVariants` for data fetching, and `useAddToCart` for cart mutation.
- **State management:** Local component state managed with `useState` hooks.
- **Memoization:** `useMemo` and `useCallback` used extensively for performance optimization.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Variant selection state:** `selectedVariants` object mapping variant IDs to selected option IDs.
- **SKU state:** `selectedSKU` object representing the currently selected SKU based on variant selections.
- **Quantity state:** `quantity` number for add to cart quantity.
- **Image gallery state:** `currentImageIndex` number for main image display.
- **Modal state:** `showCartSuccessModal` boolean for cart success modal visibility.

**`useGetProductById` hook (from `hooks/useProducts.js`):**
```javascript
export const useGetProductById = (productId) => {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const response = await productAPI.getProductById(productId)
            return response.data
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}
```

**`useAddToCart` hook (from `hooks/useCart.js`):**
```javascript
export const useAddToCart = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (cartData) => {
            const response = await cartAPI.addToCart(cartData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success('Item added to cart successfully')
        },
        onError: (error) => {
            console.error('Add to cart error:', error)
            toast.error(error.response?.data?.message || 'Failed to add item to cart')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-width container with white background (`bg-white`).
- **Header section:** Back button and product title.
- **Main content:** Two-column grid layout (images on left, info on right).
- **Image gallery:** Main image display with thumbnail navigation (up to 6 thumbnails).
- **Product information:** Title, status, pricing, classifications, variants, stock, add to cart.
- **Description section:** Full product description with HTML rendering.
- **Features section:** Bulleted list of product features.
- **Reviews section:** Integrated reviews component at bottom.
- **Cart success modal:** Modal displayed after successful add to cart.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  [← Back to Products]  Product Title                       │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │                  │  │  Product Title                │ │
│  │                  │  │  Status Badge                 │ │
│  │   Main Image     │  │                               │ │
│  │                  │  │  Price: KES 100               │ │
│  │                  │  │  SKU: ABC123                  │ │
│  └──────────────────┘  │                               │ │
│  ┌──┬──┬──┬──┬──┬──┐  │  Brand: Nike                  │ │
│  │  │  │  │  │  │  │  │  Categories: Shoes, Sports     │ │
│  │  │  │  │  │  │  │  │  Collections: Summer          │ │
│  └──┴──┴──┴──┴──┴──┘  │  Tags: New, Featured           │ │
│  Thumbnails           │                               │ │
│                       │  Variants:                     │ │
│                       │  [Size: Small] [Color: Red]    │ │
│                       │                               │ │
│                       │  Stock: In Stock (50 units)   │ │
│                       │                               │ │
│                       │  Quantity: [−] 1 [+]           │ │
│                       │  [🛒 Add to Cart]              │ │
│                       └──────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Description                                         │ │
│  │  [HTML content]                                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Features                                            │ │
│  │  ✓ Feature 1                                         │ │
│  │  ✓ Feature 2                                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Reviews Section                                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  [← Back to Products]                                         │
│                                                               │
│  Product Title                                                │
│                                                               │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │                    │  │  Product Title                │   │
│  │                    │  │  [Active] /slug               │   │
│  │                    │  │                               │   │
│  │   Main Image       │  │  💰 KES 1,000                 │   │
│  │   (Large)          │  │  ~~KES 1,200~~                │   │
│  │                    │  │  SKU: PROD-001                │   │
│  │                    │  │                               │   │
│  └────────────────────┘  │  📦 Brand: Nike              │   │
│  ┌──┬──┬──┬──┬──┬──┐  │  📊 Categories: Shoes          │   │
│  │ 1│ 2│ 3│ 4│ 5│ 6│  │  📚 Collections: Summer        │   │
│  └──┴──┴──┴──┴──┴──┘  │  🏷️ Tags: New, Featured        │   │
│                       │                               │   │
│                       │  Available Variants            │   │
│                       │  Size: [Small] [Medium] [Large] │   │
│                       │  Color: [Red] [Blue] [Green]   │   │
│                       │                               │   │
│                       │  Stock Status: In Stock        │   │
│                       │  Available: 50 units            │   │
│                       │  SKU: PROD-001-SM-RED          │   │
│                       │                               │   │
│                       │  Quantity for Size Small,      │   │
│                       │  Color Red:                    │   │
│                       │  [−] 1 [+]                     │   │
│                       │                               │   │
│                       │  [🛒 Add to Cart]              │   │
│                       └──────────────────────────────┘   │
│                                                               │
│  Description                                                  │
│  [HTML content of product description]                      │
│                                                               │
│  Features                                                     │
│  ✓ Feature 1                                                 │
│  ✓ Feature 2                                                 │
│  ✓ Feature 3                                                 │
│                                                               │
│  Reviews                                                      │
│  [ReviewsSection component]                                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Variant Selector** (using VariantSelector component)
  ```javascript
  <VariantSelector
      variants={populatedVariants}
      selectedOptions={selectedVariants}
      onOptionSelect={handleVariantChange}
      stockInfo={stockInfo}
  />
  ```

- **Quantity Input** (with increment/decrement buttons)
  ```javascript
  <div className="flex items-center border border-gray-300 rounded-lg">
      <button
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
      >
          <FiMinus className="h-4 w-4" />
      </button>
      <input
          type="number"
          min="1"
          max={selectedSKU?.stock || getTotalAvailableStock || 999}
          value={quantity}
          onChange={handleQuantityChange}
          className="w-16 px-2 py-2 text-center border-0 focus:ring-0 focus:outline-none"
      />
      <button
          onClick={increaseQuantity}
          disabled={quantity >= maxStock}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
      >
          <FiPlus className="h-4 w-4" />
      </button>
  </div>
  ```

- **Add to Cart Button**
  ```javascript
  <button
      onClick={handleAddToCart}
      disabled={!areAllVariantsSelected() || maxStock < quantity || addToCart.isPending}
      className="w-full btn-primary inline-flex items-center justify-center"
  >
      {addToCart.isPending ? (
          <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Adding to Cart...
          </>
      ) : (
          <>
              <FiShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
          </>
      )}
  </button>
  ```

- **Image Thumbnail Buttons**
  ```javascript
  {product.images && product.images.length > 1 && (
      <div className="grid grid-cols-6 gap-2">
          {product.images.slice(0, 6).map((image, index) => (
              <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      currentImageIndex === index
                          ? 'border-primary bg-light ring-2 ring-primary/20'
                          : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                  <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                  />
              </button>
          ))}
      </div>
  )}
  ```

- **Cart Success Modal**
  ```javascript
  <CartSuccessModal
      isOpen={showCartSuccessModal}
      onClose={() => setShowCartSuccessModal(false)}
      onContinueShopping={handleContinueShopping}
      onGoToCart={handleGoToCart}
      itemName={product?.name || "Product"}
  />
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `productAPI.getProductById` and `cartAPI.addToCart`.
- **Get product endpoint:** `GET /api/products/:id`.
- **Add to cart endpoint:** `POST /api/cart/add`.
- **Add to cart payload:** `{ productId: string, skuId: string, quantity: number, variantOptions: object }`.
- **Response contract:** 
  - Product: `response.data` contains product object with populated variants, SKUs, images, etc.
  - Add to cart: `response.data` contains cart update information.
- **Cache invalidation:** After adding to cart, `queryClient.invalidateQueries({ queryKey: ['cart'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`, `useParams`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- UI elements: `div`, `button`, `img`, `input`, `span`, `ul`, `li`, `h1`, `h2`, `h3`, `p`.
- `react-icons/fi` for icons (FiArrowLeft, FiShoppingCart, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiImage, FiCheck, FiPlus, FiMinus, FiHeart, FiShare2, FiStar, FiTruck, FiShield, FiRefreshCw).
- Custom components: `VariantSelector`, `CartSuccessModal`, `ReviewsSection`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.bg-light`).
- `react-hot-toast` for toast notifications.

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` is true.
- **Not found state:** Error message displayed if product doesn't exist with "Back to Products" button.
- **Variant selection validation:** Toast error if variants exist but not all are selected before adding to cart.
- **Stock validation:** Toast error if selected combination is out of stock or quantity exceeds available stock.
- **API errors:** Handled in `useAddToCart` hook's `onError` callback, displayed via toast notification.
- **SKU matching:** Automatically finds matching SKU based on selected variant options.

## Navigation Flow
- **Route:** `/products/:id/details`.
- **Entry points:**
  - From products list page via "View" (eye icon) button.
  - Direct URL navigation with product ID.
- **On mount:** Product data is fetched and variants are auto-selected to first available options.
- **Back navigation:** "Back to Products" button ➞ `/products`.
- **After add to cart:** Cart success modal appears with options to continue shopping or go to cart.
- **Go to cart:** Navigates to `/cart` page.

## Functions Involved

- **`handleAddToCart`** — Validates variant selection and stock, then adds item to cart.
  ```javascript
  const handleAddToCart = async () => {
      const populatedVariants = getPopulatedVariants

      // Check if variants exist and all are selected
      if (populatedVariants.length > 0 && !areAllVariantsSelected()) {
          toast.error('Please select all variant options')
          return
      }

      // Check if selected combination has stock
      if (populatedVariants.length > 0 && !hasSelectedCombinationStock()) {
          toast.error('Selected combination is out of stock')
          return
      }

      // Check quantity against available stock
      const maxStock = populatedVariants.length > 0
          ? (selectedSKU?.stock || 0)
          : getTotalAvailableStock

      if (maxStock < quantity) {
          toast.error(`Only ${maxStock} items available in stock for the selected option`)
          return
      }

      try {
          // Use selected SKU if variants exist, otherwise use first available SKU
          const skuId = populatedVariants.length > 0
              ? selectedSKU._id
              : getAvailableSKUs[0]?._id

          if (!skuId) {
              toast.error('No available SKU found')
              return
          }

          // Prepare variant options for backend
          const variantOptions = {}
          if (populatedVariants.length > 0) {
              populatedVariants.forEach(variant => {
                  const selectedOptionId = selectedVariants[variant._id]
                  if (selectedOptionId) {
                      variantOptions[variant._id] = selectedOptionId
                  }
              })
          }

          await addToCart.mutateAsync({
              productId: product._id,
              skuId: skuId,
              quantity: quantity,
              variantOptions: variantOptions
          })

          setShowCartSuccessModal(true)
      } catch (error) {
          console.error('Add to cart error:', error)
      }
  }
  ```

- **`handleVariantChange`** — Updates selected variant options.
  ```javascript
  const handleVariantChange = useCallback((variantId, optionId) => {
      setSelectedVariants(prev => ({
          ...prev,
          [variantId]: optionId
      }))
  }, [])
  ```

- **`handleQuantityChange`** — Updates quantity from input field.
  ```javascript
  const handleQuantityChange = useCallback((e) => {
      const value = parseInt(e.target.value)
      if (value > 0) {
          setQuantity(value)
      }
  }, [])
  ```

- **`increaseQuantity`** — Increments quantity (respects stock limits).
  ```javascript
  const increaseQuantity = useCallback(() => {
      const populatedVariants = getPopulatedVariants
      const maxStock = populatedVariants.length > 0
          ? (selectedSKU?.stock || 0)
          : getTotalAvailableStock

      if (quantity < maxStock) {
          setQuantity(prev => prev + 1)
      }
  }, [selectedSKU?.stock, getTotalAvailableStock, quantity, getPopulatedVariants])
  ```

- **`decreaseQuantity`** — Decrements quantity (minimum 1).
  ```javascript
  const decreaseQuantity = useCallback(() => {
      if (quantity > 1) {
          setQuantity(prev => prev - 1)
      }
  }, [quantity])
  ```

- **`handleContinueShopping`** — Closes cart modal and stays on page.
  ```javascript
  const handleContinueShopping = useCallback(() => {
      setShowCartSuccessModal(false)
      // Stay on the same page so user can add the same item again
  }, [])
  ```

- **`handleGoToCart`** — Closes cart modal and navigates to cart page.
  ```javascript
  const handleGoToCart = useCallback(() => {
      setShowCartSuccessModal(false)
      navigate('/cart')
  }, [navigate])
  ```

- **Auto-select variant options effect** — Automatically selects first available option for each variant.
  ```javascript
  useEffect(() => {
      if (product) {
          const populatedVariants = getPopulatedVariants
          const defaultSelections = {}

          populatedVariants.forEach(variant => {
              if (variant.options && variant.options.length > 0) {
                  // Select the first available option
                  const firstAvailableOption = variant.options.find(option => {
                      const skuForOption = product.skus?.find(sku =>
                          sku.attributes?.some(attr =>
                              attr.variantId === variant._id && attr.optionId === option._id
                          )
                      )
                      return skuForOption?.stock > 0
                  }) || variant.options[0]

                  defaultSelections[variant._id] = firstAvailableOption._id
              }
          })

          setSelectedVariants(defaultSelections)
      }
  }, [product, getPopulatedVariants])
  ```

- **SKU matching effect** — Finds matching SKU based on selected variant options.
  ```javascript
  useEffect(() => {
      if (product && product.skus && Object.keys(selectedVariants).length > 0) {
          const matchingSKU = product.skus.find(sku => {
              return sku.attributes.every(attr => 
                  selectedVariants[attr.variantId] === attr.optionId
              )
          })
          setSelectedSKU(matchingSKU || null)
      } else {
          setSelectedSKU(null)
      }
  }, [selectedVariants, product])
  ```

- **Utility functions** (memoized for performance):
  - `getPopulatedVariants`: Returns variants with populated options
  - `getAvailableSKUs`: Returns SKUs with stock > 0
  - `getTotalAvailableStock`: Returns sum of all available stock
  - `areAllVariantsSelected`: Checks if all variants have selected options
  - `hasSelectedCombinationStock`: Checks if selected combination has stock
  - `getBrandName`: Gets brand name from brand ID
  - `getCategoryNames`: Gets category names from category IDs
  - `getCollectionNames`: Gets collection names from collection IDs
  - `getTagNames`: Gets tag names from tag IDs

## Future Enhancements
- Add wishlist functionality (save for later).
- Add product sharing functionality (social media, email).
- Add product comparison feature.
- Add recently viewed products tracking.
- Add product recommendations based on current product.
- Add zoom functionality for product images.
- Add 360-degree product view.
- Add product video support.
- Add size guide/chart for products with size variants.
- Add customer questions and answers section.
- Add product availability notifications (notify when back in stock).
- Add bulk quantity discounts display.
- Add product bundle suggestions.
- Add related products carousel.
- Add product customization options.
- Add AR/VR product preview.
