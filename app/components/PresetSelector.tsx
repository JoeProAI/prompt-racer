'use client';

import { useState } from 'react';
import { RACE_PRESETS, AVAILABLE_MODELS, ModelConfig } from '@/lib/models';

type PresetSelectorProps = {
  selectedPreset: string;
  customModels: string[];
  onPresetChange: (presetId: string) => void;
  onCustomModelsChange: (modelIds: string[]) => void;
  disabled?: boolean;
};

const MAX_CUSTOM_MODELS = 4;

// Group models by provider
const modelsByProvider = Object.values(AVAILABLE_MODELS).reduce((acc, model) => {
  if (!acc[model.provider]) acc[model.provider] = [];
  acc[model.provider].push(model);
  return acc;
}, {} as Record<string, ModelConfig[]>);

const providerLabels: Record<string, { name: string; color: string }> = {
  openai: { name: 'OpenAI', color: 'green' },
  anthropic: { name: 'Anthropic', color: 'purple' },
  google: { name: 'Google', color: 'blue' },
  xai: { name: 'xAI', color: 'red' },
};

export default function PresetSelector({
  selectedPreset,
  customModels,
  onPresetChange,
  onCustomModelsChange,
  disabled = false,
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'preset' | 'custom'>(selectedPreset === 'custom' ? 'custom' : 'preset');

  const isCustomMode = mode === 'custom';
  const currentPreset = RACE_PRESETS.find(p => p.id === selectedPreset) || RACE_PRESETS[0];
  
  // Get display models based on mode
  const displayModels = isCustomMode
    ? customModels.map(id => AVAILABLE_MODELS[id]).filter(Boolean)
    : currentPreset.models.map(id => AVAILABLE_MODELS[id]).filter(Boolean);

  const toggleCustomModel = (modelId: string) => {
    if (customModels.includes(modelId)) {
      onCustomModelsChange(customModels.filter(id => id !== modelId));
    } else if (customModels.length < MAX_CUSTOM_MODELS) {
      onCustomModelsChange([...customModels, modelId]);
    }
  };

  const handleModeChange = (newMode: 'preset' | 'custom') => {
    setMode(newMode);
    if (newMode === 'custom') {
      onPresetChange('custom');
    } else if (selectedPreset === 'custom') {
      onPresetChange(RACE_PRESETS[0].id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange('preset')}
          disabled={disabled}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            !isCustomMode
              ? 'bg-[#ffd700] text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          🎯 Presets
        </button>
        <button
          onClick={() => handleModeChange('custom')}
          disabled={disabled}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            isCustomMode
              ? 'bg-[#ffd700] text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          ✨ Custom
        </button>
      </div>

      {/* Preset Mode */}
      {!isCustomMode && (
        <div className="relative">
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

          {/* Dropdown */}
          {isOpen && !disabled && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
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
      )}

      {/* Custom Mode - Model Grid */}
      {isCustomMode && (
        <div className="bg-black/40 rounded-xl border border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Select up to {MAX_CUSTOM_MODELS} models
            </span>
            <span className={`text-sm font-bold ${
              customModels.length === MAX_CUSTOM_MODELS ? 'text-[#ffd700]' : 'text-gray-500'
            }`}>
              {customModels.length}/{MAX_CUSTOM_MODELS}
            </span>
          </div>

          {/* Model Grid by Provider */}
          <div className="space-y-3">
            {Object.entries(modelsByProvider).map(([provider, models]) => {
              const { name, color } = providerLabels[provider] || { name: provider, color: 'gray' };
              return (
                <div key={provider}>
                  <div className={`text-xs font-medium mb-2 ${
                    color === 'green' ? 'text-green-400' :
                    color === 'purple' ? 'text-purple-400' :
                    color === 'blue' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {models.map((model) => {
                      const isSelected = customModels.includes(model.id);
                      const canSelect = isSelected || customModels.length < MAX_CUSTOM_MODELS;
                      
                      return (
                        <button
                          key={model.id}
                          onClick={() => !disabled && canSelect && toggleCustomModel(model.id)}
                          disabled={disabled || (!isSelected && !canSelect)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? color === 'green' ? 'bg-green-500/30 border-green-500 text-green-300' :
                                color === 'purple' ? 'bg-purple-500/30 border-purple-500 text-purple-300' :
                                color === 'blue' ? 'bg-blue-500/30 border-blue-500 text-blue-300' :
                                'bg-red-500/30 border-red-500 text-red-300'
                              : canSelect
                                ? 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                                : 'bg-gray-800/20 border-gray-700 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          <span>{model.emoji}</span>
                          <span>{model.name}</span>
                          {isSelected && <span className="ml-1">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {customModels.length < 2 && (
            <div className="text-xs text-yellow-500/80 text-center py-2">
              ⚠️ Select at least 2 models to race
            </div>
          )}
        </div>
      )}

      {/* Selected Models Display */}
      <div className="flex flex-wrap gap-2">
        {displayModels.map((model, index) => (
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
            {isCustomMode && (
              <button
                onClick={() => toggleCustomModel(model.id)}
                className="ml-1 hover:text-white"
                disabled={disabled}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
