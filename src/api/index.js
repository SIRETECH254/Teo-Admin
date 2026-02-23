import api from './config'

// Auth API calls
export const authAPI = {

    // Login
    login: (credentials) => api.post('/auth/login', credentials),
    
    // Register
    register: (userData) => api.post('/auth/register', userData),
    
    // Verify OTP
    verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
    
    // Resend OTP
    resendOTP: (emailData) => api.post('/auth/resend-otp', emailData),
    
    // Forgot Password
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    
    // Reset Password
    resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }),
    
    // Get current user
    getMe: () => api.get('/auth/me'),
    
    // Logout
    logout: () => api.post('/auth/logout'),

    // Google OAuth
    googleAuth: () => api.get('/auth/google'),

    // Google Auth Callback
    googleAuthCallback: (codeData) => api.post('/auth/google/callback', codeData),

    // Google Auth Mobile
    googleAuthMobile: (idTokenData) => api.post('/auth/google/mobile', idTokenData),
    
}

// User API calls
export const userAPI = {

    // Get user profile
    getProfile: () => api.get('/users/profile'),
    
    // Update user profile
    updateProfile: (profileData) => api.put('/users/profile', profileData),
    
    // Change password
    changePassword: (passwordData) => api.put('/users/change-password', passwordData),

    // Admin: Get all users
    getAllUsers: (params) => api.get('/users', { params }),

    // Admin: Get user by ID
    getUserById: (userId) => api.get(`/users/${userId}`),

    // Admin: Update user status / roles
    updateUserStatus: (userId, data) => api.put(`/users/${userId}/status`, data),

    // Admin: Delete user
    deleteUser: (userId) => api.delete(`/users/${userId}`),

    // Admin: Create customer (password = phone)
    adminCreateCustomer: (data) => api.post('/users/admin-create', data),
    
}

// Product API calls
export const productAPI = {

    // Get all products
    getAllProducts: (params) => api.get('/products', { params }),
    
    // Get product by ID
    getProductById: (id) => api.get(`/products/${id}`),
    
    // Create product
    createProduct: (productData) => api.post('/products', productData),
    
    // Update product
    updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
    
    // Delete product
    deleteProduct: (id) => api.delete(`/products/${id}`),
    
    // Upload product images
    uploadImages: (id, formData) => api.post(`/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Delete product image
    deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
    
    // Set primary image
    setPrimaryImage: (productId, imageId) => api.put(`/products/${productId}/images/${imageId}/primary`),
    
    // Update SKU
    updateSKU: (productId, skuId, skuData) => api.patch(`/products/${productId}/skus/${skuId}`, skuData),
    
    // Delete SKU
    deleteSKU: (productId, skuId) => api.delete(`/products/${productId}/skus/${skuId}`),
    
    // Generate SKUs
    generateSKUs: (productId) => api.post(`/products/${productId}/generate-skus`),
    
}

// Category API calls
export const categoryAPI = {

    // Get all categories
    getAllCategories: (params) => api.get('/categories', { params }),
    
    // Get category by ID
    getCategoryById: (id) => api.get(`/categories/${id}`),
    
    // Create category
    createCategory: (categoryData) => api.post('/categories', categoryData),
    
    // Update category
    updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    
    // Delete category
    deleteCategory: (id) => api.delete(`/categories/${id}`),
    
    // Get category tree
    getCategoryTree: () => api.get('/categories/tree'),
    
    // Get categories with products
    getCategoriesWithProducts: () => api.get('/categories/with-products'),
    
}

// Brand API calls
export const brandAPI = {

    // Get all brands
    getAllBrands: (params) => api.get('/brands', { params }),
    
    // Get brand by ID
    getBrandById: (id) => api.get(`/brands/${id}`),
    
    // Create brand
    createBrand: (brandData) => api.post('/brands', brandData),
    
    // Update brand
    updateBrand: (id, brandData) => api.put(`/brands/${id}`, brandData),
    
    // Delete brand
    deleteBrand: (id) => api.delete(`/brands/${id}`),
    
    // Get popular brands
    getPopularBrands: (params) => api.get('/brands/popular', { params }),
    
}

// Tag API calls
export const tagAPI = {

    // Get all tags
    getAllTags: (params) => api.get('/tags', { params }),
    
    // Get tag by ID
    getTagById: (id) => api.get(`/tags/${id}`),
    
    // Create tag
    createTag: (tagData) => api.post('/tags', tagData),
    
    // Update tag
    updateTag: (id, tagData) => api.put(`/tags/${id}`, tagData),
    
    // Delete tag
    deleteTag: (id) => api.delete(`/tags/${id}`),
    
    // Get tags by type
    getTagsByType: (type) => api.get(`/tags/type/${type}`),
    
    // Get popular tags
    getPopularTags: (params) => api.get('/tags/popular', { params }),
    
}

// Collection API calls
export const collectionAPI = {

    // Get all collections
    getAllCollections: (params) => api.get('/collections', { params }),

    // Get collection by ID
    getCollectionById: (id) => api.get(`/collections/${id}`),

    // Create collection
    createCollection: (collectionData) => api.post('/collections', collectionData),

    // Update collection
    updateCollection: (id, collectionData) => api.put(`/collections/${id}`, collectionData),

    // Delete collection
    deleteCollection: (id) => api.delete(`/collections/${id}`),

    // Add product to collection
    addProduct: (id, productId) => api.post(`/collections/${id}/products`, { productId }),

    // Remove product from collection
    removeProduct: (id, productId) => api.delete(`/collections/${id}/products/${productId}`),
    
}

// Variant API calls
export const variantAPI = {

    // Get all variants
    getAllVariants: (params) => api.get('/variants', { params }),

    // Get variant by ID
    getVariantById: (id) => api.get(`/variants/${id}`),

    // Create variant
    createVariant: (variantData) => api.post('/variants', variantData),

    // Update variant
    updateVariant: (id, variantData) => api.put(`/variants/${id}`, variantData),

    // Delete variant
    deleteVariant: (id) => api.delete(`/variants/${id}`),

    // Get active variants
    getActiveVariants: () => api.get('/variants/active'),

    // Add option to variant
    addOption: (variantId, optionData) => api.post(`/variants/${variantId}/options`, optionData),

    // Update variant option
    updateOption: (variantId, optionId, optionData) => api.put(`/variants/${variantId}/options/${optionId}`, optionData),

    // Remove option from variant
    removeOption: (variantId, optionId) => api.delete(`/variants/${variantId}/options/${optionId}`),
    
}

// Cart API calls
export const cartAPI = {

    // Get user's cart
    getCart: () => api.get('/cart'),
    
    // Add item to cart
    addToCart: (cartData) => api.post('/cart/add', cartData),
    
    // Update cart item quantity
    updateCartItem: (skuId, quantity) => api.put(`/cart/items/${skuId}`, { quantity }),
    
    // Remove item from cart
    removeFromCart: (skuId) => api.delete('/cart/items/' + skuId),
    
    // Clear cart
    clearCart: () => api.delete('/cart/clear'),
    
    // Validate cart
    validateCart: () => api.get('/cart/validate'),
    
}

// Checkout APIs
export const orderAPI = {

    // Create a new order
    createOrder: (payload) => api.post('/orders', payload),

    // Get all orders
    getOrders: (params) => api.get('/orders', { params }),

    // Get order by ID
    getOrderById: (orderId) => api.get(`/orders/${orderId}`),

    // Update order status
    updateOrderStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status }),

    // Delete order
    deleteOrder: (orderId) => api.delete(`/orders/${orderId}`),
    
}

// Invoice API calls
export const invoiceAPI = {

    // Get invoice by ID
    getInvoiceById: (invoiceId) => api.get(`/invoices/${invoiceId}`),
    
}

// Payment API calls
export const paymentAPI = {

    // Pay invoice
    payInvoice: (data) => api.post('/payments/pay-invoice', data),

    // Get payment by ID
    getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),

    // Mark cash as collected
    markCashCollected: (paymentId, amount) => api.patch(`/payments/${paymentId}/cash`, { amount }),

    // Get M-Pesa payment status
    getMpesaStatus: (paymentId) => api.get(`/payments/${paymentId}/mpesa-status`),

    // Query M-Pesa status by checkout request ID
    queryMpesaByCheckoutId: (checkoutRequestId) => api.get(`/payments/mpesa-status/${checkoutRequestId}`),
    
}

// Receipt API calls
export const receiptAPI = {

    // Get receipt by ID
    getReceiptById: (receiptId) => api.get(`/receipts/${receiptId}`),
    
}

// Stats API calls (Admin)
export const statsAPI = {

    // Get store overview stats
    getOverview: () => api.get('/stats/overview'),

    // Get store analytics
    getAnalytics: (params) => api.get('/stats/analytics', { params }),
    
}

// Packaging API calls
export const packagingAPI = {

    // Get all packaging options
    getPackaging: (params) => api.get('/packaging', { params }),

    // Get packaging by ID
    getById: (id) => api.get(`/packaging/${id}`),

    // Create packaging option
    create: (data) => api.post('/packaging', data),

    // Update packaging option
    update: (id, data) => api.patch(`/packaging/${id}`, data),

    // Delete packaging option
    remove: (id) => api.delete(`/packaging/${id}`),

    // Set default packaging
    setDefault: (id) => api.patch(`/packaging/${id}/default`),

    // Get active packaging for public view
    getActivePublic: () => api.get('/packaging/public'),

    // Get default packaging for public view
    getDefaultPublic: () => api.get('/packaging/public/default'),
    
}

// Review API calls
export const reviewAPI = {

    // Get reviews for a product
    getProductReviews: (productId, params) => api.get(`/reviews/products/${productId}`, { params }),
    
    // Get a single review
    getReviewById: (reviewId) => api.get(`/reviews/${reviewId}`),
    
    // Create a review
    createReview: (productId, reviewData) => api.post(`/reviews/products/${productId}`, reviewData),
    
    // Update a review
    updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
    
    // Delete a review
    deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
    
    // Get user's reviews
    getUserReviews: (params) => api.get('/reviews/user/reviews', { params }),
    
    // Admin: Approve/Reject review
    approveReview: (reviewId, isApproved) => api.patch(`/reviews/${reviewId}/approve`, { isApproved }),
    
}

// Coupon API calls
export const couponAPI = {

    // Get all coupons (admin only)
    getAllCoupons: (params) => api.get('/coupons', { params }),

    // Get coupon by ID
    getCouponById: (couponId) => api.get(`/coupons/${couponId}`),

    // Create coupon (admin only)
    createCoupon: (couponData) => api.post('/coupons', couponData),

    // Update coupon (admin only)
    updateCoupon: (couponId, couponData) => api.put(`/coupons/${couponId}`, couponData),

    // Delete coupon (admin only)
    deleteCoupon: (couponId) => api.delete(`/coupons/${couponId}`),

    // Validate coupon (public)
    validateCoupon: (code, orderAmount) => api.post('/coupons/validate', { code }, { params: { orderAmount } }),

    // Apply coupon to order (protected)
    applyCoupon: (code, orderAmount) => api.post('/coupons/apply', { code, orderAmount }),

    // Get coupon statistics (admin only)
    getCouponStats: () => api.get('/coupons/stats'),

    // Generate new coupon code (admin only)
    generateNewCode: (couponId) => api.patch(`/coupons/${couponId}/generate-code`),
    
}

// Store Configuration API calls
export const storeConfigAPI = {

    // Get store configuration
    getStoreConfig: () => api.get('/store-config'),

    // Create store configuration (admin only)
    createStoreConfig: (configData) => api.post('/store-config', configData),

    // Update store configuration (admin only)
    updateStoreConfig: (configData) => api.put('/store-config', configData),

    // Delete store configuration (admin only)
    deleteStoreConfig: () => api.delete('/store-config'),

    // Get store configuration status
    getStoreConfigStatus: () => api.get('/store-config/status'),

    // Initialize default store configuration (admin only)
    initStoreConfig: () => api.post('/store-config/init'),
    
}

export default api
