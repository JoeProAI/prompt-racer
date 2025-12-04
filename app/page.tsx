'use client';

import { useState, useEffect } from 'react';
import PaywallModal from './components/PaywallModal';

type ModelResult = {
  model: string;
  content: string;
  responseTime: number;
  error?: string;
};

type RaceState = {
  results: ModelResult[];
  winner: string | null;
  totalTime: number;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [isRacing, setIsRacing] = useState(false);
  const [raceData, setRaceData] = useState<RaceState | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);

  // Handle successful payment from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const credits = params.get('credits');

    if (success === 'true' && credits) {
      // Add credits via API
      fetch('/api/checkout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: parseInt(credits) }),
      })
        .then((res) => res.json())
        .then((data) => {
          setCreditsRemaining(data.creditsRemaining);
          // Clean URL
          window.history.replaceState({}, '', '/');
        })
        .catch((error) => console.error('Failed to add credits:', error));
    }
  }, []);

  const startRace = async () => {
    if (!input.trim() || isRacing) return;

    setIsRacing(true);
    setRaceData(null);
    setShowResults(true);
    const startTime = Date.now();
    setRaceStartTime(startTime);

    try {
      const response = await fetch('/api/race', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Out of credits, show paywall
        setShowPaywall(true);
        setIsRacing(false);
        return;
      }

      if (response.ok) {
        // Update credits remaining
        if (data.creditsRemaining !== undefined) {
          setCreditsRemaining(data.creditsRemaining);
        }

        // Add minimum display time of 2 seconds so you can see the race
        const elapsedTime = Date.now() - startTime;
        const minDisplayTime = 2000;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

        await new Promise(resolve => setTimeout(resolve, remainingTime));
        setRaceData(data);
      } else {
        console.error('Race failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to start race:', error);
    } finally {
      setIsRacing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startRace();
    }
  };

  const getModelColor = (model: string) => {
    const colors: Record<string, string> = {
      'GPT-4o': 'border-green-500/50',
      'Claude Sonnet 4.5': 'border-purple-500/50',
      'Gemini 2.0 Flash': 'border-blue-500/50',
      'Grok 4.1 Fast': 'border-red-500/50',
    };
    return colors[model] || 'border-gray-500/50';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#ffd700] mb-2" style={{ textShadow: '0 0 30px rgba(255, 215, 0, 0.8)' }}>
            🏁 Prompt Racer
          </h1>
          <p className="text-gray-400 text-lg">
            Race 4 AI models simultaneously and see who wins!
          </p>
          {/* Credits Counter */}
          <div className="mt-4 inline-block bg-black/40 backdrop-blur-md rounded-lg border border-[#ffd700]/30 px-6 py-2">
            <span className="text-[#ffd700] font-bold">🎟️ {creditsRemaining} races remaining</span>
            {creditsRemaining === 0 && (
              <button
                onClick={() => setShowPaywall(true)}
                className="ml-4 text-sm bg-[#ffd700]/20 border border-[#ffd700]/50 text-[#ffd700] px-4 py-1 rounded hover:bg-[#ffd700]/30"
              >
                Buy More
              </button>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8 bg-black/40 backdrop-blur-md rounded-lg border border-gray-800 shadow-[0_0_30px_rgba(255,215,0,0.15)] p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your prompt to start the race..."
              className="flex-1 px-6 py-4 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#ffd700]/50 focus:ring-2 focus:ring-[#ffd700]/50 transition-all text-lg"
              disabled={isRacing}
            />
            <button
              onClick={startRace}
              disabled={isRacing || !input.trim()}
              className={`px-10 py-4 rounded-lg font-bold text-lg transition-all ${
                isRacing
                  ? 'bg-[#ffd700]/10 border-2 border-[#ffd700]/30 text-[#ffd700] animate-pulse'
                  : 'bg-[#ffd700]/20 border-2 border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/30 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isRacing ? '🏁 RACING...' : '🚀 START RACE'}
            </button>
          </div>
        </div>

        {/* Racing Grid */}
        {showResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['GPT-4o', 'Claude Sonnet 4.5', 'Gemini 2.0 Flash', 'Grok 4.1 Fast'].map((modelName, index) => {
              const result = raceData?.results.find((r) => r.model === modelName);
              const isWinner = raceData?.winner === modelName;
              const modelColor = getModelColor(modelName);

              return (
                <div
                  key={modelName}
                  className={`relative bg-black/40 backdrop-blur-md rounded-lg border-2 p-6 transition-all ${
                    isRacing && !result
                      ? `${modelColor} animate-pulse shadow-[0_0_20px_rgba(255,215,0,0.3)]`
                      : isWinner
                      ? 'border-[#ffd700] shadow-[0_0_40px_rgba(255,215,0,0.6)]'
                      : modelColor
                  }`}
                >
                  {/* Winner Badge */}
                  {isWinner && (
                    <div className="absolute -top-4 -right-4 bg-[#ffd700] text-black rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-bounce">
                      🏆
                    </div>
                  )}

                  {/* Model Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                    <div>
                      <h3 className={`text-xl font-bold ${isWinner ? 'text-[#ffd700]' : 'text-white'}`}>
                        {modelName}
                      </h3>
                      {result && (
                        <p className="text-sm text-gray-400 mt-1">
                          ⚡ {result.responseTime}ms
                          {result.error && <span className="text-red-400 ml-2">❌ Error</span>}
                        </p>
                      )}
                    </div>
                    <div className="text-3xl">
                      {isRacing && !result ? '💨' : result?.error ? '❌' : '🏁'}
                    </div>
                  </div>

                  {/* Response Content */}
                  <div className="min-h-[200px]">
                    {isRacing && !result ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-4xl mb-2 animate-bounce">🏎️</div>
                          <p className="text-[#ffd700] animate-pulse">Racing...</p>
                        </div>
                      </div>
                    ) : result ? (
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {result.error ? (
                          <p className="text-red-400">Failed to get response</p>
                        ) : (
                          result.content
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Race Stats */}
        {raceData && !isRacing && (
          <div className="mt-8 bg-black/40 backdrop-blur-md rounded-lg border border-[#ffd700]/30 shadow-[0_0_30px_rgba(255,215,0,0.15)] p-6">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🏁 Race Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {raceData.results
                .filter((r) => !r.error)
                .sort((a, b) => a.responseTime - b.responseTime)
                .map((result, index) => (
                  <div key={result.model} className="text-center">
                    <div className="text-3xl mb-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏁'}
                    </div>
                    <p className="text-white font-semibold">{result.model}</p>
                    <p className="text-[#ffd700] text-sm">{result.responseTime}ms</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showResults && (
          <div className="text-center text-gray-500 mt-12">
            <div className="text-6xl mb-4">🏁</div>
            <p className="text-xl">Enter a prompt above to start the race!</p>
            <p className="text-sm mt-2 text-gray-600">
              GPT-4o • Claude Sonnet 4.5 • Gemini 2.0 Flash • Grok 4.1 Fast
            </p>
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        creditsRemaining={creditsRemaining}
      />
    </div>
  );
}
