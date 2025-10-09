'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword, signInWithPopup, signOut, Auth } from 'firebase/auth';
// @ts-ignore - auth can be undefined during SSR
import { auth, googleProvider } from '../../../lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);


  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation (basic - no specific rules for now)
  const validatePassword = (password: string) => {
    return password.length > 0;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let newErrors = { email: '', password: '' };
    let isValid = true;

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

    setErrors(newErrors);

    if (isValid) {
      setIsLoading(true);
      try {
        // Check if auth is available (client-side only)
        // @ts-ignore - auth can be undefined during SSR
        const firebaseAuth = auth as Auth | null;
        if (!firebaseAuth) {
          throw new Error('Authentication service not available. Please refresh the page.');
        }

        // Firebase email/password authentication
        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          formData.email,
          formData.password
        );
        
        // Get the user and ID token
        const user = userCredential.user;
        
        // Check if email is verified
        if (!user.emailVerified) {
          // Sign out the user immediately
          await signOut(firebaseAuth);
          newErrors.email = 'Please verify your email before logging in. Check your inbox for a verification link.';
          setErrors(newErrors);
          return;
        }
        
        const idToken = await user.getIdToken();
        
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          idToken: idToken
        }));
        
        console.log('Login successful:', user.email);
        
        // Redirect to session page
        router.push('/session');
        
      } catch (error: any) {
        // Log error details only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Login error:', error);
        }
        
        // Handle specific Firebase auth errors
        let errorMessage = 'Login failed. Please try again';
        
        switch (error.code) {
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. If you don\'t have an account, please register below.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address. Please register below.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/email-not-verified':
            errorMessage = 'Please verify your email before logging in';
            break;
          default:
            errorMessage = error.message || 'Login failed. Please try again';
        }
        
        newErrors.email = errorMessage;
        setErrors(newErrors);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore
      const firebaseAuth = auth as Auth | null;
      if (!firebaseAuth || !googleProvider) {
        throw new Error('Authentication service not available. Please refresh the page.');
      }

      // Sign in with Google popup
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;

      // Get ID token
      const idToken = await user.getIdToken();

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        idToken: idToken,
        emailVerified: true // Google accounts are always verified
      }));

      // Optional: Send user data to backend (registration/login)
      const API_BASE = process.env.NEXT_PUBLIC_CONFICATION_URL || 'http://localhost:8000';
      try {
        await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            uid: user.uid
          })
        });
      } catch (error) {
        // Silently fail if backend registration fails
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to sync user with backend:', error);
        }
      }

      console.log('Google login successful:', user.email);
      router.push('/session');

    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Google login error:', error);
      }
      
      let errorMessage = 'Google authentication failed.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in popup was closed. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method.';
          break;
        default:
          errorMessage = error.message || 'Google authentication failed. Please try again.';
      }
      
      setErrors(prev => ({ ...prev, email: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
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

      {/* Left Side - Logo and Text (Hidden on mobile) */}
      <div 
        className="hidden md:flex flex-1 flex-col items-center justify-center px-8"
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
              Welcome to your voice analysis platform
            </p>
            <p className="text-sm">
              Record, analyze, and improve your speaking skills with our advanced AI-powered feedback system.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div 
        className="flex-1 flex flex-col items-center justify-center px-8 py-12"
        style={{ backgroundColor: 'rgba(234, 128, 64)' }}
      >
        <div className="w-full max-w-md">
          {/* Login Heading */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white">
              Login
            </h2>
            <p className="mt-2 text-white">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                isLoading 
                  ? 'bg-teal-400 text-white cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
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

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-colors duration-200 ${
              isLoading 
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
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
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Register Link - More Prominent */}
          <div className="mt-6 text-center p-4 rounded-lg bg-white/10 border border-white/20">
            <p className="text-base text-white font-medium mb-2">
              Don't have an account?
            </p>
            <button
              onClick={() => {
                router.push('/register');
              }}
              className="w-full bg-white hover:bg-gray-100 text-teal-600 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Create Account
            </button>
          </div>

          {/* Email Verification Help */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-300">
              Didn't receive verification email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  router.push('/register');
                }}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors duration-200 focus:outline-none focus:underline"
              >
                register again
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
