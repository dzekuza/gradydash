'use client'

import { Badge } from '@/components/ui/badge'
import { getCategoryById, getCategoryPath } from '@/lib/utils/categories'

interface CategoryDisplayProps {
  categories: string[]
  className?: string
  showFullPath?: boolean
  maxDisplay?: number
}

export function CategoryDisplay({ 
  categories, 
  className = '',
  showFullPath = false,
  maxDisplay = 5 
}: CategoryDisplayProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No categories assigned
      </div>
    )
  }

  const getCategoryDisplayName = (categoryId: string) => {
    const category = getCategoryById(categoryId)
    if (!category) return categoryId

    if (showFullPath) {
      const path = getCategoryPath(categoryId)
      return path.map(cat => cat.name).join(' > ')
    }
    
    return category.name
  }

  const displayedCategories = categories.slice(0, maxDisplay)
  const remainingCount = categories.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayedCategories.map((categoryId, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs"
        >
          {getCategoryDisplayName(categoryId)}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}
