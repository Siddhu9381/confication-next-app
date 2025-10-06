'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full py-3 shadow-lg bg-[rgba(0,37,39)] border-b border-gray-700">
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
          <h1 className="text-xl tracking-wide text-white">
            Confication
          </h1>
        </Link>

        {/* Right side - Try it Free Button */}
        <div className="pr-4">
          <Link 
            href="/login"
            className="bg-[rgba(234,128,64)] hover:bg-[rgba(234,128,64,0.9)] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Try it Free
          </Link>
        </div>
      </div>
    </header>
  );
}
