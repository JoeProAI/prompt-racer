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
    // New user, give them free races
    return {
      remaining: FREE_RACES,
      hasCredits: true,
      isFree: true,
    };
  }

  const remaining = parseInt(creditCookie.value, 10);

  return {
    remaining: isNaN(remaining) ? 0 : remaining,
    hasCredits: remaining > 0,
    isFree: remaining <= FREE_RACES,
  };
}

export async function decrementCredits(): Promise<CreditStatus> {
  const cookieStore = await cookies();
  const creditCookie = cookieStore.get(COOKIE_NAME);

  let remaining = FREE_RACES;

  if (creditCookie) {
    remaining = parseInt(creditCookie.value, 10);
    if (isNaN(remaining)) remaining = FREE_RACES;
  }

  if (remaining > 0) {
    remaining -= 1;
  }

  cookieStore.set(COOKIE_NAME, remaining.toString(), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

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
