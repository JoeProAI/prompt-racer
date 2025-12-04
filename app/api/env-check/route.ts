import { NextResponse } from 'next/server';

export async function GET() {
  const envStatus = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
    XAI_API_KEY: !!process.env.XAI_API_KEY,
  };

  return NextResponse.json(envStatus);
}
