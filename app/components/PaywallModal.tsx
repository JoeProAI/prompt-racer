'use client';

import { useAuth } from '@/lib/firebase/AuthContext';

type PaywallModalProps = {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number;
};

export default function PaywallModal({ isOpen, onClose, creditsRemaining }: PaywallModalProps) {
  const { user } = useAuth();

  const handlePurchase = async (tier: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          userId: user?.uid, // Include Firebase user ID if available
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: '$2.99',
      credits: 10,
      perRace: '$0.30',
    },
    {
      id: 'value',
      name: 'Value Pack',
      price: '$4.99',
      credits: 25,
      perRace: '$0.20',
      badge: 'BEST VALUE',
    },
    {
      id: 'unlimited',
      name: '24hr Unlimited',
      price: '$9.99',
      credits: 999,
      perRace: 'Unlimited',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border-2 border-[#ffd700]/50 rounded-lg shadow-[0_0_40px_rgba(255,215,0,0.4)] max-w-3xl w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-[#ffd700] mb-2" style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}>
            🏁 Out of Races!
          </h2>
          <p className="text-gray-400 text-lg">
            You have {creditsRemaining} races remaining. Buy more to keep racing!
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="relative bg-black/40 border-2 border-gray-800 rounded-lg p-6 hover:border-[#ffd700]/50 transition-all"
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffd700] text-black px-3 py-1 rounded-full text-xs font-bold">
                  {tier.badge}
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-[#ffd700] mb-1">{tier.price}</div>
                <p className="text-gray-400 text-sm">{tier.credits} races</p>
                <p className="text-gray-500 text-xs mt-1">{tier.perRace} per race</p>
              </div>

              <button
                onClick={() => handlePurchase(tier.id)}
                className="w-full bg-[#ffd700]/20 border-2 border-[#ffd700]/50 text-[#ffd700] py-3 rounded-lg font-bold hover:bg-[#ffd700]/30 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>💳 Secure payment powered by Stripe</p>
          <p className="mt-1">🔒 No signup required • Credits stored in cookies</p>
        </div>
      </div>
    </div>
  );
}
