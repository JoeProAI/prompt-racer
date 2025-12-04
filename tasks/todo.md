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
- Grok: model ID "grok-4.1-fast" via OpenAI SDK with base URL "https://api.x.ai/v1"

**Design Principles:**
- Minimal code changes
- Simple, focused implementation
- No unnecessary abstractions
- Maintain existing dark theme with gold accents
- Ensure proper error handling for each model

---

# Monetization Implementation - Pay-Per-Race System

## ✅ Implementation Complete!

### Summary of Changes (Session 2)

**Files Created:**
- `lib/credits.ts` - Cookie-based credit tracking system
- `app/api/checkout/route.ts` - Stripe payment processing
- `app/components/PaywallModal.tsx` - Pricing tiers and purchase UI

**Files Modified:**
- `package.json` - Added Stripe SDK
- `.env.example` - Added STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY
- `app/api/race/route.ts` - Added credit checking and decrementing
- `app/page.tsx` - Added credit counter, paywall modal, and payment success handling
- `README.md` - Documented Grok 4.1 Fast and monetization system

### Key Features Implemented

✅ **Grok Model Update**
- Updated from "grok-2-latest" to "grok-4.1-fast"
- Updated all UI references from "Grok 2" to "Grok 4.1 Fast"

✅ **Credit System**
- Cookie-based tracking (no user accounts)
- 3 free races for new users
- Credits stored in httpOnly cookies
- Automatic decrement after each race
- Credit counter displayed in header

✅ **Rate Limiting**
- API checks credits before allowing race
- Returns 402 status when out of credits
- Triggers paywall modal automatically

✅ **Stripe Integration**
- Lazy initialization to avoid build errors
- Stripe Checkout for secure payments
- Three pricing tiers:
  - Starter: $2.99 for 10 races
  - Value: $4.99 for 25 races (best value)
  - Unlimited: $9.99 for 999 races (24hr unlimited)

✅ **Paywall Modal**
- Beautiful UI matching JoePro.ai theme
- Shows pricing comparison
- "BEST VALUE" badge on middle tier
- Secure payment badge with Stripe logo
- Buy More button when credits run out

✅ **Payment Flow**
1. User clicks "Buy Now" in modal
2. Redirected to Stripe Checkout
3. After payment, redirected back with success param
4. Credits automatically added via PUT request
5. URL cleaned up with history.replaceState
6. Credit counter updated in UI

### Technical Implementation

**Cookie Security:**
- httpOnly: true (prevents XSS attacks)
- sameSite: 'lax' (CSRF protection)
- maxAge: 1 year
- path: '/' (available to all routes)

**Stripe Configuration:**
- API version: '2025-11-17.clover'
- Lazy initialization pattern
- Success/cancel URLs with credit metadata
- Line items with dynamic pricing

**Error Handling:**
- Graceful degradation if API keys missing
- 402 Payment Required for no credits
- Try-catch blocks in all async functions
- Console logging for debugging

### Testing Notes

**Required for Vercel:**
1. Add STRIPE_SECRET_KEY to environment variables
2. Add STRIPE_PUBLISHABLE_KEY to environment variables
3. Redeploy after adding variables
4. Test full payment flow in production

**Local Testing:**
1. Add Stripe test keys to .env.local
2. Use Stripe test card: 4242 4242 4242 4242
3. Test all 3 pricing tiers
4. Verify credit counter updates
5. Verify paywall appears after 3 races

### Code Quality

✅ Minimal, focused changes
✅ Only touched necessary files
✅ No over-engineering
✅ Type-safe TypeScript
✅ Consistent with existing style
✅ Clean error handling
✅ Build successful with no errors

**Commits:**
- `aad8688` - "Add pay-per-race monetization with Stripe and upgrade Grok to 4.1 Fast"
- `63b2fa5` - "Update README with Grok 4.1 Fast and monetization documentation"

**Pushed to:** https://github.com/JoeProAI/prompt-racer
