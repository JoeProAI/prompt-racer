// Firestore helper functions for managing users, credits, purchases, and races
import { getAdminDb } from './admin';
import { FieldValue } from 'firebase-admin/firestore';

const FREE_CREDITS = 3;

export interface UserData {
  createdAt: Date;
  credits: number;
  totalRaces: number;
  totalSpent: number;
}

export interface Purchase {
  amount: number;
  credits: number;
  timestamp: Date;
  stripeSessionId?: string;
}

export interface RaceResult {
  model: string;
  responseTime: number;
  winner: boolean;
  error?: string;
}

export interface Race {
  userId: string;
  prompt: string;
  results: RaceResult[];
  timestamp: Date;
  winnerModel: string;
}

/**
 * Get user's credit balance from Firestore
 */
export async function getUserCredits(userId: string): Promise<number> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    // New user - create with free credits
    await createUser(userId);
    return FREE_CREDITS;
  }

  const userData = userDoc.data() as UserData;
  return userData.credits || 0;
}

/**
 * Create new user with initial free credits
 */
export async function createUser(userId: string): Promise<UserData> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);

  const userData: UserData = {
    createdAt: new Date(),
    credits: FREE_CREDITS,
    totalRaces: 0,
    totalSpent: 0,
  };

  await userRef.set(userData);
  return userData;
}

/**
 * Add credits to user's account (after purchase)
 */
export async function addCredits(
  userId: string,
  creditsToAdd: number,
  purchaseData?: { amount: number; stripeSessionId?: string }
): Promise<number> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);

  // Update user credits atomically
  await userRef.set(
    {
      credits: FieldValue.increment(creditsToAdd),
      totalSpent: purchaseData?.amount
        ? FieldValue.increment(purchaseData.amount)
        : FieldValue.increment(0),
    },
    { merge: true }
  );

  // Log purchase if provided
  if (purchaseData) {
    const purchase: Purchase = {
      amount: purchaseData.amount,
      credits: creditsToAdd,
      timestamp: new Date(),
      stripeSessionId: purchaseData.stripeSessionId,
    };

    await userRef.collection('purchases').add(purchase);
  }

  // Get updated credits
  const updatedDoc = await userRef.get();
  const updatedData = updatedDoc.data() as UserData;
  return updatedData.credits;
}

/**
 * Deduct one credit from user's account (after race)
 */
export async function deductCredit(userId: string): Promise<number> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);

  // Check if user has credits first
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data() as UserData;
  if (userData.credits <= 0) {
    throw new Error('Insufficient credits');
  }

  // Deduct credit and increment race count atomically
  await userRef.update({
    credits: FieldValue.increment(-1),
    totalRaces: FieldValue.increment(1),
  });

  // Get updated credits
  const updatedDoc = await userRef.get();
  const updatedData = updatedDoc.data() as UserData;
  return updatedData.credits;
}

/**
 * Log race results to Firestore for analytics
 */
export async function logRace(
  userId: string,
  prompt: string,
  results: RaceResult[],
  winnerModel: string
): Promise<void> {
  const db = getAdminDb();

  const race: Race = {
    userId,
    prompt,
    results,
    winnerModel,
    timestamp: new Date(),
  };

  await db.collection('races').add(race);
}

/**
 * Get user's purchase history
 */
export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const purchasesSnapshot = await userRef
    .collection('purchases')
    .orderBy('timestamp', 'desc')
    .get();

  return purchasesSnapshot.docs.map((doc) => doc.data() as Purchase);
}

/**
 * Get user's race history
 */
export async function getUserRaces(userId: string, limit: number = 10): Promise<Race[]> {
  const db = getAdminDb();
  const racesSnapshot = await db
    .collection('races')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return racesSnapshot.docs.map((doc) => doc.data() as Race);
}

/**
 * Get user data (for dashboard)
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data() as UserData;
}
