'use client';

interface LoadingModalProps {
  isVisible: boolean;
  message?: string;
  isDarkMode?: boolean;
  showDebugInfo?: boolean;
  totalTurns?: number;
  transcriptLength?: number;
  wordCount?: number;
}

export default function LoadingModal({ 
  isVisible, 
  message = "Processing your session...", 
  isDarkMode = false,
  showDebugInfo = false,
  totalTurns = 0,
  transcriptLength = 0,
  wordCount = 0
}: LoadingModalProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className={`rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 backdrop-blur-sm ${
        isDarkMode ? 'bg-gray-800/80 border border-gray-600' : 'bg-white/80 border border-gray-300'
      }`}>
        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-orange-500"></div>
        </div>
        
        {/* Loading Message */}
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {message}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Please wait while we analyze your session...
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mt-6 space-y-2">
          <div className={`flex items-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            Analyzing speech patterns
          </div>
          <div className={`flex items-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            Processing content structure
          </div>
          <div className={`flex items-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            Generating insights
          </div>
        </div>

        {/* Debug Information */}
        {showDebugInfo && (
          <div className={`mt-6 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Session Data:
            </h4>
            <div className="space-y-1 text-xs">
              <div className={`flex justify-between ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <span>Total Turns:</span>
                <span className="font-mono">{totalTurns}</span>
              </div>
              <div className={`flex justify-between ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <span>Transcript Length:</span>
                <span className="font-mono">{transcriptLength} chars</span>
              </div>
              <div className={`flex justify-between ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <span>Word Count:</span>
                <span className="font-mono">{wordCount}</span>
              </div>
            </div>
            <div className={`mt-2 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Check browser console for detailed logs
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
