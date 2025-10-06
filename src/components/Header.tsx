'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('sessionReportData');
    localStorage.removeItem('finalTranscript');
    // Redirect to login page
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 w-full py-3 shadow-lg transition-colors duration-300 ${
      isDarkMode ? 'border-b border-gray-700' : 'bg-white border-b border-gray-200'
    }`} style={isDarkMode ? { backgroundColor: 'rgba(0, 37, 39)' } : {}}>
      <div className="w-full flex items-center justify-between">
        {/* Left side - Logo and App Name */}
        <Link href="/" className="flex items-center space-x-2 pl-4">
          {/* Logo */}
          <div 
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ 
              backgroundColor: 'white'
            }}
          >
            <Image
              src="/logo.png"
              alt="Confication Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          {/* App Name */}
          <h1 className={`text-xl tracking-wide ${
            isDarkMode ? 'text-white' : 'text-gray-600'
          }`}>
            Confication
          </h1>
        </Link>

        {/* Right side - Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 pr-4">
          {/* Theme Toggle Icon */}
          <button 
            onClick={toggleTheme}
            className={`transition-colors duration-200 p-1 ${
              isDarkMode 
                ? 'text-white hover:text-teal-200' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              // Moon icon for dark mode
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                />
              </svg>
            ) : (
              // Sun icon for light mode
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                />
              </svg>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className={`font-medium transition-colors duration-200 ${
              isDarkMode 
                ? 'text-white hover:text-teal-200' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Logout
          </button>
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <button
          className={`block lg:hidden transition-colors duration-200 p-2 pr-4 ${
            isDarkMode 
              ? 'text-white hover:text-gray-300' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className={`lg:hidden mt-4 pb-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="flex flex-col space-y-4 pt-4">
            <button 
              className={`font-medium py-2 text-left flex items-center space-x-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-white hover:text-gray-300' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
            >
              {isDarkMode ? (
                // Moon icon for dark mode
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                  />
                </svg>
              ) : (
                // Sun icon for light mode
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              )}
              <span>Theme</span>
            </button>
            
            <button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className={`font-medium py-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-white hover:text-gray-300' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
