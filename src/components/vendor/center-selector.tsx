"use client"

import { useState, useEffect } from "react"
import axiosInstance from "../../utils/axios"

interface CenterSelectorProps {
  categoryId: string
  onSelectCenter: (centerId: string) => void
}

export default function CenterSelector({ categoryId, onSelectCenter }: CenterSelectorProps) {
  const [centers, setCenters] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data }: { data:any } = await axiosInstance.get(`/api/centers/category/${categoryId}`)

        setCenters(data.data)
      } catch (e: any) {
        setError(`Failed to fetch centers: ${e.message}`)
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchCenters()
    } else {
      setCenters([])
      setLoading(false)
    }
  }, [categoryId])

  if (loading) {
    return <div className="text-center p-4">Loading centers...</div>
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>
  }

  if (centers.length === 0) {
    return <div className="text-center p-4 text-gray-500">No centers found for this category.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {centers.map((center:any) => (
        <button
          key={center.id}
          onClick={() => onSelectCenter(center._id)}
          className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white text-lg font-medium text-center"
        >
          {center.name}
        </button>
      ))}
    </div>
  )
}
