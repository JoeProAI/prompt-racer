import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserCredits, deductCredit, logRace } from '@/lib/firebase/firestore';
import { checkAndDecrementCredits } from '@/lib/credits';
import { getPresetModels, DEFAULT_PRESET, ModelConfig } from '@/lib/models';

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
  modelId: string;
  content: string;
  responseTime: number;
  error?: string;
};

// Run a single model
async function runModel(config: ModelConfig, message: string): Promise<ModelResult> {
  const startTime = Date.now();
  
  try {
    let content = '';
    
    switch (config.provider) {
      case 'openai': {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: config.apiModel,
          messages: [{ role: 'user', content: message }],
        });
        content = completion.choices[0]?.message?.content || 'No response';
        break;
      }
      
      case 'anthropic': {
        const anthropic = getAnthropic();
        const response = await anthropic.messages.create({
          model: config.apiModel,
          max_tokens: 1024,
          messages: [{ role: 'user', content: message }],
        });
        const textBlock = response.content[0];
        content = textBlock.type === 'text' ? textBlock.text : 'No response';
        break;
      }
      
      case 'google': {
        const genAI = getGoogleAI();
        const model = genAI.getGenerativeModel({ model: config.apiModel });
        const result = await model.generateContent(message);
        content = result.response.text() || 'No response';
        break;
      }
      
      case 'xai': {
        const grokClient = getGrokClient();
        const completion = await grokClient.chat.completions.create({
          model: config.apiModel,
          messages: [{ role: 'user', content: message }],
        });
        content = completion.choices[0]?.message?.content || 'No response';
        break;
      }
    }
    
    return {
      model: config.name,
      modelId: config.id,
      content,
      responseTime: Date.now() - startTime,
    };
  } catch (err) {
    console.error(`[RACE] ${config.name} error:`, err);
    return {
      model: config.name,
      modelId: config.id,
      content: '',
      responseTime: Date.now() - startTime,
      error: 'Failed to get response',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId, preset = DEFAULT_PRESET } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get models for the selected preset
    const models = getPresetModels(preset);
    if (models.length === 0) {
      return NextResponse.json(
        { error: 'Invalid preset or no models configured' },
        { status: 400 }
      );
    }

    console.log(`[RACE] Starting race with preset: ${preset}, models: ${models.map(m => m.name).join(', ')}`);

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

    // Race all models in parallel
    const results = await Promise.all(
      models.map(model => runModel(model, message))
    );

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
      preset,
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
