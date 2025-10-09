'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    impressed: '',
    didntWork: '',
    fixAsap: ''
  });
  const [errors, setErrors] = useState({
    impressed: '',
    didntWork: '',
    fixAsap: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const CHARACTER_LIMIT = 300;

  // Check authentication on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      if (!user.idToken) {
        router.push('/login');
        return;
      }
      // Authentication successful
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Enforce character limit
    if (value.length <= CHARACTER_LIMIT) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
    
    let newErrors = { 
      impressed: '', 
      didntWork: '', 
      fixAsap: '' 
    };
    let isValid = true;

    // Validate impressed field
    if (!formData.impressed.trim()) {
      newErrors.impressed = 'Please tell us what impressed you most';
      isValid = false;
    }

    // Validate didntWork field
    if (!formData.didntWork.trim()) {
      newErrors.didntWork = 'Please share what didn\'t work for you';
      isValid = false;
    }

    // Validate fixAsap field
    if (!formData.fixAsap.trim()) {
      newErrors.fixAsap = 'Please tell us what we should fix ASAP';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      
      try {
        // Get ID token from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('User not authenticated. Please login again.');
        }
        
        const user = JSON.parse(userData);
        const idToken = user.idToken;
        
        if (!idToken) {
          throw new Error('ID token not found. Please login again.');
        }

        // Send feedback to backend
        const API_BASE = process.env.NEXT_PUBLIC_CONFICATION_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          // Try to get error details from response
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.detail || errorData.message || '';
          } catch (e) {
            // Response might not be JSON
          }
          
          throw new Error(`Failed to submit feedback: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
        }
        
        // Show success message and redirect
        alert('Thank you for your feedback! We appreciate your input.');
        router.push('/');
      } catch (error: any) {
        // Log error details in development only
        if (process.env.NODE_ENV === 'development') {
          console.error('Error submitting feedback:', error);
        }
        
        // Show detailed error message to user
        let errorMessage = 'There was an error submitting your feedback.';
        
        if (error.message) {
          if (error.message.includes('401')) {
            errorMessage = 'Authentication error. Please login again.';
            // Redirect to login after showing error
            setTimeout(() => router.push('/login'), 2000);
          } else if (error.message.includes('403')) {
            errorMessage = 'You do not have permission to submit feedback.';
          } else if (error.message.includes('404')) {
            errorMessage = 'Feedback service not found. Please contact support.';
          } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.message.includes('Network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            // Show the actual error message from the API
            errorMessage = error.message;
          }
        }
        
        alert(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 ${
      isDarkMode ? 'bg-[rgba(0, 37, 39)]' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-[rgba(0, 37, 39)]'
          }`}>
            Your Feedback Matters
          </h1>
          <p className={`text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Confication is still in its MVP stage. Your feedback will help us make it stronger, smoother, and more useful. Please take a minute to share your thoughts.
          </p>
        </div>

        {/* Feedback Form */}
        <div className={`rounded-2xl shadow-2xl p-8 sm:p-10 lg:p-12 ${
          isDarkMode 
            ? 'bg-[rgba(0, 61, 61)] border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* What impressed you the most? */}
            <div>
              <label 
                htmlFor="impressed" 
                className={`block text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-[rgba(0, 37, 39)]'
                }`}
              >
                What impressed you the most?
              </label>
              <p className={`text-sm mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Tell us one thing you liked or found useful.
              </p>
              <textarea
                id="impressed"
                name="impressed"
                value={formData.impressed}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 resize-none ${
                  errors.impressed
                    ? 'border-red-500 focus:border-red-500'
                    : isDarkMode
                    ? 'border-gray-600 bg-[rgba(0, 37, 39)] text-white placeholder-gray-400 focus:border-[rgba(234,128,64)]'
                    : 'border-gray-300 bg-white text-[rgba(0, 37, 39)] placeholder-gray-500 focus:border-[rgba(234,128,64)]'
                } focus:outline-none focus:ring-2 focus:ring-[rgba(234,128,64,0.2)]`}
                placeholder="Share what you found most impressive or useful..."
              />
              <div className="flex justify-between items-center mt-2">
                {errors.impressed && (
                  <p className="text-red-500 text-sm">{errors.impressed}</p>
                )}
                <p className={`text-sm ml-auto ${
                  formData.impressed.length > CHARACTER_LIMIT * 0.9 
                    ? 'text-orange-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formData.impressed.length}/{CHARACTER_LIMIT} characters
                </p>
              </div>
            </div>

            {/* What didn't work for you? */}
            <div>
              <label 
                htmlFor="didntWork" 
                className={`block text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-[rgba(0, 37, 39)]'
                }`}
              >
                What didn't work for you?
              </label>
              <p className={`text-sm mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Be honest — what felt disappointing or frustrating?
              </p>
              <textarea
                id="didntWork"
                name="didntWork"
                value={formData.didntWork}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 resize-none ${
                  errors.didntWork
                    ? 'border-red-500 focus:border-red-500'
                    : isDarkMode
                    ? 'border-gray-600 bg-[rgba(0, 37, 39)] text-white placeholder-gray-400 focus:border-[rgba(234,128,64)]'
                    : 'border-gray-300 bg-white text-[rgba(0, 37, 39)] placeholder-gray-500 focus:border-[rgba(234,128,64)]'
                } focus:outline-none focus:ring-2 focus:ring-[rgba(234,128,64,0.2)]`}
                placeholder="Tell us what was frustrating or disappointing..."
              />
              <div className="flex justify-between items-center mt-2">
                {errors.didntWork && (
                  <p className="text-red-500 text-sm">{errors.didntWork}</p>
                )}
                <p className={`text-sm ml-auto ${
                  formData.didntWork.length > CHARACTER_LIMIT * 0.9 
                    ? 'text-orange-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formData.didntWork.length}/{CHARACTER_LIMIT} characters
                </p>
              </div>
            </div>

            {/* What should we fix ASAP? */}
            <div>
              <label 
                htmlFor="fixAsap" 
                className={`block text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-[rgba(0, 37, 39)]'
                }`}
              >
                What should we fix ASAP?
              </label>
              <p className={`text-sm mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                The most urgent issue that we need to address right away.
              </p>
              <textarea
                id="fixAsap"
                name="fixAsap"
                value={formData.fixAsap}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 resize-none ${
                  errors.fixAsap
                    ? 'border-red-500 focus:border-red-500'
                    : isDarkMode
                    ? 'border-gray-600 bg-[rgba(0, 37, 39)] text-white placeholder-gray-400 focus:border-[rgba(234,128,64)]'
                    : 'border-gray-300 bg-white text-[rgba(0, 37, 39)] placeholder-gray-500 focus:border-[rgba(234,128,64)]'
                } focus:outline-none focus:ring-2 focus:ring-[rgba(234,128,64,0.2)]`}
                placeholder="What's the most urgent issue we need to address?"
              />
              <div className="flex justify-between items-center mt-2">
                {errors.fixAsap && (
                  <p className="text-red-500 text-sm">{errors.fixAsap}</p>
                )}
                <p className={`text-sm ml-auto ${
                  formData.fixAsap.length > CHARACTER_LIMIT * 0.9 
                    ? 'text-orange-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formData.fixAsap.length}/{CHARACTER_LIMIT} characters
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isSubmitting
                    ? 'bg-gray-400 text-white'
                    : 'bg-[rgba(234,128,64)] hover:bg-[rgba(234,128,64,0.9)] text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className={`px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300 text-[rgba(0, 37, 39)] border border-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Your feedback is anonymous and will help us improve Confication for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
