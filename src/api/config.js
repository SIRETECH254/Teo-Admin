import axios from 'axios'

const API_BASE_URL = 'https://teo-kicks.onrender.com/api'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Handle FormData - don't set Content-Type, let browser set it
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    })

                    const { accessToken } = response.data.data
                    localStorage.setItem('accessToken', accessToken)

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    return api(originalRequest)
                } catch (refreshError) {
                    // Refresh token failed; keep existing storage to allow manual retry or background validation.
                    // Do not redirect here; let the app decide based on guarded routes.
                    return Promise.reject(refreshError)
                }
            }
        }

        return Promise.reject(error)
    }
)

export default api
