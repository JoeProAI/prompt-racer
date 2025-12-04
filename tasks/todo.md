# Prompt Racer - Multi-Model Racing Feature

## Overview
Add support for racing 4 AI models simultaneously: GPT-4o, Claude Sonnet 4.5, Gemini 2.0 Flash, and Grok 2.

## Plan

### 1. Install Required Dependencies
- [ ] Install @anthropic-ai/sdk for Claude integration
- [ ] Install @google/generative-ai for Gemini integration
- [ ] Verify openai SDK is already installed (for both GPT-4o and Grok)

### 2. Update Environment Configuration
- [ ] Update .env.example to include all 4 API keys:
  - OPENAI_API_KEY (existing, for GPT-4o)
  - ANTHROPIC_API_KEY (new, for Claude)
  - GOOGLE_API_KEY (new, for Gemini)
  - XAI_API_KEY (new, for Grok)

### 3. Create New API Route for Racing
- [ ] Create app/api/race/route.ts
- [ ] Implement parallel calls to all 4 models with timestamp tracking:
  - GPT-4o using existing OpenAI SDK
  - Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
  - Gemini 2.0 Flash (gemini-2.0-flash-exp)
  - Grok 2 (grok-2-latest via https://api.x.ai/v1)
- [ ] Track start/end time for each model to measure speed
- [ ] Return responses as they complete (Promise.allSettled for race dynamics)
- [ ] Return all responses with model metadata (name, response time in ms, content, finish order)
- [ ] Handle errors gracefully for each model (show error state in race)

### 4. Update Frontend UI (app/page.tsx)
- [ ] Replace single chat interface with 4-model racing grid
- [ ] Create grid layout (2x2) for 4 model response cards
- [ ] Each card should display:
  - Model name with racing flag emoji 🏁
  - Animated racing/loading state (pulsing borders, racing effects)
  - Response content that streams in
  - **Response time timer in milliseconds**
  - **Winner badge (🏆) for first to finish**
  - Speed indicator/streak effect while responding
- [ ] Add racing visual effects:
  - Pulsing gold borders while racing
  - Victory glow effect for winner
  - Checkered flag animations
  - Race timer at top showing elapsed time
- [ ] Maintain JoePro.ai dark theme with gold accents (#ffd700)
- [ ] Keep glassmorphism effects and dark backgrounds
- [ ] Update input section to trigger race with "START RACE" button
- [ ] Add race stats summary (who won, times for each model)

### 5. Update Metadata
- [ ] Update app/layout.tsx metadata (title, description)

### 6. Git Operations
- [ ] Stage all changes
- [ ] Commit with message: "Add multi-model racing feature"
- [ ] Push to GitHub

### 7. Review Section
*To be completed after implementation*

## Technical Notes

**Model Specifications:**
- GPT-4o: model ID "gpt-4o" via OpenAI SDK
- Claude: model ID "claude-sonnet-4-5-20250929" via Anthropic SDK
- Gemini: model ID "gemini-2.0-flash-exp" via Google Generative AI SDK
- Grok: model ID "grok-2-latest" via OpenAI SDK with base URL "https://api.x.ai/v1"

**Design Principles:**
- Minimal code changes
- Simple, focused implementation
- No unnecessary abstractions
- Maintain existing dark theme with gold accents
- Ensure proper error handling for each model
