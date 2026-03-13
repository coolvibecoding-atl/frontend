import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover',
});

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '5 tracks per month',
      'Basic stem separation',
      'Standard mixing',
      'MP3 export only',
    ],
    limits: {
      tracksPerMonth: 5,
      stemSeparation: false,
      advancedMixing: false,
      wavExport: false,
      batchProcessing: false,
    },
  },
  PRO: {
    name: 'Pro',
    price: 19.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: [
      'Unlimited tracks',
      'Advanced stem separation',
      'AI-powered mixing',
      'WAV & MP3 export',
      'Priority processing',
    ],
    limits: {
      tracksPerMonth: -1,
      stemSeparation: true,
      advancedMixing: true,
      wavExport: true,
      batchProcessing: false,
    },
  },
  STUDIO: {
    name: 'Studio',
    price: 49.99,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID || 'price_studio',
    features: [
      'Everything in Pro',
      'Batch processing',
      'Reference track matching',
      'Vocal tuning',
      'Dedicated support',
      'API access',
    ],
    limits: {
      tracksPerMonth: -1,
      stemSeparation: true,
      advancedMixing: true,
      wavExport: true,
      batchProcessing: true,
      vocalTuning: true,
      referenceMatching: true,
      apiAccess: true,
    },
  },
};

export type PlanType = keyof typeof PLANS;
