import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import logo from '../../assets/logo.png'
import { loginSchema } from '../../utils/validation'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setValidationErrors({})

        try {
            // Validate form data
            await loginSchema.validate(formData, { abortEarly: false })

            const credentials = {
                email: formData.email,
                password: formData.password
            }

            const result = await login(credentials)
            
            if (result.success) {
                navigate('/')
            } else {
                setError(result.error)
            }
        } catch (validationError) {
            if (validationError.name === 'ValidationError') {
                const errors = {}
                validationError.inner.forEach((error) => {
                    errors[error.path] = error.message
                })
                setValidationErrors(errors)
            } else {
                setError('An unexpected error occurred')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row justify-center  lg:items-center py-5 lg:py-10 px-5  md:gap-y-10 lg:px-8 gap-x-10  gap-y-5">

            {/* Left Side */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center justify-center gap-y-3">
                
                {/* Logo */}
                <div className="w-32 h-24 md:w-48 md:h-32 lg:w-64 lg:h-48 ">
                    <img src={logo} alt="logo" className="w-full h-full" />
                </div>

                {/* Title */}
                <div className="text-center">
                    <h2 className="title2">
                        Sign in to your account
                    </h2>
                    <p className="text-sm text-gray-600">
                        Welcome back! Please enter your details.
                    </p>
                </div>

            </div>

            {/* Right Side */}
            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="">

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-start text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`input pl-10 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-start text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className={`input pl-10 pr-10 ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                                )}
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-primary hover:text-secondary transition-colors"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="h-5 w-5" />
                                        ) : (
                                            <FiEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link
                                    to="/forgot-password"
                                    className="font-medium text-primary hover:text-secondary transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>

                    </form>
                    
                </div>
            </div>

        </div>
    )
}

export default Login 