'use client';

import { useState } from 'react';
import Tab from './Tab';

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

interface TabSectionProps {
  isDarkMode: boolean;
  reportData: ReportData;
}

export default function TabSection({ isDarkMode, reportData }: TabSectionProps) {
  const [activeTab, setActiveTab] = useState('delivery');
  const [expandedCards, setExpandedCards] = useState<Record<string, Set<number>>>({
    delivery: new Set(),
    language: new Set(),
    content: new Set()
  });

  const toggleCard = (tabId: string, cardIndex: number) => {
    setExpandedCards(prev => {
      const newState = { ...prev };
      const newSet = new Set(newState[tabId]);
      if (newSet.has(cardIndex)) {
        newSet.delete(cardIndex);
      } else {
        newSet.add(cardIndex);
      }
      newState[tabId] = newSet;
      return newState;
    });
  };

  const tabs = [
    { id: 'delivery', label: 'Delivery' },
    { id: 'language', label: 'Language' },
    { id: 'content', label: 'Content' }
  ];

  // Tab data configuration from reportData
  const tabData = {
    delivery: {
      title: 'Delivery Analysis',
      cards: [
        {
          title: 'Fillers',
          score: reportData.report.delivery.fillers.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.delivery.fillers.feedback,
          label: reportData.report.delivery.fillers.label,
          feedback: reportData.report.delivery.fillers.feedback,
          drill: reportData.report.delivery.fillers.drill,
          infoTooltip: 'Tracks how often you use filler words like "um," "uh," or "like," which can affect confidence and flow.'
        },
        {
          title: 'Pace',
          score: reportData.report.delivery.pace.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.delivery.pace.feedback,
          label: reportData.report.delivery.pace.label,
          feedback: reportData.report.delivery.pace.feedback,
          drill: reportData.report.delivery.pace.drill,
          infoTooltip: 'Measures how fast you speak overall to ensure your delivery feels natural, steady, and easy to follow.'
        },
        {
          title: 'Pauses',
          score: reportData.report.delivery.pauses.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.delivery.pauses.feedback,
          label: reportData.report.delivery.pauses.label,
          feedback: reportData.report.delivery.pauses.feedback,
          drill: reportData.report.delivery.pauses.drill,
          infoTooltip: 'Checks whether your pauses are well-timed and natural, or if long or misplaced ones break the flow and reduce listener engagement.'
        }
      ]
    },
    language: {
      title: 'Language Analysis',
      cards: [
        {
          title: 'Fluency',
          score: reportData.report.language.fluency.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.language.fluency.feedback,
          label: reportData.report.language.fluency.label,
          feedback: reportData.report.language.fluency.feedback,
          drill: reportData.report.language.fluency.drill,
          infoTooltip: 'Measures how effortlessly you deliver your speech, focusing on smooth word flow and minimal hesitation.'
        },
        {
          title: 'Sentences',
          score: reportData.report.language.sentences.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.language.sentences.feedback,
          label: reportData.report.language.sentences.label,
          feedback: reportData.report.language.sentences.feedback,
          drill: reportData.report.language.sentences.drill,
          infoTooltip: 'Assesses your sentence length variation to see if you balance short and long sentences for a more engaging rhythm.'
        },
        {
          title: 'Grammar',
          score: reportData.report.language.grammar.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.language.grammar.feedback,
          label: reportData.report.language.grammar.label,
          feedback: reportData.report.language.grammar.feedback,
          drill: reportData.report.language.grammar.drill,
          evidence: reportData.report.language.grammar.evidence.snippet && reportData.report.language.grammar.evidence.snippet.trim() !== '' ? {
            snippet: reportData.report.language.grammar.evidence.snippet,
            fix: reportData.report.language.grammar.evidence.fix
          } : undefined,
          infoTooltip: 'Evaluates the correctness of your language, checking for errors in tense, agreement, and sentence structure.'
        }
      ]
    },
    content: {
      title: 'Content Analysis',
      cards: [
        {
          title: 'Structure',
          score: reportData.report.content.structure.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.content.structure.feedback,
          label: reportData.report.content.structure.label,
          feedback: reportData.report.content.structure.feedback,
          drill: reportData.report.content.structure.drill,
          evidence: {
            snippet: reportData.report.content.structure.evidence.problem,
            fix: reportData.report.content.structure.evidence.fix
          },
          infoTooltip: 'Evaluates how well your speech is organized, from a clear introduction to a focused body and a strong closing wrap-up.'
        },
        {
          title: 'Clarity',
          score: reportData.report.content.clarity.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.content.clarity.feedback,
          label: reportData.report.content.clarity.label,
          feedback: reportData.report.content.clarity.feedback,
          drill: reportData.report.content.clarity.drill,
          evidence: {
            snippet: reportData.report.content.clarity.evidence.problem,
            fix: reportData.report.content.clarity.evidence.fix
          },
          infoTooltip: 'Measures how easily your ideas can be understood and whether your words and terms are clearly defined.'
        },
        {
          title: 'Coherence',
          score: reportData.report.content.coherence.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.content.coherence.feedback,
          label: reportData.report.content.coherence.label,
          feedback: reportData.report.content.coherence.feedback,
          drill: reportData.report.content.coherence.drill,
          evidence: {
            snippet: reportData.report.content.coherence.evidence.problem,
            fix: reportData.report.content.coherence.evidence.fix
          },
          infoTooltip: 'Checks how smoothly your sentences connect and whether your thoughts flow logically from one to the next.'
        },
        {
          title: 'Persuasion',
          score: reportData.report.content.persuasion.score, // Keep as 0-10 scale
          maxScore: 10,
          content: reportData.report.content.persuasion.feedback,
          label: reportData.report.content.persuasion.label,
          feedback: reportData.report.content.persuasion.feedback,
          drill: reportData.report.content.persuasion.drill,
          evidence: {
            snippet: reportData.report.content.persuasion.evidence.problem,
            fix: reportData.report.content.persuasion.evidence.fix
          },
          infoTooltip: 'Assesses how effectively your ending leaves an impact — through a clear benefit, next step, or memorable closing message.'
        }
      ]
    }
  };

  return (
    <div className={`rounded-none shadow-lg ${
      isDarkMode 
        ? '' 
        : 'bg-white'
    }`} style={isDarkMode ? { backgroundColor: 'rgba(0, 37, 39)' } : {}}>
            {/* Tab Header */}
            <div className={`border-t border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
        <nav className="flex">
          {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? ''
                  : isDarkMode
                    ? 'border-transparent text-white hover:text-gray-300 hover:border-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={activeTab === tab.id ? { 
                borderBottomColor: 'rgba(234, 128, 64)',
                borderBottomWidth: '2px',
                color: 'rgba(234, 128, 64)'
              } : {}}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="">
        <Tab 
          isDarkMode={isDarkMode}
          title={tabData[activeTab as keyof typeof tabData].title}
          cards={tabData[activeTab as keyof typeof tabData].cards}
          tabId={activeTab}
          expandedCards={expandedCards[activeTab]}
          onToggleCard={(cardIndex) => toggleCard(activeTab, cardIndex)}
        />
      </div>
    </div>
  );
}
