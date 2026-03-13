import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { returnUrl } = body;

    // In a real app, you'd look up the customer's Stripe ID from your database
    // For now, we'll create a portal session without a customer ID for demo
    
    const session = await stripe.billingPortal.sessions.create({
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      configuration: undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
