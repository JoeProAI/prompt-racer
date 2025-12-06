# Firebase Setup Instructions for Prompt Racer

## Overview

Prompt Racer now supports Firebase Firestore and Anonymous Authentication for persistent credit tracking across devices. This guide will walk you through setting up Firebase for the project.

## Prerequisites

- Firebase account (https://firebase.google.com)
- Firebase CLI installed: `npm install -g firebase-tools`
- Access to your Firebase project console

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or use existing project
3. **Recommended**: Create new project named "prompt-racer"
4. **Optional**: Enable Google Analytics
5. Click "Create project"

---

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (we'll deploy custom security rules)
4. Select database location (recommended: `us-central1`)
5. Click "Enable"

---

## Step 3: Enable Anonymous Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started" (if first time)
3. Go to "Sign-in method" tab
4. Click on "Anonymous"
5. Toggle "Enable"
6. Click "Save"

---

## Step 4: Get Firebase Client Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register app with nickname: "Prompt Racer Web"
5. **DO NOT** check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the `firebaseConfig` object

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "prompt-racer-xxxxx.firebaseapp.com",
  projectId: "prompt-racer-xxxxx",
  storageBucket: "prompt-racer-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

---

## Step 5: Create Firebase Service Account

1. In Firebase Console, go to **Project Settings**
2. Go to **Service accounts** tab
3. Click "Generate new private key"
4. Click "Generate key" in confirmation dialog
5. **IMPORTANT**: Save the downloaded JSON file securely
6. **NEVER commit this file to Git**

---

## Step 6: Configure Environment Variables

### For Local Development (.env.local)

Create or update `.env.local` with:

```bash
# Existing API keys...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
XAI_API_KEY=xai-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase Client Config (safe to expose in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prompt-racer-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-racer-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prompt-racer-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx

# Firebase Admin SDK (server-side only, PRIVATE)
FIREBASE_PROJECT_ID=prompt-racer-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@prompt-racer-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**How to get Firebase Admin credentials from service account JSON:**

From the downloaded service account JSON file:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n` characters)

---

## Step 7: Deploy Firestore Security Rules

```bash
# Login to Firebase CLI
firebase login

# Select your Firebase project
firebase use prompt-racer-xxxxx

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

---

## Step 8: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `prompt-racer` project
3. Go to **Settings** → **Environment Variables**
4. Add all Firebase environment variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your API key | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your auth domain | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your project ID | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your storage bucket | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID | Production, Preview, Development |
| `FIREBASE_PROJECT_ID` | Your project ID | Production, Preview, Development |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Production, Preview, Development |
| `FIREBASE_PRIVATE_KEY` | Private key (with \n) | Production, Preview, Development |

5. Click "Save" after each variable
6. Redeploy your project for changes to take effect

---

## Step 9: Test Firebase Integration

### Local Testing

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

**Test Checklist:**
- [ ] Page loads without errors
- [ ] Credit counter shows "3 races remaining" for new users
- [ ] Can submit a race (credits decrease to 2)
- [ ] Can purchase credits via Stripe
- [ ] Credits persist after page refresh
- [ ] Open browser console and check for Firebase auth user ID

### Production Testing

After deploying to Vercel:

1. Visit your production URL
2. Open browser DevTools → Console
3. Look for successful Firebase anonymous sign-in
4. Submit a race
5. Check Firestore Console:
   - Go to Firebase Console → Firestore Database
   - Verify `users/{uid}` document created
   - Verify `races/{raceId}` document created with race results

---

## Firestore Data Structure

### Users Collection

```typescript
users/{userId}
  - createdAt: timestamp
  - credits: number (starts at 3)
  - totalRaces: number
  - totalSpent: number (in dollars)
```

### Purchases Subcollection

```typescript
users/{userId}/purchases/{purchaseId}
  - amount: number (dollars spent)
  - credits: number (credits purchased)
  - timestamp: timestamp
  - stripeSessionId: string
```

### Races Collection

```typescript
races/{raceId}
  - userId: string
  - prompt: string
  - results: array of {model, responseTime, winner, error}
  - winnerModel: string
  - timestamp: timestamp
```

---

## Security Rules Explained

The deployed `firestore.rules` file ensures:

1. **Users can only read their own data** - prevents credit snooping
2. **All writes happen server-side** - prevents credit manipulation
3. **Users cannot modify their own credits** - only server (Admin SDK) can
4. **Purchase and race history is private** - only accessible to the user

---

## Troubleshooting

### Build Errors

**Error**: `Firebase config not found`
- **Solution**: Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set

**Error**: `Firebase Admin SDK error`
- **Solution**: Check `FIREBASE_PRIVATE_KEY` is correctly formatted with `\n` characters

### Runtime Errors

**Error**: `Anonymous sign-in failed`
- **Solution**: Ensure Anonymous Authentication is enabled in Firebase Console

**Error**: `Permission denied` in Firestore
- **Solution**: Deploy security rules with `firebase deploy --only firestore:rules`

**Error**: `Credits not updating`
- **Solution**: Check browser console for Firestore errors, verify user is signed in

### Cookie Fallback

If Firebase is not configured, the app will automatically fall back to the cookie-based credit system. This ensures the app continues to work even without Firebase.

---

## Migration Notes

### Existing Users (Cookie-based)

When Firebase is deployed:
- Existing users with cookie-based credits will continue to work
- Once they make a purchase with Firebase enabled, their credits will migrate to Firestore
- The app supports **both systems simultaneously** for smooth migration

### Disable Firebase (Fallback to Cookies)

To temporarily disable Firebase and use cookies only:

1. Remove Firebase environment variables from Vercel
2. Redeploy
3. App will automatically fall back to cookie-based credits

---

## Cost Considerations

### Firebase Free Tier (Spark Plan)

- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Authentication**: Unlimited
- **Storage**: 1GB

**Estimated usage for Prompt Racer:**
- ~5 writes per race (1 user update + 1 race log + credit deduction)
- ~10 reads per race (credit check, user data fetch)
- **Free tier supports ~10,000 races/day**

### When to Upgrade

If you exceed free tier limits, upgrade to **Blaze Plan** (pay-as-you-go):
- Firestore: $0.06 per 100K reads, $0.18 per 100K writes
- Still extremely affordable for most usage

---

## Next Steps

After setup:

1. **Test locally** - Ensure everything works in development
2. **Deploy to Vercel** - Add env vars and redeploy
3. **Monitor Firestore** - Check Firebase Console for user data
4. **Track analytics** - See which models win most often in `races` collection

---

## Support

- Firebase Docs: https://firebase.google.com/docs
- Firestore Rules: https://firebase.google.com/docs/firestore/security/get-started
- Firebase CLI: https://firebase.google.com/docs/cli

---

**Firebase integration complete!** 🎉

Your users now have persistent credits across devices, and you have access to valuable analytics on model performance and user behavior.
