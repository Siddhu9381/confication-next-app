'use client';

import CircularProgress from './CircularProgress';

interface ReportData {
  ok: boolean;
  report: {
    content: {
      structure: { score: number; };
      clarity: { score: number; };
      coherence: { score: number; };
      persuasion: { score: number; };
    };
    delivery: {
      fillers: { score: number; };
      pace: { score: number; };
      pauses: { score: number; };
    };
    language: {
      fluency: { score: number; };
      sentences: { score: number; };
      grammar: { score: number; };
    };
  };
}

interface ScoreCardProps {
  isDarkMode: boolean;
  reportData: ReportData;
}

export default function ScoreCard({ isDarkMode, reportData }: ScoreCardProps) {
  // Calculate overall score from all expandable cards
  const calculateOverallScore = () => {
    const { report } = reportData;
    
    // Content scores (out of 10)
    const contentScores = [
      report.content.structure.score,
      report.content.clarity.score,
      report.content.coherence.score,
      report.content.persuasion.score
    ];
    
    // Delivery scores (out of 10)
    const deliveryScores = [
      report.delivery.fillers.score,
      report.delivery.pace.score,
      report.delivery.pauses.score
    ];
    
    // Language scores (out of 10)
    const languageScores = [
      report.language.fluency.score,
      report.language.sentences.score,
      report.language.grammar.score
    ];
    
    // Combine all scores
    const allScores = [...contentScores, ...deliveryScores, ...languageScores];
    
    // Calculate average and convert to out of 100
    const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const overallScore = Math.round((averageScore / 10) * 100);
    
    return overallScore;
  };

  const overallScore = calculateOverallScore();

  return (
    <div 
      data-score-card
      className={`px-8 py-6 rounded-none w-full ${
        isDarkMode 
          ? 'border-r border-gray-600' 
          : 'bg-white border-r border-gray-300'
      }`}
      style={isDarkMode ? { backgroundColor: 'rgba(0, 37, 39)' } : {}}
    >
      {/* <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Performance Overview
        </h3>
        <div className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Last 30 days
        </div>
      </div> */}
      
      <div className="flex justify-center">
        <CircularProgress 
          score={overallScore} 
          maxScore={100} 
          isDarkMode={isDarkMode}
          size={140}
          strokeWidth={10}
        />
      </div>
      
      <div className="mt-4 text-center">
        <div className={`text-md font-medium ${
          isDarkMode ? 'text-white' : 'text-gray-700'
        }`}>
          Overall Score: {overallScore}/100
        </div>
      </div>
    </div>
  );
}

