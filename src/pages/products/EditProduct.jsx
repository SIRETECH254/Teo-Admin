import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useGetProductById, useUpdateProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { FiPlus, FiX, FiImage, FiSave, FiArrowLeft, FiArrowRight, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiBox, FiInfo, FiEye, FiCheck ,FiEdit2} from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'
import VariantSelector from '../../components/common/VariantSelector'


const EditProduct = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const updateProduct = useUpdateProduct()
    

    // Tab state
    const [activeTab, setActiveTab] = useState('basic')

    // Variant selection state for preview
    const [selectedVariantOptions, setSelectedVariantOptions] = useState({})

    // Form state
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

    

    const [newFeature, setNewFeature] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Image states - exactly like the user's pattern
    // existing images already saved in DB (public_id + url)
    const [existingImages, setExistingImages] = useState([])
    // only NEW images selected in this edit session
    const [newImages, setNewImages] = useState([])

    // Cleanup function to prevent memory leaks
    useEffect(() => {
        return () => {
            // Revoke all object URLs when component unmounts
            newImages.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview)
                }
            })
        }
    }, [newImages])

    // Load data with memoized processing
    const { data: productData, isLoading: productLoading } = useGetProductById(id)
    const { data: brandsData } = useGetBrands({ limit: 100 })
    const { data: categoriesData } = useGetCategories({ limit: 100 })
    const { data: collectionsData } = useGetCollections({ limit: 100 })
    const { data: tagsData } = useGetTags({ limit: 100 })
    const { data: variantsData } = useGetVariants({ limit: 100 })

    // Memoize processed data to avoid re-computations
    const product = useMemo(() => productData?.data, [productData])
    const brands = useMemo(() => brandsData?.data?.data?.brands || [], [brandsData])
    const categories = useMemo(() => categoriesData?.data?.data?.categories || [], [categoriesData])
    const collections = useMemo(() => collectionsData?.data?.data?.collections || [], [collectionsData])
    const tags = useMemo(() => tagsData?.data?.data?.tags || [], [tagsData])

    // Memoize variants processing
    const variants = useMemo(() => {
        const variantsResponse = variantsData?.data
        if (Array.isArray(variantsResponse)) {
            return variantsResponse
        } else if (variantsResponse?.data && Array.isArray(variantsResponse.data)) {
            return variantsResponse.data
        } else if (variantsResponse?.variants && Array.isArray(variantsResponse.variants)) {
            return variantsResponse.variants
        }
        return []
    }, [variantsData])

    // Load product data into form
    useEffect(() => {
        if (product) {
            console.log('=== LOADING PRODUCT DATA ===')
            console.log('Product variants:', product.variants)
            
            // Process variants to ensure they are in the correct format (string IDs)
            const processedVariants = Array.isArray(product.variants) 
                ? product.variants.map(variant => {
                    // If variant is an object with _id, extract the ID
                    if (typeof variant === 'object' && variant._id) {
                        return variant._id
                    }
                    // If it's already a string, use it as is
                    return variant
                })
                : []
            
            console.log('Processed variants for formData:', processedVariants)
            
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

            // Set existing images
            setExistingImages(product.images || [])
            
            // Load existing selectedVariantOptions and transform to UI format
            if (product.selectedVariantOptions && Array.isArray(product.selectedVariantOptions)) {
                const uiFormat = {}
                product.selectedVariantOptions.forEach(sel => {
                    // Handle both object and string variantId
                    const variantId = typeof sel.variantId === 'object' ? sel.variantId._id : sel.variantId
                    // Handle both object and string optionIds
                    const optionIds = Array.isArray(sel.optionIds) 
                        ? sel.optionIds.map(optId => typeof optId === 'object' ? optId._id : optId)
                        : []
                    if (variantId && optionIds.length > 0) {
                        uiFormat[variantId] = optionIds
                    }
                })
                setSelectedVariantOptions(uiFormat)
                console.log('Loaded selectedVariantOptions:', uiFormat)
            } else {
                setSelectedVariantOptions({})
            }
            
            setIsLoading(false)
        }
    }, [product]) // Removed formData.variants from dependencies to prevent infinite loop

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
        console.log(`=== HANDLE ARRAY CHANGE ===`)
        console.log('Field:', field, 'Value:', value, 'Checked:', checked)
        
        setFormData(prev => {
            const currentArray = prev[field] || []
            console.log('Current array:', currentArray)
            
            // Convert value to string ID for consistent comparison
            const valueId = typeof value === 'object' && value._id ? value._id : value
            
            let newArray
            if (checked) {
                // Add if not already present
                const isPresent = currentArray.some(item => {
                    const itemId = typeof item === 'object' && item._id ? item._id : item
                    return itemId === valueId
                })
                
                if (!isPresent) {
                    newArray = [...currentArray, valueId]
                    console.log('Added variant:', valueId, 'New array:', newArray)
                } else {
                    newArray = currentArray
                    console.log('Variant already present:', valueId)
                }
            } else {
                // Remove variant
                newArray = currentArray.filter(item => {
                    const itemId = typeof item === 'object' && item._id ? item._id : item
                    return itemId !== valueId
                })
                console.log('Removed variant:', valueId, 'New array:', newArray)
            }
            
            const result = { ...prev, [field]: newArray }
            console.log('Final form data variants:', result.variants)
            return result
        })
        
        // If variant is deselected, remove its options from selectedVariantOptions
        if (field === 'variants' && !checked) {
            const valueId = typeof value === 'object' && value._id ? value._id : value
            setSelectedVariantOptions(prev => {
                const updated = { ...prev }
                delete updated[valueId]
                return updated
            })
        }
    }, [])

    // Handle variant option selection/deselection from the variant checkboxes grid
    const handleVariantOptionToggle = useCallback((variantId, optionId, checked) => {
        setSelectedVariantOptions(prev => {
            const currentOptions = Array.isArray(prev[variantId]) ? prev[variantId] : []
            if (checked) {
                if (!currentOptions.includes(optionId)) {
                    return { ...prev, [variantId]: [...currentOptions, optionId] }
                }
                return prev
            }
            return { ...prev, [variantId]: currentOptions.filter(id => id !== optionId) }
        })
    }, [])

    // Memoize image handling functions
    const handleNewImages = useCallback((e) => {
        // store real File objects
        const files = Array.from(e.target.files || [])
        console.log('=== NEW IMAGES DEBUG ===')
        console.log('Selected files:', files.length)
        files.forEach((file, index) => {
            console.log(`File ${index}:`, {
                name: file.name,
                size: file.size,
                type: file.type,
                isFile: file instanceof File
            })
        })
        setNewImages(files)
    }, [])

    const removeNewImage = useCallback((index) => {
        console.log('=== REMOVE NEW IMAGE DEBUG ===')
        console.log('Removing new image at index:', index)
        setNewImages(prev => prev.filter((_, i) => i !== index))
    }, [])

    const removeExistingImage = useCallback((index) => {
        console.log('=== REMOVE EXISTING IMAGE DEBUG ===')
        console.log('Removing existing image at index:', index)
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }, [])



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

    


    const handleVariantOptionSelect = useCallback((variantId, optionId) => {
        // Preview selector is single-select; keep state shape consistent as an array.
        setSelectedVariantOptions(prev => ({
            ...prev,
            [variantId]: optionId ? [optionId] : []
        }))
    }, [])

    // Transform selectedVariantOptions to backend format
    const buildSelectedVariantOptions = useCallback(() => {
        return Object.entries(selectedVariantOptions)
            .filter(([variantId, optionIds]) => {
                // Check if variant is in formData.variants
                const isVariantSelected = formData.variants.some(item => {
                    const itemId = typeof item === 'object' && item._id ? item._id : item
                    return itemId === variantId
                })
                return isVariantSelected && Array.isArray(optionIds) && optionIds.length > 0
            })
            .map(([variantId, optionIds]) => {
                // Validate that all optionIds belong to the variant
                const variant = variants.find(v => {
                    const vId = typeof v._id === 'object' ? v._id._id : v._id
                    return vId === variantId
                })
                if (variant && variant.options) {
                    const validOptionIds = variant.options.map(opt => {
                        const optId = typeof opt._id === 'object' ? opt._id._id : opt._id
                        return optId.toString()
                    })
                    const filteredOptionIds = optionIds.filter(optId => {
                        const optIdStr = typeof optId === 'object' ? optId._id : optId
                        return validOptionIds.includes(optIdStr.toString())
                    })
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            console.log('=== FORM SUBMISSION DEBUG ===')
            console.log('Form data:', formData)
            console.log('Selected variant options:', selectedVariantOptions)
            console.log('New images count:', newImages.length)
            console.log('Existing images count:', existingImages.length)

            // Build selectedVariantOptions in backend format
            const selectedVariantOptionsFormatted = buildSelectedVariantOptions()
            console.log('Formatted selectedVariantOptions:', selectedVariantOptionsFormatted)
            const keepImagePublicIds = existingImages
                .map(img => img.public_id)
                .filter(Boolean)
            const keepImageDocIds = existingImages
                .map(img => img._id)
                .filter(Boolean)
            const selectedVariantOptionsJson = JSON.stringify(selectedVariantOptionsFormatted || [])
            const keepImagePublicIdsJson = JSON.stringify(keepImagePublicIds || [])
            const keepImageDocIdsJson = JSON.stringify(keepImageDocIds || [])

            // Conditional payload: FormData if new images exist, JSON otherwise
            let payload
            if (newImages.length > 0) {
                // Create FormData when new images are present
                const fd = new FormData()

                // append non-file fields (strings/numbers)
                Object.keys(formData).forEach(key => {
                    if (key === 'categories' || key === 'collections' || key === 'tags' || key === 'variants' || key === 'features') {
                        fd.append(key, JSON.stringify(formData[key]))
                    } else {
                        fd.append(key, formData[key])
                    }
                })

                // Add selectedVariantOptions as JSON string
                fd.append('selectedVariantOptions', selectedVariantOptionsJson)

                // IMPORTANT: append each new file individually (DO NOT append the array)
                newImages.forEach((file) => {
                    fd.append("images", file, file.name) // 'images' must match Multer field name
                })

                // send which existing images to KEEP (so backend knows not to delete them)
                // Include both document IDs and Cloudinary public IDs for robustness
                fd.append("keepImagePublicIds", keepImagePublicIdsJson)
                fd.append("keepImageDocIds", keepImageDocIdsJson)
                // Backward compatibility for older backend handlers (optional)
                fd.append("keepImages", keepImagePublicIdsJson)

                payload = fd
            } else {
                // Send JSON when no new images
                payload = {
                    ...formData,
                    selectedVariantOptions: selectedVariantOptionsJson,
                    keepImagePublicIds: keepImagePublicIdsJson,
                    keepImageDocIds: keepImageDocIdsJson,
                    keepImages: keepImagePublicIdsJson // backward compat
                }
            }

            console.log('=== FINAL PAYLOAD DEBUG ===')
            if (payload instanceof FormData) {
                console.log('Payload type: FormData')
                for (let [key, value] of payload.entries()) {
                    if (key === 'images') {
                        console.log(`  ${key}: File - ${value.name} (${value.size} bytes, type: ${value.type})`)
                    } else if (key === 'keepImages' || key === 'selectedVariantOptions' || key === 'keepImagePublicIds' || key === 'keepImageDocIds') {
                        console.log(`  ${key}: ${value} (length: ${JSON.parse(value).length})`)
                    } else {
                        console.log(`  ${key}: ${value}`)
                    }
                }
                console.log('FormData total size:', [...payload.entries()].length, 'entries')
            } else {
                console.log('Payload type: JSON')
                console.log('Payload:', payload)
            }

            await updateProduct.mutateAsync({ productId: id, productData: payload })
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

    // Loading state
    if (isLoading || productLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Product not found
    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold text-gray-900">Product Not Found</h2>
                        <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="btn-primary mt-4"
                        >
                            Back to Products
                        </button>
                    </div>
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
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">Current Product Variants</h3>
                            <p className="text-sm text-blue-700">
                                This product currently has {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''} attached.
                                Select variants and their specific options to generate SKUs.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <FiBox className="inline mr-2 h-4 w-4" />
                                Select Variants and Options
                            </label>
                            <p className="text-sm text-gray-600 mb-4">
                                Select variants and their specific options. SKUs will be auto-generated based on your selections.
                            </p>

                            {variantsData?.isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-500">Loading variants...</p>
                                </div>
                            ) : variants.length > 0 ? (
                                <div className="space-y-4">
                                    {variants.map(variant => {
                                        // Handle both string IDs and variant objects in formData.variants
                                        const isVariantSelected = formData.variants.some(item => {
                                            if (typeof item === 'string') {
                                                return item === variant._id
                                            } else if (typeof item === 'object' && item._id) {
                                                return item._id === variant._id
                                            }
                                            return false
                                        })
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
                                                            <span className={`text-sm font-medium ${
                                                                isVariantSelected ? 'text-primary' : 'text-gray-900'
                                                            }`}>
                                                                {variant.name}
                                                            </span>
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
                        </div>

                        {/* Selected Variants Summary */}
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

                        {/* Variant Options Preview */}
                        {formData.variants.length > 0 && (
                            <div className="space-y-4">
                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                                        <FiEye className="inline mr-2 h-4 w-4" />
                                        Variant Options Preview (Customer View)
                                    </h4>
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <VariantSelector
                                            variants={variants.filter(v => {
                                                const variantId = typeof v._id === 'object' ? v._id._id : v._id
                                                return formData.variants.some(item => {
                                                    const itemId = typeof item === 'object' ? item._id : item
                                                    return itemId === variantId
                                                })
                                            })}
                                            selectedOptions={Object.fromEntries(
                                                Object.entries(selectedVariantOptions).map(([variantId, optionIds]) => [
                                                    variantId,
                                                    Array.isArray(optionIds) && optionIds.length > 0 ? optionIds[0] : null
                                                ])
                                            )}
                                            onOptionSelect={handleVariantOptionSelect}
                                            className="max-w-md"
                                        />
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
                        </div>

                        {newImages.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        New Images ({newImages.length})
                                    </h4>
                                    {newImages.length > 1 && (
                                        <p className="text-xs text-gray-500">
                                            Click "Remove" to remove selected images.
                                        </p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {newImages.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className={`w-full h-24 object-cover rounded-lg border-2 transition-all border-gray-200`}
                                            />
                                            
                                            {/* New Image Badge */}
                                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                New
                                            </div>
                                            
                                            {/* Trash Icon - Always Visible */}
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                                title="Remove image"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {existingImages.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Existing Images ({existingImages.length})
                                    </h4>
                                    {existingImages.length > 1 && (
                                        <p className="text-xs text-gray-500">
                                            Click "Remove" to remove existing images.
                                        </p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {existingImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.url}
                                                alt={image.alt || 'Product image'}
                                                className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                                                    image.isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                                                }`}
                                            />
                                            
                                            {/* Primary Badge */}
                                            {image.isPrimary && (
                                                <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                                                    Primary
                                                </div>
                                            )}
                                            
                                            {/* Existing Image Badge */}
                                            <div className="absolute top-1 right-8 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                Existing
                                            </div>
                                            
                                            {/* Trash Icon - Always Visible */}
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                                title="Remove image"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                                
                        {/* Image Upload Tips */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <FiImage className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-medium mb-1">Image Management Tips:</p>
                                    <ul className="space-y-1">
                                        <li>• First image will be set as primary automatically</li>
                                        <li>• Existing images are marked with green "Existing" badge</li>
                                        <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                                        <li>• Maximum file size: 5MB per image</li>
                                        <li>• Images will be optimized automatically</li>
                                        <li>• Removing existing images will delete them permanently</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

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
                {
                const selectedVariantsForSummary = variants.filter(v => {
                    const variantId = typeof v._id === 'object' ? v._id._id : v._id
                    return formData.variants.some(item => {
                        const itemId = typeof item === 'object' && item._id ? item._id : item
                        return itemId === variantId
                    })
                })

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
                                {selectedVariantsForSummary.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedVariantsForSummary.map(variant => {
                                            const variantId = typeof variant._id === 'object' ? variant._id._id : variant._id
                                            const selectedOptionIds = Array.isArray(selectedVariantOptions[variantId])
                                                ? selectedVariantOptions[variantId]
                                                : []
                                            const selectedOptionValues = (variant.options || [])
                                                .filter(option => selectedOptionIds.includes(option._id))
                                                .map(option => option.value)

                                            return (
                                                <div key={variantId} className="bg-white border border-gray-200 rounded-md p-3">
                                                    <div className="flex items-center text-gray-900 font-medium">
                                                        <FiBox className="h-4 w-4 mr-2 text-primary" />
                                                        {variant.name}
                                                    </div>
                                                    <div className="mt-2 pl-6">
                                                        <div className="text-xs font-medium text-gray-600 inline-flex items-center mb-1">
                                                            <FiTag className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                                            Selected Options
                                                        </div>
                                                        {selectedOptionValues.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedOptionValues.map(optionValue => (
                                                                    <span
                                                                        key={`${variantId}-${optionValue}`}
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
                                        No variants
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
                                {newImages.length + existingImages.length} uploaded
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
                }

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
                                <h1 className="title2">Edit Product</h1>
                                <p className="text-gray-600">Update product information with variants and SKUs</p>
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
                                    disabled={updateProduct.isPending}
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToPreviousTab}
                                    className="btn-outline inline-flex items-center"
                                    disabled={updateProduct.isPending}
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
                                    disabled={updateProduct.isPending}
                                >
                                    {updateProduct.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2 h-4 w-4" />
                                            Update Product
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToNextTab}
                                    className="btn-primary inline-flex items-center"
                                    disabled={updateProduct.isPending}
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

export default EditProduct