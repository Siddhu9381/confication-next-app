'use client';

interface CircularProgressProps {
  score: number;
  maxScore: number;
  isDarkMode: boolean;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgress({ 
  score, 
  maxScore, 
  isDarkMode, 
  size = 120, 
  strokeWidth = 8 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / maxScore) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Get progress circle color based on score percentage - matching ExpandableCard colors
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'rgba(0, 134, 130, 1)'; // Green/Teal (80-100%)
    if (percentage >= 60) return 'rgba(140, 200, 180, 1)'; // Light Green (60-79%)
    if (percentage >= 40) return 'rgba(230, 200, 110, 1)'; // Yellow (40-59%)
    if (percentage >= 20) return 'rgba(220, 140, 80, 1)'; // Orange (20-39%)
    return 'rgba(200, 80, 80, 1)'; // Red (0-19%)
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Circular Progress Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? 'rgba(0, 49, 51)' : '#e5e7eb'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getProgressColor(progress)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {score}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-white' : 'text-gray-600'
            }`}>
              out of {maxScore}
            </div>
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className={`text-sm font-medium ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        Overall Score
      </div>
    </div>
  );
}
