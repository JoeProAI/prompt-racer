import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const grokClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

type ModelResult = {
  model: string;
  content: string;
  responseTime: number;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Race all 4 models in parallel with timing
    const raceResults = await Promise.allSettled([
      // GPT-4o
      (async () => {
        const startTime = Date.now();
        try {
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

      // Grok 2
      (async () => {
        const startTime = Date.now();
        try {
          const completion = await grokClient.chat.completions.create({
            model: 'grok-2-latest',
            messages: [{ role: 'user', content: message }],
          });
          const responseTime = Date.now() - startTime;
          return {
            model: 'Grok 2',
            content: completion.choices[0]?.message?.content || 'No response',
            responseTime,
          };
        } catch (error) {
          return {
            model: 'Grok 2',
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
        const models = ['GPT-4o', 'Claude Sonnet 4.5', 'Gemini 2.0 Flash', 'Grok 2'];
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

    return NextResponse.json({
      results,
      winner,
      totalTime: Math.max(...results.map(r => r.responseTime)),
    });
  } catch (error) {
    console.error('Error in race:', error);
    return NextResponse.json(
      { error: 'Failed to complete race' },
      { status: 500 }
    );
  }
}
