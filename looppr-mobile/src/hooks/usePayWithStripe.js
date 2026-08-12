import { useCallback } from 'react';
import { useStripe } from '@stripe/stripe-react-native';

// Shared init+present flow for Stripe's native PaymentSheet — used right
// after booking (book.js, clientSecret comes back with the created pickup)
// and from "Pay now" on an already-created, unpaid order (orders.js,
// clientSecret comes from a fresh /pay/intent call).
export function usePayWithStripe() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const pay = useCallback(async (clientSecret) => {
    if (!clientSecret) {
      return { error: { message: 'Payment could not be started. Please try again.' } };
    }
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Looppr',
    });
    if (initError) return { error: initError };

    const { error: presentError } = await presentPaymentSheet();
    if (presentError) return { error: presentError };

    return { error: null };
  }, [initPaymentSheet, presentPaymentSheet]);

  return { pay };
}
