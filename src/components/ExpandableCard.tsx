'use client';

import { useState } from 'react';

// Small circular progress component for ExpandableCard
interface SmallCircularProgressProps {
  score: number;
  maxScore: number;
  isDarkMode: boolean;
  size?: number;
  strokeWidth?: number;
}

function SmallCircularProgress({ 
  score, 
  maxScore, 
  isDarkMode, 
  size = 60, 
  strokeWidth = 4 
}: SmallCircularProgressProps) {
  const percentage = (score / maxScore) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Get progress circle color based on score percentage - matching status bar colors
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'rgba(0, 134, 130, 1)'; // Green/Teal (80-100%)
    if (percentage >= 60) return 'rgba(140, 200, 180, 1)'; // Light Green (60-79%)
    if (percentage >= 40) return 'rgba(230, 200, 110, 1)'; // Yellow (40-59%)
    if (percentage >= 20) return 'rgba(220, 140, 80, 1)'; // Orange (20-39%)
    return 'rgba(200, 80, 80, 1)'; // Red (0-19%)
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? 'rgba(0, 49, 51)' : '#e5e7eb'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getProgressColor(percentage)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
      </div>
      {/* Score text */}
      <div 
        className="text-xs font-medium"
        style={{ color: getProgressColor(percentage) }}
      >
        {score}/{maxScore}
      </div>
    </div>
  );
}

interface ExpandableCardProps {
  title: string;
  score: number;
  maxScore: number;
  isDarkMode: boolean;
  children?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  // New props for Content tab structure
  label?: string;
  feedback?: string;
  drill?: string;
  evidence?: {
    snippet: string;
    fix: string;
  };
  // New prop for info tooltip
  infoTooltip?: string;
}

export default function ExpandableCard({ 
  title, 
  score, 
  maxScore, 
  isDarkMode, 
  children,
  isExpanded,
  onToggle,
  label,
  feedback,
  drill,
  evidence,
  infoTooltip
}: ExpandableCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const percentage = (score / maxScore) * 100;
  
  // Determine score color based on percentage - matching status bar colors
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'rgba(0, 134, 130, 1)'; // Green/Teal (80-100%)
    if (percentage >= 60) return 'rgba(140, 200, 180, 1)'; // Light Green (60-79%)
    if (percentage >= 40) return 'rgba(230, 200, 110, 1)'; // Yellow (40-59%)
    if (percentage >= 20) return 'rgba(220, 140, 80, 1)'; // Orange (20-39%)
    return 'rgba(200, 80, 80, 1)'; // Red (0-19%)
  };

  const getScoreBarColor = (percentage: number) => {
    // Create a gradient from red (0%) to teal (100%)
    if (percentage >= 80) return 'rgba(0, 134, 130, 1)'; // Green/Teal (80-100%)
    if (percentage >= 60) return 'rgba(80, 160, 140, 1)'; // Light Green (60-79%)
    if (percentage >= 40) return 'rgba(230, 200, 110, 1)'; // Yellow (40-59%)
    if (percentage >= 20) return 'rgba(220, 140, 80, 1)'; // Orange (20-39%)
    return 'rgba(200, 80, 80, 1)'; // Red (0-19%)
  };

  return (
    <div className={`border-b transition-all duration-300 ${
      isDarkMode 
        ? 'border-gray-700' 
        : 'bg-white border-gray-200'
    }`} style={isDarkMode ? { backgroundColor: 'rgba(0, 37, 39)' } : {}}>
      {/* Card Header - Always Visible */}
      <button
        onClick={onToggle}
        className={`w-full py-4 flex items-center justify-between transition-colors duration-200 ${
          isDarkMode 
            ? 'expandable-card-hover' 
            : 'hover:bg-gray-50'
        }`}
        style={isDarkMode ? { 
          backgroundColor: 'rgba(0, 37, 39)'
        } : {}}
      >
        {/* Left Side - Title and Score */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Sub-section Title with Info Icon */}
          <div className="flex items-center space-x-2">
            <h6 className={`text-md font-small ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h6>
            
            {/* Info Icon with Tooltip */}
            {infoTooltip && (
              <div className="relative">
                <button
                  type="button"
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(!showTooltip);
                  }}
                >
                  <span className="text-xs font-bold">i</span>
                </button>
                
                {/* Tooltip */}
                {showTooltip && (
                  <div className={`absolute left-0 top-full mt-2 w-64 p-3 rounded-lg shadow-lg z-50 text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-200 border border-gray-700' 
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}>
                    {infoTooltip}
                    {/* Arrow pointer */}
                    <div className={`absolute -top-2 left-4 w-3 h-3 rotate-45 ${
                      isDarkMode ? 'bg-gray-800 border-l border-t border-gray-700' : 'bg-white border-l border-t border-gray-200'
                    }`}></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Score Display - Status Bar (when not expanded OR on mobile when expanded) */}
          {(!isExpanded || isExpanded) && (
            <div className="flex items-center space-x-2 md:hidden">
              <span 
                className="text-sm font-medium"
                style={{ color: getScoreColor(percentage) }}
              >
                {score}/{maxScore}
              </span>
              
              {/* Status Bar */}
              <div className={`w-20 h-2 rounded-full ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: getScoreBarColor(percentage)
                  }}
                />
              </div>
            </div>
          )}

          {/* Score Display - Status Bar (when not expanded on desktop) */}
          {!isExpanded && (
            <div className="hidden md:flex items-center space-x-2">
              <span 
                className="text-sm font-medium"
                style={{ color: getScoreColor(percentage) }}
              >
                {score}/{maxScore}
              </span>
              
              {/* Status Bar */}
              <div className={`w-20 h-2 rounded-full ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: getScoreBarColor(percentage)
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Expand Arrow */}
        <div className={`ml-4 transition-transform duration-300 ${
          isExpanded ? 'rotate-180' : 'rotate-0'
        }`}>
          <svg 
            className={`w-5 h-5 ${
              isDarkMode ? 'text-white' : 'text-gray-500'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`pb-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {/* Expanded Content Layout - Responsive */}
          <div className="pt-4 pb-4">
            {/* Desktop Layout - Circular Score on Left, Content on Right */}
            <div className="hidden md:flex items-start space-x-6">
              {/* Left Side - Circular Score Ring (Desktop Only) */}
              <div className="flex-shrink-0">
                <SmallCircularProgress 
                  score={score}
                  maxScore={maxScore}
                  isDarkMode={isDarkMode}
                  size={60}
                  strokeWidth={6}
                />
              </div>
              
              {/* Right Side - Side Headings and Text */}
              <div className={`flex-1 space-y-4 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}>
            {children || (
              <>
                {/* Label Section - Direct text without heading for Content tab */}
                {label && (
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed">
                      {label}
                    </p>
                  </div>
                )}

                {/* Feedback Section */}
                {feedback && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Feedback
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {feedback}
                    </p>
                  </div>
                )}

                {/* Drill Section */}
                {drill && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Drill
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {drill}
                    </p>
                  </div>
                )}

                {/* Evidence Section - Only for Content tab */}
                {evidence && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Evidence
                    </h4>
                    
                    {/* Snippet Sub-section */}
                    <div className="space-y-1">
                      <h5 className={`text-xs font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Snippet
                      </h5>
                      <p className="text-sm leading-relaxed">
                        {evidence.snippet}
                      </p>
                    </div>

                    {/* Fix Sub-section */}
                    <div className="space-y-1">
                      <h5 className={`text-xs font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Fix
                      </h5>
                      <p className="text-sm leading-relaxed">
                        {evidence.fix}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fallback content for other tabs */}
                {!label && !feedback && !drill && !evidence && (
                  <>
                    {/* First Section */}
                    <div className="space-y-2">
                      <h4 className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Label
                      </h4>
                      <p className="text-sm leading-relaxed">
                        Your delivery shows strong engagement with clear articulation and appropriate pacing throughout the session.
                      </p>
                    </div>

                    {/* Second Section */}
                    <div className="space-y-2">
                      <h4 className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Feedback
                      </h4>
                      <p className="text-sm leading-relaxed">
                        Consistent tone, effective use of pauses, and natural flow contribute to an engaging presentation style.
                      </p>
                    </div>

                    {/* Third Section */}
                    <div className="space-y-2">
                      <h4 className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Drill
                      </h4>
                      <p className="text-sm leading-relaxed">
                        Consider varying your speaking pace and incorporating more dynamic vocal inflections to enhance audience engagement.
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
              </div>
            </div>

            {/* Mobile Layout - Content Only (No Circular Ring) */}
            <div className={`md:hidden space-y-4 ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              {children || (
                <>
                  {/* Label Section - Direct text without heading for Content tab */}
                  {label && (
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed">
                        {label}
                      </p>
                    </div>
                  )}

                  {/* Feedback Section */}
                  {feedback && (
                    <div className="space-y-2">
                      <h4 className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Feedback
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {feedback}
                      </p>
                    </div>
                  )}

                  {/* Drill Section */}
                  {drill && (
                    <div className="space-y-2">
                      <h4 className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Drill
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {drill}
                      </p>
                    </div>
                  )}

                  {/* Evidence Section - Only for Content tab */}
                  {evidence && (
                    <div className="space-y-2">
                      <h4 className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Evidence
                      </h4>
                      
                      {/* Snippet Sub-section */}
                      <div className="space-y-1">
                        <h5 className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Snippet
                        </h5>
                        <p className="text-sm leading-relaxed">
                          {evidence.snippet}
                        </p>
                      </div>

                      {/* Fix Sub-section */}
                      <div className="space-y-1">
                        <h5 className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Fix
                        </h5>
                        <p className="text-sm leading-relaxed">
                          {evidence.fix}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Fallback content for other tabs */}
                  {!label && !feedback && !drill && !evidence && (
                    <>
                      {/* First Section */}
                      <div className="space-y-2">
                        <h4 className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Label
                        </h4>
                        <p className="text-sm leading-relaxed">
                          Your delivery shows strong engagement with clear articulation and appropriate pacing throughout the session.
                        </p>
                      </div>

                      {/* Second Section */}
                      <div className="space-y-2">
                        <h4 className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Feedback
                        </h4>
                        <p className="text-sm leading-relaxed">
                          Consistent tone, effective use of pauses, and natural flow contribute to an engaging presentation style.
                        </p>
                      </div>

                      {/* Third Section */}
                      <div className="space-y-2">
                        <h4 className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Drill
                        </h4>
                        <p className="text-sm leading-relaxed">
                          Consider varying your speaking pace and incorporating more dynamic vocal inflections to enhance audience engagement.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
