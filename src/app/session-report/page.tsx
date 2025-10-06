'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScoreCard from '@/components/ScoreCard';
import TranscriptSection from '@/components/TranscriptSection';
import TabSection from '@/components/TabSection';
import LoadingModal from '@/components/LoadingModal';
import { useTheme } from '@/contexts/ThemeContext';

interface ReportData {
  ok: boolean;
  report: {
    content: {
      structure: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
        evidence: {
          problem: string;
          fix: string;
        };
      };
      clarity: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
        evidence: {
          problem: string;
          fix: string;
        };
      };
      coherence: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
        evidence: {
          problem: string;
          fix: string;
        };
      };
      persuasion: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
        evidence: {
          problem: string;
          fix: string;
        };
      };
    };
    delivery: {
      fillers: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
      };
      pace: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
      };
      pauses: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
      };
    };
    language: {
      fluency: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
      };
      sentences: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
      };
      grammar: {
        score: number;
        label: string;
        feedback: string;
        drill: string;
        evidence: {
          snippet: string;
          fix: string;
        };
      };
    };
  };
}

export default function SessionReportPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    const loadReportData = () => {
      try {
        // Get transcript from localStorage
        const savedTranscript = localStorage.getItem('finalTranscript');
        if (savedTranscript) {
          setTranscript(savedTranscript);
        }

        // Get report data from localStorage (passed from session page)
        const savedReportData = localStorage.getItem('sessionReportData');
        if (savedReportData) {
          const data = JSON.parse(savedReportData);
          console.log('📊 Report data loaded from localStorage:', data);
          setReportData(data);
          
          // Clean up localStorage after loading
          localStorage.removeItem('sessionReportData');
        } else {
          // Fallback: if no data in localStorage, show error
          setError('No session report data available. Please complete a recording session first.');
        }
      } catch (err) {
        console.error('❌ Error loading report data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading report...</div>
        </div>
        <LoadingModal 
          isVisible={true}
          message="Preparing your session report..."
          isDarkMode={isDarkMode}
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No report data available</div>
      </div>
    );
  }

  return (
    <div className="px-0 py-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Top Left - Score Card */}
        <div className="lg:col-span-1">
          <ScoreCard isDarkMode={isDarkMode} reportData={reportData} />
        </div>
        
        {/* Top Right - Transcript Section */}
        <div className="lg:col-span-2">
          <TranscriptSection isDarkMode={isDarkMode} transcript={transcript} />
        </div>
      </div>

      {/* Bottom Section - Tab Structure */}
      <div className="mt-0">
        <TabSection isDarkMode={isDarkMode} reportData={reportData} />
      </div>
    </div>
  );
}
