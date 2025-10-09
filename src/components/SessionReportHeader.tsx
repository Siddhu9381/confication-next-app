'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SessionReportHeader() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(); // This handles everything: Firebase signout + localStorage cleanup + redirect
  };

  const handleFeedback = () => {
    router.push('/feedback');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 w-full py-3 shadow-lg transition-colors duration-300 border-b ${
      isDarkMode 
        ? 'bg-[rgba(0, 37, 39)] border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="w-full flex items-center justify-between px-4 relative">
        {/* Left side - Logo and App Name */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              isDarkMode ? 'bg-white' : 'bg-[rgba(0, 37, 39)]'
            }`}
          >
            <Image
              src="/logo.png"
              alt="Confication Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <h1 className={`text-xl tracking-wide ${
            isDarkMode ? 'text-white' : 'text-[rgba(0, 37, 39)]'
          }`}>
            Confication
          </h1>
        </div>

        {/* Right side - Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          {/* Feedback Button */}
          <button
            onClick={handleFeedback}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'bg-[rgba(234,128,64)] hover:bg-[rgba(234,128,64,0.9)] text-white'
                : 'bg-[rgba(0, 37, 39)] hover:bg-[rgba(0, 37, 39,0.9)] text-white'
            }`}
          >
            Feedback
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Logout
          </button>
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <button
          className={`block lg:hidden transition-colors duration-200 p-2 ${
            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
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

      {/* Mobile Menu Dropdown - Floating */}
      {isMenuOpen && (
        <div className={`lg:hidden absolute right-4 top-full mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-50 ${
          isDarkMode ? 'bg-[rgba(0, 37, 39)] border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <nav className="py-2">
            <button
              onClick={() => {
                handleFeedback();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors duration-200 font-medium ${
                isDarkMode
                  ? 'text-white hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>Feedback</span>
            </button>

            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors duration-200 font-medium ${
                isDarkMode
                  ? 'text-white hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              <span>Theme</span>
            </button>

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors duration-200 font-medium ${
                isDarkMode
                  ? 'text-white hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
