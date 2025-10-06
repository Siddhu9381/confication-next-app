'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import Header from './Header';
import LandingHeader from './LandingHeader';
import SessionReportHeader from './SessionReportHeader';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const { isDarkMode } = useTheme();
  const pathname = usePathname();
  
  // Routes that should not show the header
  const noHeaderRoutes = ['/login', '/register'];
  const shouldShowHeader = !noHeaderRoutes.includes(pathname);
  
  // Landing page uses special header
  const isLandingPage = pathname === '/';
  
  // Session report page uses special header
  const isSessionReportPage = pathname === '/session-report';
  
  return (
    <div 
      className="h-screen w-screen overflow-hidden p-4"
      style={{ 
        backgroundColor: isDarkMode ? 'rgba(0, 61, 61)' : '#e5e7eb' // light grey for light mode
      }}
    >
      {/* Inner Container - Conditional background with scrollable content */}
      <div 
        className="h-full w-full overflow-y-auto rounded-lg shadow-2xl"
        style={{ 
          backgroundColor: isDarkMode ? 'rgba(0, 37, 39)' : '#ffffff' // white for light mode
        }}
      >
        {shouldShowHeader && (
          isLandingPage ? <LandingHeader /> : 
          isSessionReportPage ? <SessionReportHeader /> : 
          <Header />
        )}
        {children}
      </div>
    </div>
  );
}
