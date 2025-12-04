# Prompt Racer 🏁

Race 4 AI models simultaneously and see which one responds fastest! Enter a prompt and watch GPT-4o, Claude Sonnet 4.5, Gemini 2.0 Flash, and Grok 2 compete in real-time.

## Features

- 🏎️ **Multi-Model Racing**: Run the same prompt across 4 leading AI models in parallel
- ⚡ **Real-Time Performance**: See millisecond-accurate response times
- 🏆 **Winner Detection**: Automatically identifies the fastest model
- 🎨 **Beautiful UI**: Dark theme with gold accents and racing animations
- 📊 **Race Statistics**: Compare models with medals and timing breakdowns

## Models

- **GPT-4o** (OpenAI) - Green 🟢
- **Claude Sonnet 4.5** (Anthropic) - Purple 🟣
- **Gemini 2.0 Flash** (Google) - Blue 🔵
- **Grok 2** (xAI) - Red 🔴

## Setup

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up your API keys:
   - Copy `.env.example` to `.env.local`
   - Add all 4 API keys to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   XAI_API_KEY=your_xai_api_key_here
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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
