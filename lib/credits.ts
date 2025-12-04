// Cookie-based credit tracking system
// No user accounts, just simple encrypted cookies

import { cookies } from 'next/headers';

const COOKIE_NAME = 'pr_credits';
const FREE_RACES = 3;

export type CreditStatus = {
  remaining: number;
  hasCredits: boolean;
  isFree: boolean;
};

export async function getCredits(): Promise<CreditStatus> {
  const cookieStore = await cookies();
  const creditCookie = cookieStore.get(COOKIE_NAME);

  if (!creditCookie) {
    // New user, return free races (cookie will be set on first decrement)
    console.log('[CREDITS] getCredits: No cookie, returning FREE_RACES:', FREE_RACES);
    return {
      remaining: FREE_RACES,
      hasCredits: true,
      isFree: true,
    };
  }

  const remaining = parseInt(creditCookie.value, 10);
  const actualRemaining = isNaN(remaining) ? 0 : remaining;
  console.log('[CREDITS] getCredits: Cookie value:', creditCookie.value, '| Parsed:', actualRemaining);

  return {
    remaining: actualRemaining,
    hasCredits: actualRemaining > 0,
    isFree: actualRemaining <= FREE_RACES,
  };
}

export async function checkAndDecrementCredits(): Promise<{
  allowed: boolean;
  credits: CreditStatus;
}> {
  const cookieStore = await cookies();
  const creditCookie = cookieStore.get(COOKIE_NAME);

  console.log('[CREDITS] Raw cookie:', creditCookie ? creditCookie.value : 'null');

  // Get current value - if no cookie exists, this is the FIRST race
  let current: number;

  if (!creditCookie) {
    // First time user - they have FREE_RACES available
    current = FREE_RACES;
    console.log('[CREDITS] First time user, starting with:', current);
  } else {
    current = parseInt(creditCookie.value, 10);
    if (isNaN(current)) {
      current = FREE_RACES;
      console.log('[CREDITS] Invalid cookie, resetting to:', current);
    } else {
      console.log('[CREDITS] Current credits from cookie:', current);
    }
  }

  // CRITICAL: Check BEFORE decrementing - if 0, block immediately
  if (current <= 0) {
    console.log('[CREDITS] ❌ BLOCKED - No credits remaining');
    return {
      allowed: false,
      credits: {
        remaining: 0,
        hasCredits: false,
        isFree: false,
      },
    };
  }

  // User has credits - allow and decrement
  const remaining = current - 1;
  console.log('[CREDITS] ✅ ALLOWED - Decrementing from', current, 'to', remaining);

  cookieStore.set(COOKIE_NAME, remaining.toString(), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  console.log('[CREDITS] Cookie saved:', remaining);

  return {
    allowed: true,
    credits: {
      remaining,
      hasCredits: remaining > 0,
      isFree: remaining <= FREE_RACES,
    },
  };
}

// Legacy function for backward compatibility
export async function decrementCredits(): Promise<CreditStatus> {
  const result = await checkAndDecrementCredits();
  return result.credits;
}

export async function addCredits(amount: number): Promise<CreditStatus> {
  const cookieStore = await cookies();
  const creditCookie = cookieStore.get(COOKIE_NAME);

  let current = 0;

  if (creditCookie) {
    current = parseInt(creditCookie.value, 10);
    if (isNaN(current)) current = 0;
  }

  const newTotal = current + amount;

  cookieStore.set(COOKIE_NAME, newTotal.toString(), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  return {
    remaining: newTotal,
    hasCredits: newTotal > 0,
    isFree: false,
  };
}
