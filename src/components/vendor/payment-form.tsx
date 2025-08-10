import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Product } from "../../types";


interface OrderSummaryProps {
  onPaymentComplete: () => void
}


export default function PaymentForm({onPaymentComplete }: OrderSummaryProps) { 
  const stripe = useStripe();
  const elements = useElements();

  const handlePayNow = async () => {
    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    
    if (result.error) {
      alert(result.error.message);
    } else {
      onPaymentComplete();
      alert("Payment successful");
    }
  };

  return (
    <>
      <PaymentElement />
      <button onClick={handlePayNow} disabled={!stripe}>Pay Now</button>
    </>
  );
}
