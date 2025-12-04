'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${data.error}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to send message. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl bg-black/40 backdrop-blur-md rounded-lg border border-gray-800 shadow-[0_0_30px_rgba(255,215,0,0.15)] flex flex-col h-[700px]">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-3xl font-bold text-[#ffd700]" style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.6)' }}>
            Prompt Racer
          </h1>
          <p className="text-gray-400 text-sm mt-1">Powered by GPT-4o</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-lg">Send a message to start racing prompts</p>
              <p className="text-sm mt-2 text-gray-600">Your AI-powered conversation starts here</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-[#ffd700]/10 border border-[#ffd700]/30 text-white'
                    : 'bg-gray-900/50 border border-gray-800 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <p className="text-[#ffd700] animate-pulse">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#ffd700]/50 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-8 py-3 bg-[#ffd700]/20 border border-[#ffd700]/50 text-[#ffd700] rounded-lg hover:bg-[#ffd700]/30 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
            >
              Send →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
