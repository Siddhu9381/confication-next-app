'use client';

import { useEffect, useRef, useState } from 'react';

interface TranscriptSectionProps {
  isDarkMode: boolean;
  transcript?: string;
}

export default function TranscriptSection({ isDarkMode, transcript = '' }: TranscriptSectionProps) {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      // Find the score card by looking for the circular progress component
      const scoreCard = document.querySelector('[data-score-card]') || 
                       document.querySelector('.rounded-lg.shadow-lg');
      
      if (scoreCard) {
        const scoreCardHeight = scoreCard.getBoundingClientRect().height;
        setHeight(scoreCardHeight);
      }
    };

    // Initial measurement
    const timer = setTimeout(updateHeight, 100);

    // Also measure on window resize
    window.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div 
      ref={transcriptRef}
      className={`px-5 py-5 rounded-none w-full flex flex-col ${
        isDarkMode 
          ? '' 
          : 'bg-white'
      }`}
      style={{ 
        height: height ? `${height}px` : 'auto',
        backgroundColor: isDarkMode ? 'rgba(0, 37, 39)' : undefined
      }}
    >
      <div className="mb-4">
        <h6 className={`text-sm font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Transcript
        </h6>
      </div>
      
      {/* Scrollable Content Area */}
      <div className={`flex-1 overflow-y-auto scrollbar-thin`}>
        <div className={`text-md font-small leading-relaxed ${
          isDarkMode ? 'text-white' : 'text-gray-700'
        }`}>
          {transcript ? (
            <p className="mb-4 whitespace-pre-wrap">
              {transcript}
            </p>
          ) : (
            <p className="mb-4 text-gray-500 italic">
              No transcript available yet. Complete a recording session to see your transcript here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
