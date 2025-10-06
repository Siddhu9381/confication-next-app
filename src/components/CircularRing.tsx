'use client';

import { useEffect, useRef, useState } from 'react';

interface CircularRingProps {
  isDarkMode: boolean;
  size?: number;
  strokeWidth?: number;
  isRecording?: boolean;
  fillDuration?: number; // Duration in milliseconds
}

export default function CircularRing({ 
  isDarkMode, 
  size = 200, 
  strokeWidth = 12,
  isRecording = false,
  fillDuration = 5000 // Default 5 seconds
}: CircularRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Create a "C" shape by using strokeDasharray to leave a gap
  const visibleArcLength = circumference * 0.75; // 75% visible
  const gapLength = circumference * 0.25; // 25% gap
  
  const fillCircleRef = useRef<SVGCircleElement>(null);
  const animationRef = useRef<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(119); // Start at 1:59 (119 seconds)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Handle session start/stop
  useEffect(() => {
    if (isRecording && !sessionStartTime) {
      // Start new session
      setSessionStartTime(Date.now());
    } else if (!isRecording && sessionStartTime) {
      // Stop session and reset
      setSessionStartTime(null);
      setTimeRemaining(119);
      
      if (fillCircleRef.current) {
        fillCircleRef.current.style.strokeDashoffset = (visibleArcLength * 4 / 3).toString();
      }
    }
  }, [isRecording, sessionStartTime, visibleArcLength]);

  // Animation loop
  useEffect(() => {
    if (isRecording && sessionStartTime) {
      const animate = () => {
        if (!fillCircleRef.current || !sessionStartTime) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - sessionStartTime;
        const progress = Math.min(elapsed / fillDuration, 1);
        
        // Calculate stroke-dashoffset with proper bounds to stay within "C" area
        const startOffset = visibleArcLength * 4 / 3;
        const endOffset = 147;
        const currentOffset = Math.max(endOffset, Math.min(startOffset, startOffset - (startOffset - endOffset) * progress));
        
        fillCircleRef.current.style.strokeDashoffset = currentOffset.toString();
        
        // Update timer (countdown from 119 to 0)
        const remainingSeconds = Math.max(0, 119 - Math.floor(elapsed / 1000));
        setTimeRemaining(remainingSeconds);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation completed
          animationRef.current = null;
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, sessionStartTime, fillDuration, visibleArcLength]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* First C-shaped Ring (background) */}
        {/* <svg
          width={size}
          height={size}
          className="absolute"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? 'rgba(0, 61, 61)' : 'rgba(0, 61, 61)'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${visibleArcLength} ${gapLength}`}
            strokeLinecap="round"
            transform={`rotate(45 ${size / 2} ${size / 2})`}
          />
        </svg> */}
        
        {/* Second C-shaped Ring (foreground) */}
        <svg
          width={size}
          height={size}
          className="absolute"
          style={{ zIndex: 1 }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? 'rgba(0, 61, 61)' : 'rgba(0, 61, 61)'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${visibleArcLength} ${gapLength}`}
            strokeLinecap="round"
            transform={`rotate(45 ${size / 2} ${size / 2})`}
          />
          
              {/* Filling Ring - only visible when recording */}
              {isRecording && (
                <circle
                  ref={fillCircleRef}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(234, 128, 64)"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  transform={`rotate(45 ${size / 2} ${size / 2})`}
                  style={{
                    strokeDasharray: visibleArcLength * 4 / 3,
                    strokeDashoffset: visibleArcLength * 4 / 3
                  }}
                />
              )}
        </svg>
        
        {/* Timer Display */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <div className="text-center">
            <div 
              className={`text-4xl font-bold font-mono ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}