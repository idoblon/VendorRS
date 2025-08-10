"use client"
import type { Category } from "../../lib/data"

interface CategorySelectorProps {
  categories: Category[]
  onSelectCategory: (categoryId: string) => void
}

export default function CategorySelector({ categories, onSelectCategory }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => onSelectCategory(category._id)}
          className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white text-lg font-medium text-center"
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
