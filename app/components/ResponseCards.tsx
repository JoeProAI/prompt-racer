'use client';

import { useState } from 'react';

type ModelResult = {
  model: string;
  content: string;
  responseTime: number;
  error?: string;
};

type ResponseCardsProps = {
  results: ModelResult[];
  winner: string | null;
};

const MODEL_CONFIG: Record<string, { color: string; borderColor: string; icon: string }> = {
  'GPT-4o': {
    color: 'from-green-500/20 to-green-600/10',
    borderColor: 'border-green-500/50 hover:border-green-500',
    icon: '🟢',
  },
  'Claude Sonnet 4.5': {
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/50 hover:border-purple-500',
    icon: '🟣',
  },
  'Gemini 2.0 Flash': {
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/50 hover:border-blue-500',
    icon: '🔵',
  },
  'Grok 4.1 Fast': {
    color: 'from-red-500/20 to-red-600/10',
    borderColor: 'border-red-500/50 hover:border-red-500',
    icon: '🔴',
  },
};

export default function ResponseCards({ results, winner }: ResponseCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Sort by response time
  const sortedResults = [...results]
    .filter((r) => !r.error)
    .sort((a, b) => a.responseTime - b.responseTime);

  const getRank = (model: string) => {
    const index = sortedResults.findIndex((r) => r.model === model);
    return index >= 0 ? index + 1 : null;
  };

  const getRankEmoji = (rank: number | null) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏁';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📋</span> Race Responses
        </h3>
        <span className="text-sm text-gray-400">Click to expand</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result) => {
          const config = MODEL_CONFIG[result.model] || {
            color: 'from-gray-500/20 to-gray-600/10',
            borderColor: 'border-gray-500/50',
            icon: '⚪',
          };
          const rank = getRank(result.model);
          const isWinner = result.model === winner;
          const isExpanded = expandedCard === result.model;

          return (
            <div
              key={result.model}
              onClick={() => setExpandedCard(isExpanded ? null : result.model)}
              className={`relative bg-gradient-to-br ${config.color} rounded-xl border-2 ${
                isWinner
                  ? 'border-[#ffd700] shadow-lg shadow-[#ffd700]/20'
                  : config.borderColor
              } p-4 cursor-pointer transition-all duration-300 ${
                isExpanded ? 'md:col-span-2' : ''
              }`}
            >
              {/* Winner Badge */}
              {isWinner && (
                <div className="absolute -top-3 -right-3 bg-[#ffd700] text-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg animate-bounce">
                  🏆
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  <span className={`font-bold ${isWinner ? 'text-[#ffd700]' : 'text-white'}`}>
                    {result.model}
                  </span>
                  {rank && (
                    <span className="text-lg">{getRankEmoji(rank)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {result.error ? (
                    <span className="text-red-400 text-sm">❌ Failed</span>
                  ) : (
                    <span className="bg-black/30 px-3 py-1 rounded-full text-sm font-mono">
                      <span className="text-[#ffd700]">⚡</span>{' '}
                      <span className="text-white">{result.responseTime}ms</span>
                    </span>
                  )}
                  <span className="text-gray-400 text-lg">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div
                className={`text-gray-300 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-[500px]' : 'max-h-24'
                }`}
              >
                {result.error ? (
                  <p className="text-red-400 italic">Failed to get response from this model.</p>
                ) : (
                  <div className="whitespace-pre-wrap">{result.content}</div>
                )}
              </div>

              {/* Fade gradient for collapsed state */}
              {!isExpanded && !result.error && result.content.length > 200 && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
