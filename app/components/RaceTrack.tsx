'use client';

import { useEffect, useState } from 'react';

type ModelResult = {
  model: string;
  content: string;
  responseTime: number;
  error?: string;
};

type RaceTrackProps = {
  isRacing: boolean;
  results: ModelResult[];
  winner: string | null;
};

const MODEL_CONFIG = {
  'GPT-4o': {
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    shadowColor: 'shadow-green-500/50',
    emoji: '🟢',
    carEmoji: '🏎️',
  },
  'Claude Sonnet 4.5': {
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    shadowColor: 'shadow-purple-500/50',
    emoji: '🟣',
    carEmoji: '🚗',
  },
  'Gemini 2.0 Flash': {
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    shadowColor: 'shadow-blue-500/50',
    emoji: '🔵',
    carEmoji: '🚙',
  },
  'Grok 4.1 Fast': {
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    shadowColor: 'shadow-red-500/50',
    emoji: '🔴',
    carEmoji: '🏁',
  },
};

const MODELS = ['GPT-4o', 'Claude Sonnet 4.5', 'Gemini 2.0 Flash', 'Grok 4.1 Fast'] as const;

export default function RaceTrack({ isRacing, results, winner }: RaceTrackProps) {
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [raceTime, setRaceTime] = useState(0);

  // Calculate final positions when race ends
  useEffect(() => {
    if (!isRacing && results.length > 0) {
      const finalPositions: Record<string, number> = {};
      results.forEach((r) => {
        finalPositions[r.model] = r.error ? 50 : 100;
      });
      // Use timeout to avoid synchronous setState in effect
      const timer = setTimeout(() => setPositions(finalPositions), 0);
      return () => clearTimeout(timer);
    }
  }, [isRacing, results]);

  // Animate positions during race
  useEffect(() => {
    if (!isRacing) {
      return;
    }

    // Reset positions at start
    const initialPositions: Record<string, number> = {};
    MODELS.forEach((m) => (initialPositions[m] = 0));
    // Use timeout to avoid synchronous setState in effect
    const initTimer = setTimeout(() => {
      setPositions(initialPositions);
      setRaceTime(0);
    }, 0);

    // Animate cars moving at different speeds during race
    const interval = setInterval(() => {
      setRaceTime((t) => t + 100);
      setPositions((prev) => {
        const next = { ...prev };
        MODELS.forEach((model) => {
          const result = results.find((r) => r.model === model);
          if (result) {
            // Model finished - snap to 100%
            next[model] = result.error ? 50 : 100;
          } else {
            // Still racing - random progress with some variance per model
            const speed = 2 + Math.random() * 3;
            next[model] = Math.min(95, (prev[model] || 0) + speed);
          }
        });
        return next;
      });
    }, 100);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [isRacing, results]);

  // Sort models by position for ranking display
  const sortedModels = [...MODELS].sort((a, b) => {
    const posA = positions[a] || 0;
    const posB = positions[b] || 0;
    return posB - posA;
  });

  return (
    <div className="w-full">
      {/* Track Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏁</span>
          <h2 className="text-xl font-bold text-white">Race Track</h2>
        </div>
        {isRacing && (
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-[#ffd700]/30">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[#ffd700] font-mono font-bold">
              {(raceTime / 1000).toFixed(1)}s
            </span>
          </div>
        )}
      </div>

      {/* Race Track Container */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border-4 border-gray-700 overflow-hidden">
        {/* Track Surface Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 100px)',
            }}
          />
        </div>

        {/* Start Line */}
        <div className="absolute left-16 top-0 bottom-0 w-1 bg-white/30" />
        <div className="absolute left-16 top-2 text-xs text-white/50 font-bold -rotate-90 origin-left">
          START
        </div>

        {/* Finish Line */}
        <div className="absolute right-8 top-0 bottom-0 w-4">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, white 0px, white 10px, black 10px, black 20px)',
            }}
          />
        </div>

        {/* Race Lanes */}
        <div className="relative p-4 space-y-3">
          {MODELS.map((model, index) => {
            const config = MODEL_CONFIG[model];
            const position = positions[model] || 0;
            const result = results.find((r) => r.model === model);
            const isWinner = winner === model;
            const rank = sortedModels.indexOf(model) + 1;

            return (
              <div key={model} className="relative">
                {/* Lane */}
                <div
                  className={`relative h-16 bg-gray-800/80 rounded-lg border-2 ${
                    isWinner ? 'border-[#ffd700] shadow-lg shadow-[#ffd700]/30' : 'border-gray-700'
                  } overflow-hidden`}
                >
                  {/* Lane Number */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm border border-gray-600">
                    {index + 1}
                  </div>

                  {/* Progress Track */}
                  <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-2 bg-gray-700 rounded-full">
                    <div
                      className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-100`}
                      style={{ width: `${position}%` }}
                    />
                  </div>

                  {/* Racing Car */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 transition-all duration-100 ${
                      isRacing && !result ? 'animate-bounce' : ''
                    }`}
                    style={{
                      left: `calc(12px + ${position}% * 0.85)`,
                    }}
                  >
                    <div
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} ${config.shadowColor} shadow-lg`}
                    >
                      <span className="text-2xl">{isRacing && !result ? '🏎️' : result?.error ? '💥' : '🏎️'}</span>
                      {/* Speed lines when racing */}
                      {isRacing && !result && (
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex gap-0.5">
                          <div className="w-3 h-0.5 bg-white/60 rounded animate-pulse" />
                          <div className="w-2 h-0.5 bg-white/40 rounded animate-pulse" />
                          <div className="w-1 h-0.5 bg-white/20 rounded animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model Name & Time */}
                  <div className="absolute right-14 top-1/2 -translate-y-1/2 text-right">
                    <div className={`font-bold text-sm ${isWinner ? 'text-[#ffd700]' : 'text-white'}`}>
                      {model}
                    </div>
                    {result && (
                      <div className="text-xs text-gray-400">
                        {result.error ? '❌ DNF' : `${result.responseTime}ms`}
                      </div>
                    )}
                  </div>

                  {/* Position Badge */}
                  {result && !result.error && (
                    <div
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                        rank === 1
                          ? 'bg-[#ffd700] text-black'
                          : rank === 2
                          ? 'bg-gray-300 text-black'
                          : rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>
                  )}

                  {/* Winner Celebration */}
                  {isWinner && !isRacing && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-1/4 text-xl animate-bounce delay-100">✨</div>
                      <div className="absolute top-0 left-1/2 text-xl animate-bounce delay-200">🎉</div>
                      <div className="absolute top-0 left-3/4 text-xl animate-bounce delay-300">✨</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Crowd/Spectators */}
        <div className="h-8 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center gap-1 pb-1 text-xs opacity-60">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className={isRacing ? 'animate-bounce' : ''} style={{ animationDelay: `${i * 50}ms` }}>
              👤
            </span>
          ))}
        </div>
      </div>

      {/* Winner Announcement */}
      {winner && !isRacing && (
        <div className="mt-6 text-center animate-pulse">
          <div className="inline-block bg-gradient-to-r from-[#ffd700]/20 via-[#ffd700]/30 to-[#ffd700]/20 rounded-2xl px-8 py-4 border-2 border-[#ffd700] shadow-lg shadow-[#ffd700]/30">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-black text-[#ffd700]">{winner} WINS!</div>
            <div className="text-sm text-gray-400 mt-1">
              {results.find((r) => r.model === winner)?.responseTime}ms
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
