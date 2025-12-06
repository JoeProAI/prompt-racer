'use client';

import { useEffect, useState } from 'react';

type StartCountdownProps = {
  isActive: boolean;
  onComplete: () => void;
};

export default function StartCountdown({ isActive, onComplete }: StartCountdownProps) {
  const [count, setCount] = useState<number | string | null>(null);

  useEffect(() => {
    if (!isActive) {
      setCount(null);
      return;
    }

    // Start countdown sequence
    const sequence = [3, 2, 1, 'GO!'];
    let index = 0;

    setCount(sequence[0]);

    const interval = setInterval(() => {
      index++;
      if (index < sequence.length) {
        setCount(sequence[index]);
      } else {
        setCount(null);
        onComplete();
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  if (count === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative">
        {/* Racing lights background */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 flex gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full border-4 border-gray-600 transition-all duration-300 ${
                typeof count === 'number' && 3 - count >= i
                  ? 'bg-red-500 shadow-lg shadow-red-500/50'
                  : 'bg-gray-800'
              } ${count === 'GO!' ? 'bg-green-500 shadow-lg shadow-green-500/50' : ''}`}
            />
          ))}
        </div>

        {/* Main countdown number */}
        <div
          className={`text-[200px] font-black leading-none transition-all duration-200 ${
            count === 'GO!'
              ? 'text-green-500 scale-125 animate-pulse'
              : 'text-[#ffd700]'
          }`}
          style={{
            textShadow:
              count === 'GO!'
                ? '0 0 60px rgba(34, 197, 94, 0.8), 0 0 120px rgba(34, 197, 94, 0.4)'
                : '0 0 60px rgba(255, 215, 0, 0.8), 0 0 120px rgba(255, 215, 0, 0.4)',
            animation: typeof count === 'number' ? 'countdown-pop 0.6s ease-out' : undefined,
          }}
        >
          {count}
        </div>

        {/* Subtitle */}
        <div className="text-center mt-4 text-gray-400 text-xl font-medium">
          {typeof count === 'number' ? 'Get Ready...' : '🏎️ RACE STARTED!'}
        </div>
      </div>

      <style jsx>{`
        @keyframes countdown-pop {
          0% {
            transform: scale(1.5);
            opacity: 0;
          }
          50% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
