# Edit Product Screen Documentation

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
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useGetProductById, useUpdateProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { FiPlus, FiX, FiImage, FiSave, FiArrowLeft, FiArrowRight, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiBox, FiInfo, FiEye, FiCheck, FiEdit2 } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'
import VariantSelector from '../../components/common/VariantSelector'
```

## Context and State Management
- **TanStack Query hooks:** `useGetProductById`, `useUpdateProduct`, `useGetBrands`, `useGetCategories`, `useGetCollections`, `useGetTags`, `useGetVariants` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Memoization:** `useMemo` and `useCallback` used extensively for performance optimization.
- **URL params:** `id` extracted from URL using `useParams()` hook.
- **Tab state:** `activeTab` string ('basic', 'organization', 'pricing', 'variants', 'images', 'settings', 'summary').
- **Variant selection state:** `selectedVariantOptions` object for variant preview functionality.
- **Form state:** `formData` object containing all product fields (same structure as AddProduct).
- **Image states:** Separate states for existing images (from database) and new images (uploaded in this session):
  - `existingImages`: Array of image objects with `url`, `public_id`, `_id`, `isPrimary`
  - `newImages`: Array of File objects with preview URLs
- **Feature state:** `newFeature` string for adding features dynamically.
- **Loading state:** `isLoading` boolean for initial product data loading.

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

**`useUpdateProduct` hook (from `hooks/useProducts.js`):**
```javascript
export const useUpdateProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, productData }) => {
            const response = await productAPI.updateProduct(productId, productData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
            toast.success(data.message || 'Product updated successfully')
            return data
        },
        onError: (error) => {
            console.error('Update product error:', error)
            toast.error(error.response?.data?.message || 'Failed to update product')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-height container with gray background (`bg-gray-50`).
- **Header section:** Title and description in white card.
- **Tab navigation:** Horizontal tab bar with icons and labels (same as AddProduct).
- **Tab content area:** Dynamic content based on active tab (minimum 400px height).
- **Tab navigation actions:** Previous/Next buttons or Cancel/Update button at bottom.
- **Loading state:** Skeleton loader displayed while product data is loading.
- **Not found state:** Error message displayed if product doesn't exist.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Edit Product                                         │ │
│  │  Update product information with variants and SKUs    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Basic Info] [Organization] [Pricing] [Variants]      │ │
│  │  [Images] [Settings] [Summary]                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Tab Content Area                                      │ │
│  │  (Pre-populated with existing product data)           │ │
│  │                                                         │ │
│  │  - Images tab shows existing + new images separately  │ │
│  │  - Variants tab shows variant preview                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Cancel/Previous]              [Next/Update Product]  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Edit Product                                                  │
│  Update product information with variants and SKUs           │
│                                                               │
│  [ℹ️ Basic Info] [📦 Organization] [💰 Pricing] [📦 Variants] │
│  [🖼️ Images] [⚙️ Settings] [👁️ Summary]                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Current Product Variants                            │   │
│  │  This product currently has 2 variants attached.     │   │
│  │                                                       │   │
│  │  Select Variants                                      │   │
│  │  [✓] Size (Small, Medium, Large)                     │   │
│  │  [✓] Color (Red, Blue, Green)                        │   │
│  │  [ ] Material (Cotton, Polyester)                    │   │
│  │                                                       │   │
│  │  ✓ 2 variants selected. SKUs will be auto-generated.  │   │
│  │                                                       │   │
│  │  Variant Options Preview (Customer View)              │   │
│  │  [VariantSelector component]                          │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  [← Previous]                                [Next →]        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

### Basic Info Tab
(Same as AddProduct - title, short description, full description with RichTextEditor)

### Organization Tab
(Same as AddProduct - brand, categories, collections, tags with checkboxes)

### Pricing Tab
(Same as AddProduct - base price, compare price)

### Variants Tab
- **Current Variants Info Banner**
  ```javascript
  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-blue-900 mb-2">Current Product Variants</h3>
      <p className="text-sm text-blue-700">
          This product currently has {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''} attached.
          You can modify the selection below.
      </p>
  </div>
  ```

- **Variant Selection** (with visual feedback for selected variants)
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {variants.map(variant => {
          const isSelected = formData.variants.some(item => {
              if (typeof item === 'string') {
                  return item === variant._id
              } else if (typeof item === 'object' && item._id) {
                  return item._id === variant._id
              }
              return false
          })
          
          return (
              <label key={variant._id} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200'
              }`}>
                  <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleArrayChange('variants', variant._id, e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="ml-3 flex-1">
                      <span className={`text-sm font-medium ${
                          isSelected ? 'text-primary' : 'text-gray-900'
                      }`}>
                          {variant.name}
                      </span>
                      {isSelected && (
                          <FiCheck className="h-4 w-4 text-primary" />
                      )}
                  </div>
              </label>
          )
      })}
  </div>
  ```

- **Selected Variants Summary**
  ```javascript
  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
          Selected Variants:
      </h4>
      <div className="flex flex-wrap gap-2">
          {formData.variants.map((variantId, index) => {
              const variant = variants.find(v => v._id === variantId)
              return (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                      <FiCheck className="mr-1 h-3 w-3" />
                      {variant?.name || 'Unknown Variant'}
                      {variant?.options && variant.options.length > 0 && (
                          <span className="ml-1 text-xs opacity-75">
                              ({variant.options.length} options)
                          </span>
                      )}
                  </span>
              )
          })}
      </div>
  </div>
  ```

- **Variant Options Preview**
  ```javascript
  <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <VariantSelector
          variants={variants.filter(v => formData.variants.includes(v._id))}
          selectedOptions={selectedVariantOptions}
          onOptionSelect={handleVariantOptionSelect}
          className="max-w-md"
      />
  </div>
  ```

### Images Tab
- **New Images Upload Area**
  ```javascript
  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <FiImage className="w-8 h-8 mb-2 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
      </div>
      <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleNewImages}
          className="hidden"
      />
  </label>
  ```

- **New Images Preview** (with "New" badge)
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {newImages.map((file, index) => (
          <div key={index} className="relative group">
              <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  New
              </div>
              <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                  <FiX className="h-3 w-3" />
              </button>
          </div>
      ))}
  </div>
  ```

- **Existing Images Display** (with "Primary" and "Existing" badges)
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {existingImages.map((image, index) => (
          <div key={index} className="relative group">
              <img
                  src={image.url}
                  alt={image.alt || 'Product image'}
                  className={`w-full h-24 object-cover rounded-lg border-2 ${
                      image.isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                  }`}
              />
              {image.isPrimary && (
                  <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Primary
                  </div>
              )}
              <div className="absolute top-1 right-8 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Existing
              </div>
              <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                  <FiX className="h-3 w-3" />
              </button>
          </div>
      ))}
  </div>
  ```

### Settings Tab
(Same as AddProduct - status, weight, track inventory toggle, features management)

### Summary Tab
(Same as AddProduct - summary cards with edit buttons, shows total images count including both existing and new)

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `productAPI.getProductById` and `productAPI.updateProduct`.
- **Get product endpoint:** `GET /api/products/:id`.
- **Update product endpoint:** `PUT /api/products/:id`.
- **Content-Type:** `multipart/form-data` (for file uploads).
- **Payload:** FormData object containing:
  - Text fields: Same as AddProduct
  - JSON arrays: Same as AddProduct
  - New files: `images[]` (multiple File objects)
  - Keep existing images: `keepImagePublicIds`, `keepImageDocIds`, `keepImages` (stringified arrays of IDs)
- **Response contract:** `response.data` contains `{ success: true, message: string, data: product }`.
- **Cache invalidation:** After successful update, both `['products']` and `['product', id]` queries are invalidated.

## Components Used
- React + React Router DOM: `useNavigate`, `useParams`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: Same as AddProduct.
- `react-icons/fi` for icons (same as AddProduct plus FiEdit2).
- Custom components: `RichTextEditor`, `ToggleSwitch`, `VariantSelector`.
- Tailwind CSS classes for styling with custom classes (same as AddProduct).

## Error Handling
- **Loading states:** Skeleton loader displayed while `isLoading` or `productLoading` is true.
- **Not found state:** Error message displayed if product doesn't exist with "Back to Products" button.
- **Form validation:** Same as AddProduct.
- **File validation:** Same as AddProduct.
- **API errors:** Handled in `useUpdateProduct` hook's `onError` callback, displayed via toast notification.
- **Memory cleanup:** Object URLs for new image previews are revoked in cleanup effect.
- **Variant data handling:** Handles both string IDs and populated variant objects in formData.

## Navigation Flow
- **Route:** `/products/:id/edit`.
- **Entry points:**
  - From products list page via "Edit" button.
  - Direct URL navigation with product ID.
- **On mount:** Product data is fetched and form is pre-populated.
- **Tab navigation:** Same as AddProduct.
- **On successful update:** `navigate('/products')` redirects to products list.
- **On cancel:** `navigate('/products')` returns to products list without saving.
- **Product not found:** Displays error message with option to return to products list.

## Functions Involved

- **`handleSubmit`** — Creates FormData, appends fields, new images, and keepImages arrays, submits via mutation.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()

      try {
          const fd = new FormData()

          // Append non-file fields
          Object.keys(formData).forEach(key => {
              if (key === 'categories' || key === 'collections' || key === 'tags' || key === 'variants' || key === 'features') {
                  fd.append(key, JSON.stringify(formData[key]))
              } else {
                  fd.append(key, formData[key])
              }
          })

          // Append new files
          newImages.forEach((file) => {
              fd.append("images", file, file.name)
          })

          // Send which existing images to KEEP
          fd.append("keepImagePublicIds", JSON.stringify(existingImages.map(img => img.public_id).filter(Boolean)))
          fd.append("keepImageDocIds", JSON.stringify(existingImages.map(img => img._id).filter(Boolean)))
          fd.append("keepImages", JSON.stringify(existingImages.map(img => img.public_id).filter(Boolean)))

          await updateProduct.mutateAsync({ productId: id, productData: fd })
          navigate('/products')
      } catch (error) {
          console.error('Submit error:', error)
      }
  }
  ```

- **`handleArrayChange`** — Enhanced version that handles both string IDs and variant objects.
  ```javascript
  const handleArrayChange = useCallback((field, value, checked) => {
      setFormData(prev => {
          const currentArray = prev[field] || []
          const valueId = typeof value === 'object' && value._id ? value._id : value
          
          let newArray
          if (checked) {
              const isPresent = currentArray.some(item => {
                  const itemId = typeof item === 'object' && item._id ? item._id : item
                  return itemId === valueId
              })
              
              if (!isPresent) {
                  newArray = [...currentArray, valueId]
              } else {
                  newArray = currentArray
              }
          } else {
              newArray = currentArray.filter(item => {
                  const itemId = typeof item === 'object' && item._id ? item._id : item
                  return itemId !== valueId
              })
          }
          
          return { ...prev, [field]: newArray }
      })
  }, [])
  ```

- **`handleNewImages`** — Handles new image file selection.
  ```javascript
  const handleNewImages = useCallback((e) => {
      const files = Array.from(e.target.files || [])
      setNewImages(files)
  }, [])
  ```

- **`removeNewImage`** — Removes new image from selection.
  ```javascript
  const removeNewImage = useCallback((index) => {
      setNewImages(prev => prev.filter((_, i) => i !== index))
  }, [])
  ```

- **`removeExistingImage`** — Removes existing image from keep list.
  ```javascript
  const removeExistingImage = useCallback((index) => {
      setExistingImages(prev => prev.filter((_, i) => i !== index))
  }, [])
  ```

- **`handleVariantOptionSelect`** — Updates variant option selection for preview.
  ```javascript
  const handleVariantOptionSelect = useCallback((variantId, optionId) => {
      setSelectedVariantOptions(prev => ({
          ...prev,
          [variantId]: optionId
      }))
  }, [])
  ```

- **Product data loading effect** — Loads product data and populates form.
  ```javascript
  useEffect(() => {
      if (product) {
          // Process variants to ensure they are in the correct format
          const processedVariants = Array.isArray(product.variants) 
              ? product.variants.map(variant => {
                  if (typeof variant === 'object' && variant._id) {
                      return variant._id
                  }
                  return variant
              })
              : []
          
          setFormData({
              title: product.title || '',
              description: product.description || '',
              shortDescription: product.shortDescription || '',
              brand: product.brand?._id || product.brand || '',
              categories: product.categories?.map(cat => cat._id || cat) || [],
              collections: product.collections?.map(col => col._id || col) || [],
              tags: Array.isArray(product.tags) ? product.tags : [],
              basePrice: product.basePrice?.toString() || '',
              comparePrice: product.comparePrice?.toString() || '',
              variants: processedVariants,
              status: product.status || 'draft',
              metaTitle: product.metaTitle || '',
              metaDescription: product.metaDescription || '',
              trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
              weight: product.weight?.toString() || '',
              features: product.features || []
          })

          setExistingImages(product.images || [])
          setIsLoading(false)
      }
  }, [product])
  ```

- **Cleanup effect** — Revokes object URLs for new images on unmount.
  ```javascript
  useEffect(() => {
      return () => {
          newImages.forEach(file => {
              if (file.preview) {
                  URL.revokeObjectURL(file.preview)
              }
          })
      }
  }, [newImages])
  ```

(Other functions same as AddProduct: `handleInputChange`, `handleDescriptionChange`, `addFeature`, `removeFeature`, `goToNextTab`, `goToPreviousTab`, `handleCancel`)

## Future Enhancements
- Add image reordering functionality (drag and drop).
- Add set primary image functionality from existing images.
- Add image replacement (replace existing image with new one).
- Add variant option editing directly from product edit page.
- Add SKU management tab (view/edit/delete SKUs).
- Add product history/version tracking.
- Add rollback to previous version functionality.
- Add product comparison (compare with another product).
- Add bulk image operations (set all as primary, delete all, etc.).
- Add image optimization before upload.
- Add product preview mode (see how it looks to customers).
- Add change tracking (highlight what fields were modified).
- Add form auto-save as draft.
- Add product analytics integration.
