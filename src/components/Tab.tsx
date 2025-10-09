'use client';

import ExpandableCard from './ExpandableCard';

interface TabProps {
  isDarkMode: boolean;
  title: string;
  cards: Array<{
    title: string;
    score: number;
    maxScore: number;
    content: string;
    label?: string;
    feedback?: string;
    drill?: string;
    evidence?: {
      snippet: string;
      fix: string;
    };
    infoTooltip?: string;
  }>;
  tabId: string;
  expandedCards: Set<number>;
  onToggleCard: (cardIndex: number) => void;
}

export default function Tab({ isDarkMode, title, cards, tabId, expandedCards, onToggleCard }: TabProps) {
  return (
    <div className="space-y-0 px-4">
      {/* <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3> */}
      
      {cards.map((card, index) => (
        <ExpandableCard 
          key={index}
          title={card.title} 
          score={card.score} 
          maxScore={card.maxScore} 
          isDarkMode={isDarkMode}
          isExpanded={expandedCards.has(index)}
          onToggle={() => onToggleCard(index)}
          label={card.label}
          feedback={card.feedback}
          drill={card.drill}
          evidence={card.evidence}
          infoTooltip={card.infoTooltip}
        />
      ))}
    </div>
  );
}
