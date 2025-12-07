'use client';

import { useState, useEffect, useCallback } from 'react';
import PaywallModal from './components/PaywallModal';
import RaceTrack from './components/RaceTrack';
import StartCountdown from './components/StartCountdown';
import ResponseCards from './components/ResponseCards';
import PresetSelector from './components/PresetSelector';
import { useAuth } from '@/lib/firebase/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DEFAULT_PRESET, getPresetModels } from '@/lib/models';

type ModelResult = {
  model: string;
  modelId?: string;
  content: string;
  responseTime: number;
  error?: string;
};

type RaceState = {
  results: ModelResult[];
  winner: string | null;
  totalTime: number;
  preset?: string;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [isRacing, setIsRacing] = useState(false);
  const [raceData, setRaceData] = useState<RaceState | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [totalRaces, setTotalRaces] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET);

  // Get Firebase auth user
  const { user } = useAuth();

  // Real-time Firestore credit listener
  useEffect(() => {
    if (!user || !db) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const credits = data.credits || 0;
        setCreditsRemaining(credits);
      } else {
        // New user, will get 3 free credits from backend
        setCreditsRemaining(3);
      }
    }, (error) => {
      console.error('Error listening to credits:', error);
      // Fall back to localStorage
      const localCredits = localStorage.getItem('pr_local_credits');
      if (localCredits) {
        setCreditsRemaining(parseInt(localCredits, 10));
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fallback: Sync localStorage with server credits (cookie-based system)
  useEffect(() => {
    if (user) return; // Skip if using Firebase

    const localCredits = localStorage.getItem('pr_local_credits');
    if (localCredits) {
      const parsed = parseInt(localCredits, 10);
      if (!isNaN(parsed)) {
        setCreditsRemaining(parsed);
      }
    }
  }, [user]);

  // Handle successful payment from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const credits = params.get('credits');
    const urlUserId = params.get('userId');

    if (success === 'true' && credits) {
      // Determine userId (from URL or current user)
      const targetUserId = urlUserId || user?.uid;

      // Add credits via API
      fetch('/api/checkout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: parseInt(credits),
          userId: targetUserId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!targetUserId) {
            // Cookie-based: update local state
            setCreditsRemaining(data.creditsRemaining);
            localStorage.setItem('pr_local_credits', data.creditsRemaining.toString());
          }
          // For Firestore users, real-time listener will update automatically
          // Clean URL
          window.history.replaceState({}, '', '/');
        })
        .catch((error) => console.error('Failed to add credits:', error));
    }
  }, [user]);

  // Initiate race with countdown
  const initiateRace = () => {
    if (!input.trim() || isRacing || showCountdown) return;

    // Client-side check for credits
    if (creditsRemaining <= 0) {
      setShowPaywall(true);
      return;
    }

    // Start countdown sequence
    setShowCountdown(true);
  };

  // Actually run the race (called after countdown)
  const executeRace = useCallback(async () => {
    setShowCountdown(false);
    setIsRacing(true);
    setRaceData(null);
    setShowResults(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/race', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userId: user?.uid,
          preset: selectedPreset,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        setShowPaywall(true);
        setIsRacing(false);
        return;
      }

      if (response.ok) {
        if (data.creditsRemaining !== undefined) {
          setCreditsRemaining(data.creditsRemaining);
          localStorage.setItem('pr_local_credits', data.creditsRemaining.toString());
        }

        // Minimum display time for race animation
        const elapsedTime = Date.now() - startTime;
        const minDisplayTime = 2500;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

        await new Promise(resolve => setTimeout(resolve, remainingTime));
        setRaceData(data);
        setTotalRaces(prev => prev + 1);
      } else {
        console.error('Race failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to start race:', error);
    } finally {
      setIsRacing(false);
    }
  }, [input, user?.uid, selectedPreset]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      initiateRace();
    }
  };

  // Reset for new race
  const resetRace = () => {
    setRaceData(null);
    setShowResults(false);
    setInput('');
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Animated Track Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Racing stripes animation */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0px, transparent 100px, rgba(255,215,0,0.3) 100px, rgba(255,215,0,0.3) 102px)',
            animation: 'slide 2s linear infinite',
          }}
        />
        {/* Hero Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage:
              'url(https://ebfeivgmoxl54igpv4z37ggz5n7i6iwpmpi4ykoiw4pdk2jhglra.arweave.net/IEpEVMx1194gz68zv5jZ636PIs9j0cwpyLceNWknMuI)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="text-4xl md:text-5xl">🏎️</div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-black text-[#ffd700]"
                  style={{ textShadow: '0 0 30px rgba(255, 215, 0, 0.6)' }}
                >
                  PROMPT RACER
                </h1>
                <p className="text-gray-400 text-sm">AI Model Racing Championship</p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4">
              {/* Total Races */}
              {totalRaces > 0 && (
                <div className="bg-black/50 backdrop-blur-md rounded-lg border border-gray-700 px-4 py-2 text-center">
                  <div className="text-xs text-gray-400">RACES TODAY</div>
                  <div className="text-xl font-bold text-white">{totalRaces}</div>
                </div>
              )}

              {/* Credits */}
              <div className="bg-black/50 backdrop-blur-md rounded-lg border border-[#ffd700]/50 px-4 py-2 flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400">CREDITS</div>
                  <div className="text-xl font-bold text-[#ffd700]">{creditsRemaining}</div>
                </div>
                {creditsRemaining <= 3 && (
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="bg-[#ffd700] text-black font-bold px-3 py-1 rounded text-sm hover:bg-[#ffed4a] transition-colors"
                  >
                    + BUY
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Race Area */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Race Control Panel */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100" />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200" />
                <span className="ml-2 text-gray-400 text-sm font-medium">RACE CONTROL</span>
              </div>

              {/* Model Preset Selector */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Select Race Lineup
                </label>
                <PresetSelector
                  selectedPreset={selectedPreset}
                  onPresetChange={setSelectedPreset}
                  disabled={isRacing || showCountdown}
                />
              </div>

              {/* Prompt Input */}
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your prompt to race the AI models..."
                  className="flex-1 px-6 py-4 bg-black/60 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/30 transition-all text-lg font-medium"
                  disabled={isRacing || showCountdown}
                />
                <button
                  onClick={initiateRace}
                  disabled={isRacing || showCountdown || !input.trim()}
                  className={`px-8 md:px-12 py-4 rounded-xl font-black text-lg transition-all whitespace-nowrap ${
                    isRacing || showCountdown
                      ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400'
                      : 'bg-gradient-to-r from-[#ffd700] to-[#ffed4a] text-black hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:scale-105'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {isRacing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">🏎️</span> RACING...
                    </span>
                  ) : showCountdown ? (
                    <span>GET READY...</span>
                  ) : (
                    <span className="flex items-center gap-2">🚦 START RACE</span>
                  )}
                </button>
              </div>
            </div>

            {/* Race Track */}
            {showResults && (
              <RaceTrack
                isRacing={isRacing}
                results={raceData?.results || []}
                winner={raceData?.winner || null}
                modelNames={getPresetModels(selectedPreset).map(m => m.name)}
              />
            )}

            {/* Response Cards */}
            {raceData && !isRacing && (
              <div className="space-y-6">
                <ResponseCards results={raceData.results} winner={raceData.winner} />

                {/* Race Again Button */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetRace}
                    className="px-8 py-3 bg-gray-800 border-2 border-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all"
                  >
                    🔄 NEW RACE
                  </button>
                  <button
                    onClick={initiateRace}
                    disabled={!input.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-[#ffd700] to-[#ffed4a] text-black rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all disabled:opacity-50"
                  >
                    🔁 RACE AGAIN
                  </button>
                </div>
              </div>
            )}

            {/* Empty State - Pre-Race */}
            {!showResults && (
              <div className="text-center py-12 md:py-20">
                <div className="inline-block animate-bounce">
                  <div className="text-8xl md:text-9xl mb-4">🏁</div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to Race?</h2>
                <p className="text-gray-400 mb-6">
                  Select a lineup above and enter a prompt to race!
                </p>

                {/* Current Lineup Preview */}
                <div className="mb-8">
                  <div className="text-sm text-gray-500 mb-2">Current Lineup:</div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {getPresetModels(selectedPreset).map((model, index) => {
                      const colorClass = model.color === 'green' ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : model.color === 'purple' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : model.color === 'blue' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-red-500/20 border-red-500/50 text-red-400';
                      return (
                        <div
                          key={`${model.id}-${index}`}
                          className={`flex items-center gap-2 rounded-full px-4 py-2 border ${colorClass}`}
                        >
                          <span>{model.emoji}</span>
                          <span className="font-medium text-sm">{model.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Start Tips */}
                <div className="max-w-md mx-auto bg-black/30 backdrop-blur-md rounded-xl border border-gray-800 p-4">
                  <p className="text-sm text-gray-400">
                    💡 <strong className="text-white">Pro tip:</strong> Try prompts like &quot;Explain
                    quantum computing in one sentence&quot; or &quot;Write a haiku about AI&quot;
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-gray-600 text-sm">
          <p>🏆 May the fastest model win!</p>
        </footer>
      </div>

      {/* Countdown Overlay */}
      <StartCountdown isActive={showCountdown} onComplete={executeRace} />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        creditsRemaining={creditsRemaining}
      />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes slide {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(102px);
          }
        }
      `}</style>
    </div>
  );
}
