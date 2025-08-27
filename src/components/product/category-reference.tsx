'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRODUCT_CATEGORIES, Category } from '@/lib/utils/categories'

interface CategoryReferenceProps {
  className?: string
}

export function CategoryReference({ className }: CategoryReferenceProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filterCategories = (categories: Category[]): Category[] => {
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.id.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (category.children) {
        const filteredChildren = filterCategories(category.children)
        if (filteredChildren.length > 0) {
          return true
        }
      }
      
      return matchesSearch
    }).map(category => ({
      ...category,
      children: category.children ? filterCategories(category.children) : undefined
    }))
  }

  const filteredCategories = filterCategories(PRODUCT_CATEGORIES)

  const renderCategory = (category: Category, level: number = 0) => {
    const isVisible = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.id.toLowerCase().includes(searchTerm.toLowerCase())

    return (
      <div key={category.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        {isVisible && (
          <div className="flex items-center gap-2 py-1">
            <Badge variant="outline" className="text-xs font-mono">
              {category.id}
            </Badge>
            <span className="text-sm">{category.name}</span>
          </div>
        )}
        {category.children && category.children.length > 0 && (
          <div className="ml-2">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Category Reference</CardTitle>
        <CardDescription>
          All available product categories with their IDs for CSV import
        </CardDescription>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => renderCategory(category))
          ) : (
            <p className="text-sm text-muted-foreground">No categories found matching &quot;{searchTerm}&quot;</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Use category IDs in CSV imports separated by semicolons (e.g., &quot;mobile-phones-main;phone-case&quot;)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
