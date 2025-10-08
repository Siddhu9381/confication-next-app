'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, Auth } from 'firebase/auth';
// @ts-ignore
import { auth } from '../../../lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation (basic - no specific rules for now)
  const validatePassword = (password: string) => {
    return password.length > 0;
  };

  // Confirm password validation
  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    return password === confirmPassword;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let newErrors = { 
      firstName: '', 
      lastName: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };
    let isValid = true;

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Please enter a valid password';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (!validateConfirmPassword(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      handleFirebaseRegistration();
    }
  };

  const handleFirebaseRegistration = async () => {
    setIsLoading(true);
    setErrors({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

    try {
      // Create user with email and password
      // @ts-ignore
      const firebaseAuth = auth as Auth | null;
      if (!firebaseAuth) {
        throw new Error('Firebase auth not initialized');
      }
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, formData.email, formData.password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // Send email verification with action code settings
      const actionCodeSettings = {
        url: process.env.NEXT_PUBLIC_EMAIL_VERIFY_ACTION_URL || "http://localhost:3000/login", // Redirect to login page after verification
        handleCodeInApp: false
      };
      await sendEmailVerification(user, actionCodeSettings);

      // Send user data to backend /register endpoint
      const API_BASE = process.env.NEXT_PUBLIC_CONFICATION_URL || 'http://localhost:8000';
      const registerPayload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        uid: user.uid
      };

      const registerResponse = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerPayload)
      });

      if (!registerResponse.ok) {
        console.warn('Failed to register user in backend:', registerResponse.status, registerResponse.statusText);
        // Don't throw error here as Firebase registration was successful
      }

      // Store user data in localStorage (optional - for immediate login)
      const idToken = await user.getIdToken();
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        idToken: idToken,
        emailVerified: user.emailVerified
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // Show verification modal instead of success message
      setShowVerificationModal(true);

    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
          break;
        case 'auth/weak-password':
          setErrors(prev => ({ ...prev, password: 'Password is too weak' }));
          break;
        case 'auth/invalid-email':
          setErrors(prev => ({ ...prev, email: 'Invalid email address' }));
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      setErrors(prev => ({ ...prev, email: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // Handle Google registration logic here
    console.log('Google registration clicked');
    // You can add your Google OAuth logic here
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Logo - Visible only on mobile */}
      <div 
        className="md:hidden flex flex-col items-center py-8 px-8"
        style={{ backgroundColor: 'rgba(0, 37, 39)' }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-3"
            style={{ backgroundColor: 'white' }}
          >
            <Image
              src="/logo.png"
              alt="Confication Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Confication
          </h1>
        </div>
      </div>

      {/* Desktop Layout - Equal Height Sides */}
      <div className="md:flex flex-1 min-h-screen">
        {/* Left Side - Logo and Text - Hidden on mobile, visible on desktop */}
        <div 
          className="hidden md:flex flex-1 flex-col items-center px-8 py-16"
          style={{ backgroundColor: 'rgba(0, 37, 39)' }}
        >
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="mb-8">
            <div 
              className="w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4"
              style={{ backgroundColor: 'white' }}
            >
              <Image
                src="/logo.png"
                alt="Confication Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Confication
            </h1>
          </div>

          {/* Text */}
          <div className="space-y-4 text-gray-300">
            <p className="text-lg">
              Join thousands of users improving their speaking skills
            </p>
            <p className="text-sm">
              Create your account and start your journey to better communication with our AI-powered voice analysis platform.
            </p>
          </div>

          {/* Email Verification Notice */}
          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-white mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Email Verification Required
                </h3>
                <p className="text-xs text-gray-300">
                  You'll need to verify your email address before you can start recording sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Information */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-white mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Your Privacy Matters
                </h3>
                <p className="text-xs text-gray-300">
                  Your details will only be used for user management, analysis reports, and session credits management. We never share your personal data.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Right Side - Register Form - Visible on both mobile and desktop */}
        <div 
          className="flex-1 flex flex-col items-center justify-center px-8 py-12"
          style={{ backgroundColor: 'rgba(234, 128, 64)' }}
        >
        <div className="w-full max-w-md">
          {/* Register Heading */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white">
              Register
            </h2>
            <p className="mt-2 text-white">
              Create your account to get started
            </p>
          </div>

          {/* Register Form */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name Input */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-white">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    errors.firstName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500'
                  } focus:outline-none focus:ring-2`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name Input */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-white">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    errors.lastName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500'
                  } focus:outline-none focus:ring-2`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-white">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-white">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center border-gray-300">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-colors duration-200 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white">
              Existing user?{' '}
              <button
                onClick={() => {
                  router.push('/login');
                }}
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200 focus:outline-none focus:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Email Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 mb-6">
                <svg className="h-8 w-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Please Verify Your Email
              </h2>
              
              <p className="text-gray-600 mb-6">
                We've sent a verification email to <strong>{formData.email}</strong>. 
                Please check your inbox and click the verification link to activate your account.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    router.push('/session');
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Continue to App
                </button>
                
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Didn't receive the email? Check your spam folder or try registering again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
