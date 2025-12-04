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

## ✅ Implementation Complete!

### Summary of Changes

**Files Created:**
- `app/api/race/route.ts` - New racing API endpoint that calls all 4 models in parallel with precise timing

**Files Modified:**
- `package.json` - Added @anthropic-ai/sdk and @google/generative-ai dependencies
- `.env.example` - Added 4 API keys (OPENAI, ANTHROPIC, GOOGLE, XAI)
- `app/page.tsx` - Completely transformed from single chat to 4-model racing grid
- `app/layout.tsx` - Updated metadata for racing feature
- `README.md` - Added racing feature documentation and setup instructions

### Key Features Implemented

✅ **Multi-Model Racing**
- GPT-4o (OpenAI) - Green borders
- Claude Sonnet 4.5 (Anthropic) - Purple borders
- Gemini 2.0 Flash (Google) - Blue borders
- Grok 2 (xAI) - Red borders

✅ **Racing UI**
- 2x2 grid layout for 4 models
- Real-time loading animations (🏎️ race cars, pulsing borders)
- Winner badge (🏆) with bouncing animation
- Millisecond-accurate response timers
- Victory glow effect on winner card

✅ **Race Statistics**
- Finish order with medals (🥇🥈🥉)
- Response times for each model
- Automatic winner detection

✅ **Design**
- Maintained JoePro.ai dark theme
- Gold accents (#ffd700) throughout
- Glassmorphism effects
- "START RACE" button with animations

### Technical Implementation

**Backend:**
- Used Promise.allSettled for parallel execution
- Individual try-catch per model for error isolation
- Precise millisecond timing with Date.now()
- Proper error handling with fallback states

**Frontend:**
- React state management for race lifecycle
- Conditional rendering based on race state
- Color-coded model cards
- Responsive grid layout

### Testing Notes

**Required for Vercel:**
1. Add environment variables in Vercel dashboard:
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY
   - GOOGLE_API_KEY
   - XAI_API_KEY
2. Redeploy after adding variables

### Code Quality

✅ Simple, minimal changes
✅ Only touched necessary files
✅ No over-engineering or abstractions
✅ Clean error handling
✅ Type-safe TypeScript throughout
✅ Consistent with existing code style

**Commit:** `b8ba30f` - "Add multi-model racing feature"
**Pushed to:** https://github.com/JoeProAI/prompt-racer

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
