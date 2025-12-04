import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCredits } from '@/lib/credits';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { tier } = await req.json();

    const pricingTiers = {
      starter: { amount: 299, credits: 10, name: 'Starter Pack' },
      value: { amount: 499, credits: 25, name: 'Value Pack' },
      unlimited: { amount: 999, credits: 999, name: '24hr Unlimited' },
    };

    const selectedTier = pricingTiers[tier as keyof typeof pricingTiers];

    if (!selectedTier) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedTier.name,
              description: `${selectedTier.credits} AI model races`,
            },
            unit_amount: selectedTier.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}?success=true&credits=${selectedTier.credits}`,
      cancel_url: `${req.headers.get('origin')}?canceled=true`,
      metadata: {
        credits: selectedTier.credits.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Handle successful payment (add credits)
export async function PUT(req: NextRequest) {
  try {
    const { credits } = await req.json();

    if (!credits || isNaN(parseInt(credits))) {
      return NextResponse.json(
        { error: 'Invalid credits amount' },
        { status: 400 }
      );
    }

    const updatedCredits = await addCredits(parseInt(credits));

    return NextResponse.json({
      success: true,
      creditsRemaining: updatedCredits.remaining,
    });
  } catch (error) {
    console.error('Add credits error:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}
