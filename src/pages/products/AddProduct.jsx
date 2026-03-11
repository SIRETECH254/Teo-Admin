import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { FiPlus, FiX, FiImage, FiSave, FiArrowLeft, FiArrowRight, FiPackage, FiGrid,FiEdit2, FiTag, FiLayers, FiDollarSign, FiBox, FiInfo, FiEye, FiCheck } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'


const AddProduct = () => {
    const navigate = useNavigate()
    const createProduct = useCreateProduct()

    // Tab state
    const [activeTab, setActiveTab] = useState('basic')

    // Form state - NO images field here
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        brand: '',
        categories: [],
        collections: [],
        tags: [],
        basePrice: '',
        comparePrice: '',
        variants: [],
        status: 'draft',
        metaTitle: '',
        metaDescription: '',
        trackInventory: true,
        weight: '',
        features: []
    })

    // Separate file state - clean and simple
    const [files, setFiles] = useState([])
    const [newFeature, setNewFeature] = useState('')
    
    // Variant option selection state - format: { [variantId]: optionId[] }
    const [selectedVariantOptions, setSelectedVariantOptions] = useState({})

    // Cleanup function to prevent memory leaks
    useEffect(() => {
        return () => {
            files.forEach(fileObj => {
                if (fileObj.preview) {
                    URL.revokeObjectURL(fileObj.preview)
                }
            })
        }
    }, [files])

    // Load data with memoized processing
    const { data: brandsData } = useGetBrands({ limit: 100 })
    const { data: categoriesData } = useGetCategories({ limit: 100 })
    const { data: collectionsData } = useGetCollections({ limit: 100 })
    const { data: tagsData } = useGetTags({ limit: 100 })
    const { data: variantsData } = useGetVariants({ limit: 100 })

    // Memoize processed data to avoid re-computations
    const brands = useMemo(() => brandsData?.data?.data?.brands || [], [brandsData])
    const categories = useMemo(() => categoriesData?.data?.data?.categories || [], [categoriesData])
    const collections = useMemo(() => collectionsData?.data?.data?.collections || [], [collectionsData])
    const tags = useMemo(() => tagsData?.data?.data?.tags || [], [tagsData])
    const variants = useMemo(() =>
        Array.isArray(variantsData?.data?.data) ? variantsData?.data?.data : [],
        [variantsData]
    )

    // Memoize tabs configuration to prevent re-creation
    const tabs = useMemo(() => [
        { id: 'basic', label: 'Basic Info', icon: FiInfo },
        { id: 'organization', label: 'Organization', icon: FiGrid },
        { id: 'pricing', label: 'Pricing', icon: FiDollarSign },
        { id: 'variants', label: 'Variants', icon: FiBox },
        { id: 'images', label: 'Images', icon: FiImage },
        { id: 'settings', label: 'Settings', icon: FiPackage },
        { id: 'summary', label: 'Summary', icon: FiEye }
    ], [])

    // Memoize event handlers to prevent child component re-renders
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }, [])

    const handleDescriptionChange = useCallback((html) => {
        setFormData(prev => ({ ...prev, description: html }))
    }, [])

    // Memoize tab navigation with tabs dependency
    const goToNextTab = useCallback(() => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id)
        }
    }, [activeTab, tabs])

    const goToPreviousTab = useCallback(() => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id)
        }
    }, [activeTab, tabs])

    const handleArrayChange = useCallback((field, value, checked) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }))
        
        // If variant is deselected, remove its options from selectedVariantOptions
        if (field === 'variants' && !checked) {
            setSelectedVariantOptions(prev => {
                const updated = { ...prev }
                delete updated[value]
                return updated
            })
        }
    }, [])
    
    // Handle variant option selection/deselection
    const handleVariantOptionToggle = useCallback((variantId, optionId, checked) => {
        setSelectedVariantOptions(prev => {
            const currentOptions = prev[variantId] || []
            if (checked) {
                // Add option if not already present
                if (!currentOptions.includes(optionId)) {
                    return { ...prev, [variantId]: [...currentOptions, optionId] }
                }
                return prev
            } else {
                // Remove option
                return { ...prev, [variantId]: currentOptions.filter(id => id !== optionId) }
            }
        })
    }, [])

    // Memoize file handling functions
    const handleFileChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files)
        console.log('=== FILE UPLOAD DEBUG ===')
        console.log('Selected files:', selectedFiles.length)
        selectedFiles.forEach((file, index) => {
            console.log(`File ${index}:`, {
                name: file.name,
                size: file.size,
                type: file.type,
                isFile: file instanceof File
            })
        })

        // Create file objects with previews
        const filesWithPreview = selectedFiles.map(file => ({
            file: file, // The actual File object
            preview: URL.createObjectURL(file)
        }))

        setFiles(prev => [...prev, ...filesWithPreview])
    }, [])

    const removeFile = useCallback((index) => {
        console.log('=== REMOVE FILE DEBUG ===')
        console.log('Removing file at index:', index)

        // Revoke the object URL
        if (files[index]?.preview) {
            URL.revokeObjectURL(files[index].preview)
        }

        setFiles(prev => prev.filter((_, i) => i !== index))
    }, [files])

    const addFeature = useCallback(() => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }))
            setNewFeature('')
        }
    }, [newFeature])

    const removeFeature = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }, [])

    // Transform selectedVariantOptions to backend format
    const buildSelectedVariantOptions = useCallback(() => {
        return Object.entries(selectedVariantOptions)
            .filter(([variantId, optionIds]) => 
                formData.variants.includes(variantId) && Array.isArray(optionIds) && optionIds.length > 0
            )
            .map(([variantId, optionIds]) => {
                // Validate that all optionIds belong to the variant
                const variant = variants.find(v => v._id === variantId)
                if (variant && variant.options) {
                    const validOptionIds = variant.options.map(opt => opt._id.toString())
                    const filteredOptionIds = optionIds.filter(optId => 
                        validOptionIds.includes(optId.toString())
                    )
                    if (filteredOptionIds.length > 0) {
                        return {
                            variantId,
                            optionIds: filteredOptionIds
                        }
                    }
                }
                return null
            })
            .filter(Boolean) // Remove null entries
    }, [selectedVariantOptions, formData.variants, variants])

    // Clean submit function - exactly like the blueprint
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            console.log('=== FORM SUBMISSION DEBUG ===')
            console.log('Form data:', formData)
            console.log('Selected variant options:', selectedVariantOptions)
            console.log('Files count:', files.length)
            files.forEach((fileObj, index) => {
                console.log(`File ${index}:`, {
                    name: fileObj.file.name,
                    size: fileObj.file.size,
                    type: fileObj.file.type,
                    isFile: fileObj.file instanceof File
                })
            })

            // Build selectedVariantOptions in backend format
            const selectedVariantOptionsFormatted = buildSelectedVariantOptions()
            console.log('Formatted selectedVariantOptions:', selectedVariantOptionsFormatted)

            // Conditional payload: FormData if images exist, JSON otherwise
            let payload
            if (files.length > 0) {
                // Create FormData when images are present
                const formDataToSend = new FormData()

                // Add form fields
                Object.keys(formData).forEach(key => {
                    if (key === 'categories' || key === 'collections' || key === 'tags' || key === 'variants' || key === 'features') {
                        formDataToSend.append(key, JSON.stringify(formData[key]))
                    } else {
                        formDataToSend.append(key, formData[key])
                    }
                })

                // Add selectedVariantOptions as JSON string
                formDataToSend.append('selectedVariantOptions', JSON.stringify(selectedVariantOptionsFormatted))

                // Add files
                files.forEach((fileObj) => {
                    formDataToSend.append('images', fileObj.file)
                })

                payload = formDataToSend
            } else {
                // Send JSON when no images
                payload = { 
                    ...formData,
                    selectedVariantOptions: selectedVariantOptionsFormatted
                }
            }

            await createProduct.mutateAsync(payload)
            navigate('/products')
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const handleCancel = useCallback(() => {
        navigate('/products')
    }, [navigate])

    // Get current step number
    const currentStep = useMemo(() => {
        const stepMap = {
            'basic': 1,
            'organization': 2,
            'pricing': 3,
            'variants': 4,
            'images': 5,
            'settings': 6,
            'summary': 7
        }
        return stepMap[activeTab] || 1
    }, [activeTab])

    // Handle tab change with validation
    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId)
    }, [])

    /**
     * Render Step Indicator Header
     */
    const renderStepHeader = () => {
        const progress = (currentStep / tabs.length) * 100
        
        return (
            <div className="bg-white border-b border-gray-100 space-y-4 p-3">
                <div className="flex-row items-center justify-between flex">
                    {/* current step & label */}
                    <div className="flex-row items-center gap-x-2 flex">
                        <div className="h-5 w-5 rounded-full items-center justify-center bg-primary text-white text-xs font-bold flex">
                            {currentStep}
                        </div>
                        <span className="text-sm font-semibold text-primary">
                            {tabs.find(tab => tab.id === activeTab)?.label}
                        </span>
                    </div>
               
                    {/* Step numbers and labels */}
                    <div className="flex-row items-center gap-x-2 md:gap-x-4 lg:gap-x-6 flex">
                        {tabs.map((tab, index) => {
                            const stepNumber = index + 1
                            const isActive = tab.id === activeTab
                            const isCompleted = currentStep > stepNumber
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className="flex-1 items-center flex flex-col"
                                    type="button"
                                >
                                    <div className="items-center flex flex-col">
                                        {/* Step number circle */}
                                        <div className={`h-6 w-6 rounded-full items-center justify-center flex ${
                                            isActive 
                                                ? 'bg-primary' 
                                                : isCompleted 
                                                    ? 'bg-primary/30' 
                                                    : 'bg-gray-200'
                                        }`}>
                                            {isCompleted ? (
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className={`text-base font-bold ${
                                                    isActive ? 'text-white' : 'text-gray-500'
                                                }`}>
                                                    {stepNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        )
    }

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="input"
                                placeholder="Enter product title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Short Description
                            </label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="input"
                                placeholder="Brief description (max 200 characters)"
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Description
                            </label>
                            <RichTextEditor
                                content={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="Detailed product description"
                            />
                        </div>
                    </div>
                )

            case 'organization':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiPackage className="inline mr-2 h-4 w-4" />
                                Brand
                            </label>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiGrid className="inline mr-2 h-4 w-4" />
                                Categories
                            </label>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiLayers className="inline mr-2 h-4 w-4" />
                                Collections
                            </label>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiTag className="inline mr-2 h-4 w-4" />
                                Tags
                            </label>
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
                        </div>
                    </div>
                )

            case 'pricing':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiDollarSign className="inline mr-2 h-4 w-4" />
                                Base Price <span className="text-red-500">*</span>
                            </label>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Compare at Price
                            </label>
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
                        </div>
                    </div>
                )

            case 'variants':
                return (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600">
                            Select variants and their specific options to create product variations. SKUs will be auto-generated based on your selections.
                        </p>

                        {variants.length > 0 ? (
                            <div className="space-y-4">
                                {variants.map(variant => {
                                    const isVariantSelected = formData.variants.includes(variant._id)
                                    const selectedOptions = selectedVariantOptions[variant._id] || []
                                    
                                    return (
                                        <div key={variant._id} className="border border-gray-200 rounded-lg p-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isVariantSelected}
                                                    onChange={(e) => handleArrayChange('variants', variant._id, e.target.checked)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-900">{variant.name}</span>
                                                        {isVariantSelected && selectedOptions.length > 0 && (
                                                            <span className="text-xs text-primary font-medium">
                                                                {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
                                                            </span>
                                                        )}
                                                    </div>
                                                    {variant.options?.length > 0 && !isVariantSelected && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {variant.options.length} option{variant.options.length !== 1 ? 's' : ''} available
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                            
                                            {/* Show options when variant is selected */}
                                            {isVariantSelected && variant.options && variant.options.length > 0 && (
                                                <div className="ml-7 mt-4 pt-4 border-t border-gray-200">
                                                    <label className="block text-xs font-medium text-gray-700 mb-3">
                                                        Select Options for {variant.name}:
                                                    </label>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {variant.options.map(option => {
                                                            const isOptionSelected = selectedOptions.includes(option._id)
                                                            return (
                                                                <label 
                                                                    key={option._id} 
                                                                    className={`flex items-center p-2 rounded border-2 cursor-pointer transition-all ${
                                                                        isOptionSelected
                                                                            ? 'border-primary bg-primary/5'
                                                                            : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isOptionSelected}
                                                                        onChange={(e) => handleVariantOptionToggle(variant._id, option._id, e.target.checked)}
                                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                                    />
                                                                    <span className="ml-2 text-sm text-gray-700">{option.value}</span>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                    {selectedOptions.length === 0 && (
                                                        <p className="text-xs text-amber-600 mt-2">
                                                            ⚠️ No options selected. A default SKU will be created if no options are chosen.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FiBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-sm font-medium text-gray-900 mb-2">No variants available</h3>
                                <p className="text-sm text-gray-500">
                                    Create some variants first before adding them to products.
                                </p>
                            </div>
                        )}

                        {formData.variants.length > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start">
                                    <FiBox className="inline mr-2 h-4 w-4 mt-0.5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                            {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''} selected
                                        </p>
                                        <p className="text-xs text-blue-700">
                                            {Object.keys(selectedVariantOptions).length > 0
                                                ? 'SKUs will be auto-generated based on selected option combinations.'
                                                : 'Select options for each variant to generate SKUs, or leave empty for a default SKU.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 'images':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
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
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Uploaded Images ({files.length})
                                    </h4>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={file.preview}
                                                alt={file.file.name}
                                                className="w-full h-24 object-cover rounded-lg border-2 transition-all"
                                            />
                                            
                                            {/* Trash Icon - Always Visible */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    console.log('Remove button clicked for index:', index)
                                                    removeFile(index)
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm z-10"
                                                title="Remove image"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Image Upload Tips */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                        <FiImage className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-blue-800">
                                            <p className="font-medium mb-1">Image Upload Tips:</p>
                                            <ul className="space-y-1">
                                                <li>• First image will be set as primary automatically</li>
                                                <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                                                <li>• Maximum file size: 5MB per image</li>
                                                <li>• Images will be optimized automatically</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 'settings':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (kg)
                            </label>
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
                        </div>

                        <div>
                            <ToggleSwitch
                                isActive={formData.trackInventory}
                                onToggle={(checked) => setFormData(prev => ({ ...prev, trackInventory: checked }))}
                                label="Track Inventory"
                                description="Enable inventory tracking for this product"
                                className="mb-4"
                            />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
                            <div className="space-y-3">
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
                                {formData.features.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.features.map((feature, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm text-gray-700">{feature}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )

            case 'summary':
                return (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-800 inline-flex items-center">
                                    <FiInfo className="h-5 w-5 mr-2 text-primary" />
                                    Basic Info
                                </span>
                                <button onClick={() => setActiveTab('basic')} className="text-gray-400 hover:text-gray-600">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-sm text-gray-700 flex flex-col space-y-2">
                                <div className="inline-flex items-start">
                                    <FiInfo className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Title: <span className="font-medium text-gray-900">{formData.title || 'Not specified'}</span></span>
                                </div>
                                <div className="inline-flex items-start">
                                    <FiEye className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Short Description: <span className="text-gray-900">{formData.shortDescription || '—'}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-800 inline-flex items-center">
                                    <FiGrid className="h-5 w-5 mr-2 text-primary" />
                                    Organization
                                </span>
                                <button onClick={() => setActiveTab('organization')} className="text-gray-400 hover:text-gray-600">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-sm text-gray-700 flex flex-col space-y-2">
                                <div className="inline-flex items-start">
                                    <FiTag className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Brand: <span className="font-medium text-gray-900">{brands.find(b => b._id === formData.brand)?.name || 'Not specified'}</span></span>
                                </div>
                                <div className="inline-flex items-start">
                                    <FiLayers className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Categories: <span className="text-gray-900">{formData.categories.length > 0 ? categories.filter(c => formData.categories.includes(c._id)).map(c => c.name).join(', ') : 'None selected'}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-800 inline-flex items-center">
                                    <FiDollarSign className="h-5 w-5 mr-2 text-primary" />
                                    Pricing
                                </span>
                                <button onClick={() => setActiveTab('pricing')} className="text-gray-400 hover:text-gray-600">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-sm text-gray-700 flex flex-col space-y-2">
                                <div className="inline-flex items-start">
                                    <FiDollarSign className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Base Price: <span className="font-medium text-gray-900">KES {formData.basePrice || '0.00'}</span></span>
                                </div>
                                <div className="inline-flex items-start">
                                    <FiDollarSign className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Compare at: <span className="text-gray-900">{formData.comparePrice ? `KES ${formData.comparePrice}` : '—'}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-800 inline-flex items-center">
                                    <FiBox className="h-5 w-5 mr-2 text-primary" />
                                    Variants
                                </span>
                                <button onClick={() => setActiveTab('variants')} className="text-gray-400 hover:text-gray-600">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-sm text-gray-700">
                                {formData.variants.length > 0 ? (
                                    <div className="space-y-2">
                                        {variants.filter(v => formData.variants.includes(v._id)).map(variant => {
                                            const selectedOptions = selectedVariantOptions[variant._id] || []
                                            const optionNames = variant.options
                                                ?.filter(opt => selectedOptions.includes(opt._id))
                                                .map(opt => opt.value) || []
                                            
                                            return (
                                                <div key={variant._id} className="bg-white border border-gray-200 rounded-md p-3">
                                                    <div className="flex items-center text-gray-900 font-medium">
                                                        <FiBox className="h-4 w-4 mr-2 text-primary" />
                                                        {variant.name}
                                                    </div>
                                                    <div className="mt-2 pl-6">
                                                        <div className="text-xs font-medium text-gray-600 inline-flex items-center mb-1">
                                                            <FiTag className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                                            Selected Options
                                                        </div>
                                                        {optionNames.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {optionNames.map(optionValue => (
                                                                    <span
                                                                        key={`${variant._id}-${optionValue}`}
                                                                        className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                                                                    >
                                                                        <FiCheck className="h-3 w-3 mr-1" />
                                                                        {optionValue}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-500">No options selected</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center text-gray-500">
                                        <FiX className="h-4 w-4 mr-2" />
                                        No variants selected
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-800 inline-flex items-center">
                                    <FiImage className="h-5 w-5 mr-2 text-primary" />
                                    Images
                                </span>
                                <button onClick={() => setActiveTab('images')} className="text-gray-400 hover:text-gray-600">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-sm text-gray-700 inline-flex items-center">
                                <FiImage className="h-4 w-4 mr-2 text-primary" />
                                {files.length} uploaded
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-800 inline-flex items-center">
                                    <FiPackage className="h-5 w-5 mr-2 text-primary" />
                                    Settings
                                </span>
                                <button onClick={() => setActiveTab('settings')} className="text-gray-400 hover:text-gray-600">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-sm text-gray-700 flex flex-col space-y-2">
                                <div className="inline-flex items-start">
                                    <FiCheck className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Status: <span className="font-medium capitalize text-gray-900">{formData.status}</span></span>
                                </div>
                                <div className="inline-flex items-start">
                                    <FiPlus className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                                    <span>Features: <span className="text-gray-900">{formData.features.length} added</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col py-8">
            {/* Header */}
            <div className=" px-6  mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col">
                    <div className="p-8 pb-0">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="title2">Add New Product</h1>
                                <p className="text-gray-600">Create a new product with variants and SKUs</p>
                            </div>
                        </div>
                    </div>

                    {/* Step Header */}
                    <div className="rounded-2xl border-t border-gray-200">
                        {renderStepHeader()}

                        {/* Step indicator in header right */}
                        <div className="p-4 border-b border-gray-100 flex justify-end">
                            <span className="text-sm font-semibold text-primary">
                                Step {currentStep} of {tabs.length}
                            </span>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                            {renderTabContent()}
                        </div>
                    </div>

                    {/* Tab Navigation Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-auto p-6">
                        {/* Left side - Previous button or Cancel */}
                        <div>
                            {activeTab === 'basic' ? (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn-outline"
                                    disabled={createProduct.isPending}
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToPreviousTab}
                                    className="btn-outline inline-flex items-center"
                                    disabled={createProduct.isPending}
                                >
                                    <FiArrowLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </button>
                            )}
                        </div>

                        {/* Right side - Next button or Create Product */}
                        <div>
                            {activeTab === 'summary' ? (
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="btn-primary inline-flex items-center"
                                    disabled={createProduct.isPending}
                                >
                                    {createProduct.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2 h-4 w-4" />
                                            Create Product
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToNextTab}
                                    className="btn-primary inline-flex items-center"
                                    disabled={createProduct.isPending}
                                >
                                    Next
                                    <FiArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddProduct