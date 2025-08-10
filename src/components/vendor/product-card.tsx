"use client"


interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: { url: string }[]
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl =
    product.images?.[0]?.url || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(product.name)}`

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col">
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={product.name}
        className="w-full h-48 object-cover mb-4 rounded"
        onError={(e) => {
          // Fallback to a generic placeholder if the provided URL fails
          e.currentTarget.src = `/placeholder.svg?height=200&width=200&query=product`
        }}
      />
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-3 flex-grow">{product.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-xl font-bold">
          {product.currency} {product.price.toFixed(2)}
        </span>
        <button
          onClick={() => onAddToCart(product)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
