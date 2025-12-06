import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserCredits, deductCredit, logRace } from '@/lib/firebase/firestore';
import { checkAndDecrementCredits } from '@/lib/credits';

// Initialize AI clients lazily with error handling
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function getGrokClient() {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY not configured');
  }
  return new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
}

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getGoogleAI() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY not configured');
  }
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
}

type ModelResult = {
  model: string;
  content: string;
  responseTime: number;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use Firestore if userId provided, otherwise fall back to cookies
    let creditsRemaining = 0;
    let useFirestore = !!userId;

    if (useFirestore) {
      // Check Firestore credits
      try {
        const credits = await getUserCredits(userId);
        if (credits <= 0) {
          console.log('[RACE] ❌ Race blocked - no Firestore credits');
          return NextResponse.json(
            { error: 'No credits remaining', needsPayment: true },
            { status: 402 }
          );
        }
        console.log('[RACE] ✅ Race allowed - Firestore credits:', credits);
      } catch (error) {
        console.error('[RACE] Firestore error, falling back to cookies:', error);
        useFirestore = false;
      }
    }

    if (!useFirestore) {
      // Fall back to cookie-based system
      const creditCheck = await checkAndDecrementCredits();
      if (!creditCheck.allowed) {
        console.log('[RACE] ❌ Race blocked - no cookie credits');
        return NextResponse.json(
          { error: 'No credits remaining', needsPayment: true },
          { status: 402 }
        );
      }
      creditsRemaining = creditCheck.credits.remaining;
      console.log('[RACE] ✅ Race allowed - cookie credits:', creditsRemaining);
    }

    // Race all 4 models in parallel with timing
    const raceResults = await Promise.allSettled([
      // GPT-4o
      (async () => {
        const startTime = Date.now();
        try {
          const openai = getOpenAI();
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: message }],
          });
          const responseTime = Date.now() - startTime;
          return {
            model: 'GPT-4o',
            content: completion.choices[0]?.message?.content || 'No response',
            responseTime,
          };
        } catch (error) {
          return {
            model: 'GPT-4o',
            content: '',
            responseTime: Date.now() - startTime,
            error: 'Failed to get response',
          };
        }
      })(),

      // Claude Sonnet 4.5
      (async () => {
        const startTime = Date.now();
        try {
          const anthropic = getAnthropic();
          const message_response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1024,
            messages: [{ role: 'user', content: message }],
          });
          const responseTime = Date.now() - startTime;
          const content = message_response.content[0];
          return {
            model: 'Claude Sonnet 4.5',
            content: content.type === 'text' ? content.text : 'No response',
            responseTime,
          };
        } catch (error) {
          return {
            model: 'Claude Sonnet 4.5',
            content: '',
            responseTime: Date.now() - startTime,
            error: 'Failed to get response',
          };
        }
      })(),

      // Gemini 2.0 Flash
      (async () => {
        const startTime = Date.now();
        try {
          const genAI = getGoogleAI();
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
          const result = await model.generateContent(message);
          const responseTime = Date.now() - startTime;
          return {
            model: 'Gemini 2.0 Flash',
            content: result.response.text() || 'No response',
            responseTime,
          };
        } catch (error) {
          return {
            model: 'Gemini 2.0 Flash',
            content: '',
            responseTime: Date.now() - startTime,
            error: 'Failed to get response',
          };
        }
      })(),

      // Grok 4.1 Fast
      (async () => {
        const startTime = Date.now();
        try {
          const grokClient = getGrokClient();
          const completion = await grokClient.chat.completions.create({
            model: 'grok-4-1-fast-non-reasoning',
            messages: [{ role: 'user', content: message }],
          });
          const responseTime = Date.now() - startTime;
          return {
            model: 'Grok 4.1 Fast',
            content: completion.choices[0]?.message?.content || 'No response',
            responseTime,
          };
        } catch (error) {
          return {
            model: 'Grok 4.1 Fast',
            content: '',
            responseTime: Date.now() - startTime,
            error: 'Failed to get response',
          };
        }
      })(),
    ]);

    // Process results
    const results: ModelResult[] = raceResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const models = ['GPT-4o', 'Claude Sonnet 4.5', 'Gemini 2.0 Flash', 'Grok 4.1 Fast'];
        return {
          model: models[index],
          content: '',
          responseTime: 0,
          error: 'Request failed',
        };
      }
    });

    // Find winner (fastest response without error)
    const validResults = results.filter(r => !r.error && r.content);
    const winner = validResults.length > 0
      ? validResults.reduce((prev, current) =>
          prev.responseTime < current.responseTime ? prev : current
        ).model
      : null;

    // Deduct credit and log race
    if (useFirestore && userId) {
      try {
        // Deduct credit from Firestore
        creditsRemaining = await deductCredit(userId);

        // Log race results for analytics
        await logRace(
          userId,
          message,
          results.map(r => ({
            model: r.model,
            responseTime: r.responseTime,
            winner: r.model === winner,
            error: r.error,
          })),
          winner || 'none'
        );
      } catch (error) {
        console.error('[RACE] Error deducting credit or logging race:', error);
      }
    }

    return NextResponse.json({
      results,
      winner,
      totalTime: Math.max(...results.map(r => r.responseTime)),
      creditsRemaining,
    });
  } catch (error) {
    console.error('Error in race:', error);
    return NextResponse.json(
      { error: 'Failed to complete race' },
      { status: 500 }
    );
  }
}
