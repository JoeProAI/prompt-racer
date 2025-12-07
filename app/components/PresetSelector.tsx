'use client';

import { useState } from 'react';
import { RACE_PRESETS, AVAILABLE_MODELS } from '@/lib/models';

type PresetSelectorProps = {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
  disabled?: boolean;
};

export default function PresetSelector({
  selectedPreset,
  onPresetChange,
  disabled = false,
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentPreset = RACE_PRESETS.find(p => p.id === selectedPreset) || RACE_PRESETS[0];
  const presetModels = currentPreset.models.map(id => AVAILABLE_MODELS[id]).filter(Boolean);

  return (
    <div className="relative">
      {/* Selector Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-3 px-4 py-3 bg-black/60 border-2 rounded-xl transition-all w-full ${
          disabled
            ? 'border-gray-700 opacity-50 cursor-not-allowed'
            : 'border-gray-600 hover:border-[#ffd700]/50 cursor-pointer'
        }`}
      >
        <span className="text-2xl">{currentPreset.emoji}</span>
        <div className="flex-1 text-left">
          <div className="text-white font-bold">{currentPreset.name}</div>
          <div className="text-gray-400 text-xs">{currentPreset.description}</div>
        </div>
        <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Model Pills */}
      <div className="flex flex-wrap gap-2 mt-2">
        {presetModels.map((model, index) => (
          <div
            key={`${model.id}-${index}`}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              model.color === 'green'
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : model.color === 'purple'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : model.color === 'blue'
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}
          >
            <span>{model.emoji}</span>
            <span>{model.name}</span>
          </div>
        ))}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            {RACE_PRESETS.map((preset) => {
              const models = preset.models.map(id => AVAILABLE_MODELS[id]).filter(Boolean);
              const isSelected = preset.id === selectedPreset;

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onPresetChange(preset.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    isSelected
                      ? 'bg-[#ffd700]/20 border-l-4 border-[#ffd700]'
                      : 'hover:bg-gray-800 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{preset.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-bold ${isSelected ? 'text-[#ffd700]' : 'text-white'}`}>
                        {preset.name}
                      </div>
                      <div className="text-gray-400 text-xs">{preset.description}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {models.map((model, idx) => (
                          <span
                            key={`${model.id}-${idx}`}
                            className="text-[10px] px-1.5 py-0.5 bg-black/40 rounded text-gray-300"
                          >
                            {model.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isSelected && <span className="text-[#ffd700]">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
