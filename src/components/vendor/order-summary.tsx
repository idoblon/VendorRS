"use client"
import type { Product } from "../../lib/data"

interface OrderSummaryProps {
  cart: Product[]
  onPlaceOrder: () => void
}

export default function OrderSummary({ cart, onPlaceOrder }: OrderSummaryProps) {
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  return (
    <div>
      <ul className="divide-y divide-gray-200">
        {cart.map((item, index) => (
          <li key={index} className="py-2 flex justify-between items-center">
            <span>{item.name}</span>
            <span className="font-medium">${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-xl font-bold">Total:</span>
        <span className="text-xl font-bold">${total.toFixed(2)}</span>
      </div>
      <button
        onClick={onPlaceOrder}
        className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        Proceed to Payment
      </button>
    </div>
  )
}
