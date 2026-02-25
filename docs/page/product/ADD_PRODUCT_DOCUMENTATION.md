# Add Product Screen Documentation

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
import { useNavigate } from 'react-router-dom'
import { useCreateProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { FiPlus, FiX, FiImage, FiSave, FiArrowLeft, FiArrowRight, FiPackage, FiGrid, FiEdit2, FiTag, FiLayers, FiDollarSign, FiBox, FiInfo, FiEye, FiCheck } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'
```

## Context and State Management
- **TanStack Query hooks:** `useCreateProduct`, `useGetBrands`, `useGetCategories`, `useGetCollections`, `useGetTags`, `useGetVariants` for data fetching and mutations.
- **State management:** Local component state managed with `useState` hooks.
- **Memoization:** `useMemo` and `useCallback` used extensively for performance optimization.
- **Tab state:** `activeTab` string ('basic', 'organization', 'pricing', 'variants', 'images', 'settings', 'summary').
- **Form state:** `formData` object containing all product fields:
  - `title`, `description`, `shortDescription`
  - `brand`, `categories[]`, `collections[]`, `tags[]`
  - `basePrice`, `comparePrice`
  - `variants[]`
  - `status` ('draft', 'active', 'archived')
  - `metaTitle`, `metaDescription`
  - `trackInventory` (boolean)
  - `weight`
  - `features[]`
- **File state:** `files` array containing `{ file: File, preview: string }` objects for image uploads.
- **Feature state:** `newFeature` string for adding features dynamically.

**`useCreateProduct` hook (from `hooks/useProducts.js`):**
```javascript
export const useCreateProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (formData) => {
            const response = await productAPI.createProduct(formData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success(data.message || 'Product created successfully')
            return data
        },
        onError: (error) => {
            console.error('Create product error:', error)
            toast.error(error.response?.data?.message || 'Failed to create product')
        }
    })
}
```

## UI Structure
- **Screen shell:** Full-height container with gray background (`bg-gray-50`).
- **Header section:** Title and description in white card.
- **Tab navigation:** Horizontal tab bar with icons and labels.
- **Tab content area:** Dynamic content based on active tab (minimum 400px height).
- **Tab navigation actions:** Previous/Next buttons or Cancel/Create button at bottom.
- **Form sections:** Each tab contains relevant form fields grouped logically.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Add New Product                                       │ │
│  │  Create a new product with variants and SKUs          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Basic Info] [Organization] [Pricing] [Variants]     │ │
│  │  [Images] [Settings] [Summary]                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Tab Content Area                                      │ │
│  │  (Dynamic based on active tab)                        │ │
│  │                                                         │ │
│  │  - Basic Info: Title, descriptions                     │ │
│  │  - Organization: Brand, categories, collections, tags  │ │
│  │  - Pricing: Base price, compare price                  │ │
│  │  - Variants: Variant selection                         │ │
│  │  - Images: Image upload with preview                   │ │
│  │  - Settings: Status, weight, inventory, features       │ │
│  │  - Summary: Review all entered data                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Cancel/Previous]              [Next/Create Product]  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Add New Product                                              │
│  Create a new product with variants and SKUs                  │
│                                                               │
│  [ℹ️ Basic Info] [📦 Organization] [💰 Pricing] [📦 Variants] │
│  [🖼️ Images] [⚙️ Settings] [👁️ Summary]                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Product Title *                                      │   │
│  │  [_________________________________]                  │   │
│  │                                                       │   │
│  │  Short Description                                    │   │
│  │  [_________________________________]                  │   │
│  │  [_________________________________]                  │   │
│  │                                                       │   │
│  │  Full Description                                     │   │
│  │  [Rich Text Editor]                                   │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  [Cancel]                                    [Next →]        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

### Basic Info Tab
- **Product Title**
  ```javascript
  <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleInputChange}
      required
      className="input"
      placeholder="Enter product title"
  />
  ```

- **Short Description**
  ```javascript
  <textarea
      name="shortDescription"
      value={formData.shortDescription}
      onChange={handleInputChange}
      rows={3}
      className="input"
      placeholder="Brief description (max 200 characters)"
      maxLength={200}
  />
  ```

- **Full Description (Rich Text Editor)**
  ```javascript
  <RichTextEditor
      content={formData.description}
      onChange={handleDescriptionChange}
      placeholder="Detailed product description"
  />
  ```

### Organization Tab
- **Brand Select**
  ```javascript
  <select
      name="brand"
      value={formData.brand}
      onChange={handleInputChange}
      className="input"
  >
      <option value="">Select Brand</option>
      {brands.map(brand => (
          <option key={brand._id} value={brand._id}>{brand.name}</option>
      ))}
  </select>
  ```

- **Categories (Multi-select Checkboxes)**
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
      {categories.map(category => (
          <label key={category._id} className="flex items-center">
              <input
                  type="checkbox"
                  checked={formData.categories.includes(category._id)}
                  onChange={(e) => handleArrayChange('categories', category._id, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{category.name}</span>
          </label>
      ))}
  </div>
  ```

- **Collections (Multi-select Checkboxes)**
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
      {collections.map(collection => (
          <label key={collection._id} className="flex items-center">
              <input
                  type="checkbox"
                  checked={formData.collections.includes(collection._id)}
                  onChange={(e) => handleArrayChange('collections', collection._id, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{collection.name}</span>
          </label>
      ))}
  </div>
  ```

- **Tags (Multi-select Checkboxes)**
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
      {tags.map(tag => (
          <label key={tag._id} className="flex items-center">
              <input
                  type="checkbox"
                  checked={formData.tags.includes(tag._id)}
                  onChange={(e) => handleArrayChange('tags', tag._id, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
          </label>
      ))}
  </div>
  ```

### Pricing Tab
- **Base Price**
  ```javascript
  <input
      type="number"
      name="basePrice"
      value={formData.basePrice}
      onChange={handleInputChange}
      required
      min="0"
      step="0.01"
      className="input"
      placeholder="0.00"
  />
  ```

- **Compare at Price**
  ```javascript
  <input
      type="number"
      name="comparePrice"
      value={formData.comparePrice}
      onChange={handleInputChange}
      min="0"
      step="0.01"
      className="input"
      placeholder="0.00"
  />
  ```

### Variants Tab
- **Variant Selection (Checkboxes)**
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {variants.map(variant => (
          <label key={variant._id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                  type="checkbox"
                  checked={formData.variants.includes(variant._id)}
                  onChange={(e) => handleArrayChange('variants', variant._id, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">{variant.name}</span>
                  {variant.options?.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                          {variant.options.slice(0, 3).map(opt => opt.value).join(', ')}
                          {variant.options.length > 3 && ` +${variant.options.length - 3} more`}
                      </div>
                  )}
              </div>
          </label>
      ))}
  </div>
  ```

### Images Tab
- **Image Upload Area**
  ```javascript
  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <FiImage className="w-8 h-8 mb-2 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
      </div>
      <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
      />
  </label>
  ```

- **Image Preview Grid**
  ```javascript
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {files.map((file, index) => (
          <div key={index} className="relative group">
              <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-24 object-cover rounded-lg border-2 transition-all"
              />
              <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                  <FiX className="h-3 w-3" />
              </button>
          </div>
      ))}
  </div>
  ```

### Settings Tab
- **Status Select**
  ```javascript
  <select
      name="status"
      value={formData.status}
      onChange={handleInputChange}
      className="input"
  >
      <option value="draft">Draft</option>
      <option value="active">Active</option>
      <option value="archived">Archived</option>
  </select>
  ```

- **Weight Input**
  ```javascript
  <input
      type="number"
      name="weight"
      value={formData.weight}
      onChange={handleInputChange}
      min="0"
      step="0.01"
      className="input"
      placeholder="0.00"
  />
  ```

- **Track Inventory Toggle**
  ```javascript
  <ToggleSwitch
      isActive={formData.trackInventory}
      onToggle={(checked) => setFormData(prev => ({ ...prev, trackInventory: checked }))}
      label="Track Inventory"
      description="Enable inventory tracking for this product"
  />
  ```

- **Features Management**
  ```javascript
  <div className="flex gap-2">
      <input
          type="text"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          placeholder="Add a feature"
          className="input flex-1"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
      />
      <button
          type="button"
          onClick={addFeature}
          className="btn-primary px-4 py-2"
      >
          <FiPlus className="h-4 w-4" />
      </button>
  </div>
  ```

### Summary Tab
- **Summary Cards** (one for each section with edit button)
  ```javascript
  <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-800">Basic Info</span>
          <button onClick={() => setActiveTab('basic')} className="text-gray-400 hover:text-gray-600">
              <FiEdit2 className="w-4 h-4" />
          </button>
      </div>
      <div className="text-sm text-gray-700 space-y-1">
          <div>Title: <span className="font-medium text-gray-900">{formData.title || 'Not specified'}</span></div>
          <div>Short Description: <span className="text-gray-900">{formData.shortDescription || '—'}</span></div>
      </div>
  </div>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `productAPI.createProduct`.
- **Endpoint:** `POST /api/products`.
- **Content-Type:** `multipart/form-data` (for file uploads).
- **Payload:** FormData object containing:
  - Text fields: `title`, `description`, `shortDescription`, `brand`, `basePrice`, `comparePrice`, `status`, `weight`, `metaTitle`, `metaDescription`, `trackInventory`
  - JSON arrays: `categories`, `collections`, `tags`, `variants`, `features` (stringified)
  - Files: `images[]` (multiple File objects)
- **Response contract:** `response.data` contains `{ success: true, message: string, data: product }`.
- **Cache invalidation:** After successful creation, `queryClient.invalidateQueries({ queryKey: ['products'] })` is called.

## Components Used
- React + React Router DOM: `useNavigate`.
- TanStack Query: `useQuery`, `useMutation`, `useQueryClient`.
- Form elements: `input`, `textarea`, `select`, `option`, `button`, `label`, `div`, `ul`, `li`.
- `react-icons/fi` for icons (FiPlus, FiX, FiImage, FiSave, FiArrowLeft, FiArrowRight, FiPackage, FiGrid, FiEdit2, FiTag, FiLayers, FiDollarSign, FiBox, FiInfo, FiEye, FiCheck).
- Custom components: `RichTextEditor`, `ToggleSwitch`.
- Tailwind CSS classes for styling with custom classes (`.title2`, `.btn-primary`, `.btn-outline`, `.input`).

## Error Handling
- **Form validation:** HTML5 required attributes and maxLength constraints.
- **File validation:** Accept attribute limits to image files, size validation handled by backend.
- **API errors:** Handled in `useCreateProduct` hook's `onError` callback, displayed via toast notification.
- **Memory cleanup:** Object URLs for image previews are revoked in cleanup effect to prevent memory leaks.
- **Tab navigation:** Prevents navigation if form is submitting (buttons disabled during `isPending`).

## Navigation Flow
- **Route:** `/products/add`.
- **Entry points:**
  - From products list page via "Add Product" button.
  - Direct URL navigation.
- **Tab navigation:** Users can navigate between tabs using Previous/Next buttons or clicking tab headers.
- **On successful creation:** `navigate('/products')` redirects to products list.
- **On cancel:** `navigate('/products')` returns to products list without saving.

## Functions Involved

- **`handleSubmit`** — Creates FormData, appends all fields and files, submits via mutation.
  ```javascript
  const handleSubmit = async (e) => {
      e.preventDefault()

      try {
          // Create FormData
          const formDataToSend = new FormData()

          // Add form fields
          Object.keys(formData).forEach(key => {
              if (key === 'categories' || key === 'collections' || key === 'tags' || key === 'variants' || key === 'features') {
                  formDataToSend.append(key, JSON.stringify(formData[key]))
              } else {
                  formDataToSend.append(key, formData[key])
              }
          })

          // Add files
          files.forEach((fileObj) => {
              formDataToSend.append('images', fileObj.file)
          })

          await createProduct.mutateAsync(formDataToSend)
          navigate('/products')
      } catch (error) {
          console.error('Submit error:', error)
      }
  }
  ```

- **`handleInputChange`** — Updates form data for standard input fields.
  ```javascript
  const handleInputChange = useCallback((e) => {
      const { name, value, type, checked } = e.target
      setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
      }))
  }, [])
  ```

- **`handleDescriptionChange`** — Updates description field from RichTextEditor.
  ```javascript
  const handleDescriptionChange = useCallback((html) => {
      setFormData(prev => ({ ...prev, description: html }))
  }, [])
  ```

- **`handleArrayChange`** — Toggles array field values (categories, collections, tags, variants).
  ```javascript
  const handleArrayChange = useCallback((field, value, checked) => {
      setFormData(prev => ({
          ...prev,
          [field]: checked
              ? [...prev[field], value]
              : prev[field].filter(item => item !== value)
      }))
  }, [])
  ```

- **`handleFileChange`** — Handles image file selection and creates preview URLs.
  ```javascript
  const handleFileChange = useCallback((e) => {
      const selectedFiles = Array.from(e.target.files)
      const filesWithPreview = selectedFiles.map(file => ({
          file: file,
          preview: URL.createObjectURL(file)
      }))
      setFiles(prev => [...prev, ...filesWithPreview])
  }, [])
  ```

- **`removeFile`** — Removes file from selection and revokes preview URL.
  ```javascript
  const removeFile = useCallback((index) => {
      if (files[index]?.preview) {
          URL.revokeObjectURL(files[index].preview)
      }
      setFiles(prev => prev.filter((_, i) => i !== index))
  }, [files])
  ```

- **`addFeature`** — Adds new feature to features array.
  ```javascript
  const addFeature = useCallback(() => {
      if (newFeature.trim()) {
          setFormData(prev => ({
              ...prev,
              features: [...prev.features, newFeature.trim()]
          }))
          setNewFeature('')
      }
  }, [newFeature])
  ```

- **`removeFeature`** — Removes feature from features array.
  ```javascript
  const removeFeature = useCallback((index) => {
      setFormData(prev => ({
          ...prev,
          features: prev.features.filter((_, i) => i !== index)
      }))
  }, [])
  ```

- **`goToNextTab`** — Navigates to next tab in sequence.
  ```javascript
  const goToNextTab = useCallback(() => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
      if (currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1].id)
      }
  }, [activeTab, tabs])
  ```

- **`goToPreviousTab`** — Navigates to previous tab in sequence.
  ```javascript
  const goToPreviousTab = useCallback(() => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
      if (currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1].id)
      }
  }, [activeTab, tabs])
  ```

- **`handleCancel`** — Cancels form and navigates back to products list.
  ```javascript
  const handleCancel = useCallback(() => {
      navigate('/products')
  }, [navigate])
  ```

- **Cleanup effect** — Revokes all object URLs on component unmount.
  ```javascript
  useEffect(() => {
      return () => {
          files.forEach(fileObj => {
              if (fileObj.preview) {
                  URL.revokeObjectURL(fileObj.preview)
              }
          })
      }
  }, [files])
  ```

## Future Enhancements
- Add form validation with Yup schema.
- Add draft auto-save functionality.
- Add product templates for quick creation.
- Add bulk image upload with drag-and-drop reordering.
- Add image cropping and editing before upload.
- Add variant preview before SKU generation.
- Add product duplication from existing product.
- Add SEO preview (meta title/description preview).
- Add product preview mode (customer view).
- Add form progress indicator showing completion percentage.
- Add field-level validation with error messages.
- Add keyboard shortcuts for tab navigation.
- Add product import from CSV/Excel.
- Add AI-powered product description generation.
- Add product image optimization suggestions.
