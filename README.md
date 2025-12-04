# Prompt Racer 🏁

Race 4 AI models simultaneously and see which one responds fastest! Enter a prompt and watch GPT-4o, Claude Sonnet 4.5, Gemini 2.0 Flash, and Grok 4.1 Fast compete in real-time.

## Features

- 🏎️ **Multi-Model Racing**: Run the same prompt across 4 leading AI models in parallel
- ⚡ **Real-Time Performance**: See millisecond-accurate response times
- 🏆 **Winner Detection**: Automatically identifies the fastest model
- 🎨 **Beautiful UI**: Dark theme with gold accents and racing animations
- 📊 **Race Statistics**: Compare models with medals and timing breakdowns
- 💳 **Pay-Per-Race**: No signup required, buy credits with Stripe

## Models

- **GPT-4o** (OpenAI) - Green 🟢
- **Claude Sonnet 4.5** (Anthropic) - Purple 🟣
- **Gemini 2.0 Flash** (Google) - Blue 🔵
- **Grok 4.1 Fast** (xAI) - Red 🔴

## Setup

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up your API keys:
   - Copy `.env.example` to `.env.local`
   - Add all required keys to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   XAI_API_KEY=your_xai_api_key_here

   # Stripe keys for payment processing
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   ```

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the chat interface.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Monetization

### Pricing Tiers
- **Free**: 3 races included for new users
- **Starter Pack**: $2.99 for 10 races ($0.30 per race)
- **Value Pack**: $4.99 for 25 races ($0.20 per race) - Best Value
- **24hr Unlimited**: $9.99 for unlimited races for 24 hours

### How It Works
1. Users get 3 free races to try the app (no signup required)
2. After using free races, a paywall modal appears with pricing options
3. Click "Buy Now" to purchase credits via Stripe Checkout
4. Credits are stored in a secure cookie (no user accounts needed)
5. Credits are automatically deducted after each race

## Deploy on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in the Vercel dashboard:
   - All 4 AI API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, XAI_API_KEY)
   - Stripe keys (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)
4. Deploy and enjoy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
