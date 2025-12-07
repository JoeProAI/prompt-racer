// Model configuration for Prompt Racer

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'xai';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  apiModel: string;
  color: string;
  emoji: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
}

// All available models
export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  // OpenAI Models
  'gpt-4.1': {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    apiModel: 'gpt-4.1',
    color: 'green',
    emoji: '🟢',
    description: 'Latest GPT-4.1 model',
    speed: 'medium',
  },
  'gpt-4.1-mini': {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    apiModel: 'gpt-4.1-mini',
    color: 'green',
    emoji: '🟢',
    description: 'Fast & efficient GPT-4.1',
    speed: 'fast',
  },
  'gpt-4.1-nano': {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    apiModel: 'gpt-4.1-nano',
    color: 'green',
    emoji: '🟢',
    description: 'Fastest GPT model',
    speed: 'fast',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    apiModel: 'gpt-4o',
    color: 'green',
    emoji: '🟢',
    description: 'GPT-4 Omni multimodal',
    speed: 'medium',
  },
  'o3-mini': {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'openai',
    apiModel: 'o3-mini',
    color: 'green',
    emoji: '🟢',
    description: 'Reasoning model',
    speed: 'slow',
  },

  // Anthropic Models
  'claude-opus-4': {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    apiModel: 'claude-opus-4-20250514',
    color: 'purple',
    emoji: '🟣',
    description: 'Most powerful Claude',
    speed: 'slow',
  },
  'claude-sonnet-4': {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    apiModel: 'claude-sonnet-4-20250514',
    color: 'purple',
    emoji: '🟣',
    description: 'Balanced Claude model',
    speed: 'medium',
  },
  'claude-haiku-3.5': {
    id: 'claude-haiku-3.5',
    name: 'Claude Haiku 3.5',
    provider: 'anthropic',
    apiModel: 'claude-3-5-haiku-20241022',
    color: 'purple',
    emoji: '🟣',
    description: 'Fastest Claude model',
    speed: 'fast',
  },

  // Google Models
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    apiModel: 'gemini-2.5-pro-preview-06-05',
    color: 'blue',
    emoji: '🔵',
    description: 'Most capable Gemini',
    speed: 'medium',
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    apiModel: 'gemini-2.5-flash-preview-05-20',
    color: 'blue',
    emoji: '🔵',
    description: 'Fast Gemini model',
    speed: 'fast',
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    apiModel: 'gemini-2.0-flash',
    color: 'blue',
    emoji: '🔵',
    description: 'Stable fast Gemini',
    speed: 'fast',
  },

  // xAI Models
  'grok-3': {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    apiModel: 'grok-3',
    color: 'red',
    emoji: '🔴',
    description: 'Latest Grok model',
    speed: 'medium',
  },
  'grok-3-fast': {
    id: 'grok-3-fast',
    name: 'Grok 3 Fast',
    provider: 'xai',
    apiModel: 'grok-3-fast',
    color: 'red',
    emoji: '🔴',
    description: 'Fast Grok variant',
    speed: 'fast',
  },
};

// Race presets - predefined model combinations
export interface RacePreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  models: string[]; // Model IDs
}

export const RACE_PRESETS: RacePreset[] = [
  {
    id: 'speed-demons',
    name: 'Speed Demons',
    description: 'Fastest models from each provider',
    emoji: '⚡',
    models: ['gpt-4.1-mini', 'claude-haiku-3.5', 'gemini-2.5-flash', 'grok-3-fast'],
  },
  {
    id: 'flagship-battle',
    name: 'Flagship Battle',
    description: 'Top-tier models head-to-head',
    emoji: '👑',
    models: ['gpt-4.1', 'claude-opus-4', 'gemini-2.5-pro', 'grok-3'],
  },
  {
    id: 'balanced-mix',
    name: 'Balanced Mix',
    description: 'Best balance of speed & quality',
    emoji: '⚖️',
    models: ['gpt-4o', 'claude-sonnet-4', 'gemini-2.5-flash', 'grok-3'],
  },
  {
    id: 'claude-showdown',
    name: 'Claude Showdown',
    description: 'All Claude models compete',
    emoji: '🟣',
    models: ['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-3.5', 'claude-haiku-3.5'],
  },
  {
    id: 'openai-arena',
    name: 'OpenAI Arena',
    description: 'GPT models face off',
    emoji: '🟢',
    models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'o3-mini'],
  },
  {
    id: 'classic',
    name: 'Classic Race',
    description: 'Original lineup',
    emoji: '🏁',
    models: ['gpt-4o', 'claude-sonnet-4', 'gemini-2.0-flash', 'grok-3-fast'],
  },
];

// Default preset
export const DEFAULT_PRESET = 'speed-demons';

// Get models for a preset
export function getPresetModels(presetId: string): ModelConfig[] {
  const preset = RACE_PRESETS.find(p => p.id === presetId) || RACE_PRESETS[0];
  return preset.models.map(id => AVAILABLE_MODELS[id]).filter(Boolean);
}
