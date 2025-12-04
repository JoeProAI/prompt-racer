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
    // New user, give them free races and set the cookie
    console.log('[CREDITS] No cookie found, initializing with FREE_RACES:', FREE_RACES);
    cookieStore.set(COOKIE_NAME, FREE_RACES.toString(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
    return {
      remaining: FREE_RACES,
      hasCredits: true,
      isFree: true,
    };
  }

  const remaining = parseInt(creditCookie.value, 10);
  console.log('[CREDITS] Cookie value:', creditCookie.value, '| Parsed:', remaining);

  return {
    remaining: isNaN(remaining) ? 0 : remaining,
    hasCredits: remaining > 0,
    isFree: remaining <= FREE_RACES,
  };
}

export async function decrementCredits(): Promise<CreditStatus> {
  const cookieStore = await cookies();
  const creditCookie = cookieStore.get(COOKIE_NAME);

  let current = FREE_RACES;

  if (creditCookie) {
    current = parseInt(creditCookie.value, 10);
    if (isNaN(current)) current = FREE_RACES;
  }

  console.log('[CREDITS] Before decrement:', current);

  // Decrement ONLY if there are credits
  if (current <= 0) {
    console.log('[CREDITS] No credits remaining, blocking');
    return {
      remaining: 0,
      hasCredits: false,
      isFree: false,
    };
  }

  const remaining = current - 1;

  console.log('[CREDITS] After decrement:', remaining);

  cookieStore.set(COOKIE_NAME, remaining.toString(), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  console.log('[CREDITS] Cookie set to:', remaining);

  return {
    remaining,
    hasCredits: remaining > 0,
    isFree: remaining < FREE_RACES,
  };
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
