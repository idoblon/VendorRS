// StripeWrapper.tsx
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 
// or process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

interface StripeWrapperProps {
  cart: any[];
  onPaymentComplete: () => void;
}

export default function StripeWrapper({ cart, onPaymentComplete }: StripeWrapperProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm cart={cart} onPaymentComplete={onPaymentComplete} />
    </Elements>
  );
}
