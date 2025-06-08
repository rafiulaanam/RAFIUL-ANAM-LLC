import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ STRIPE_SECRET_KEY is not set in environment variables');
    // Create a mock instance for development
    stripeInstance = new Stripe('dummy_key', {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

export function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    throw new Error(
      'Stripe is not initialized. Please check your environment variables.'
    );
  }
  return stripeInstance;
}

export default stripeInstance; 