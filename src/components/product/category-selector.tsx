'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { PRODUCT_CATEGORIES, Category, getAllCategories, getCategoryPath } from '@/lib/utils/categories'

interface CategorySelectorProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  placeholder?: string
  className?: string
}

export function CategorySelector({ 
  selectedCategories, 
  onCategoriesChange, 
  placeholder = "Select categories...",
  className 
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const allCategories = getAllCategories()

  const handleSelect = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    onCategoriesChange(newCategories)
  }

  const handleRemove = (categoryId: string) => {
    onCategoriesChange(selectedCategories.filter(id => id !== categoryId))
  }

  const getCategoryDisplayName = (categoryId: string) => {
    const category = allCategories.find(cat => cat.id === categoryId)
    if (!category) return categoryId

    const path = getCategoryPath(categoryId)
    if (path.length <= 2) return category.name
    
    // For deeper categories, show the full path
    return path.map(cat => cat.name).join(' > ')
  }

  const filteredCategories = allCategories.filter(category => 
    category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    getCategoryDisplayName(category.id).toLowerCase().includes(searchValue.toLowerCase())
  )

  const renderCategoryItem = (category: Category, level: number = 0) => {
    const isSelected = selectedCategories.includes(category.id)
    const hasChildren = category.children && category.children.length > 0
    
    return (
      <div key={category.id}>
        <CommandItem
          value={category.id}
          onSelect={() => handleSelect(category.id)}
          className={cn(
            'flex items-center gap-2',
            level > 0 && 'ml-4'
          )}
        >
          <Check
            className={cn(
              'h-4 w-4',
              isSelected ? 'opacity-100' : 'opacity-0'
            )}
          />
          <span className={cn(
            'flex-1',
            level > 0 && 'text-sm'
          )}>
            {category.name}
          </span>
          {hasChildren && (
            <span className="text-xs text-muted-foreground">
              ({category.children?.length} subcategories)
            </span>
          )}
        </CommandItem>
        
        {hasChildren && category.children && (
          <div className="ml-2">
            {category.children.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedCategories.length === 0
                ? placeholder
                : selectedCategories.length === 1
                ? getCategoryDisplayName(selectedCategories[0])
                : `${selectedCategories.length} categories selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search categories..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {filteredCategories.map(category => renderCategoryItem(category))}
              </CommandGroup>
              {selectedCategories.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onCategoriesChange([])}
                      className="justify-center text-center"
                    >
                      Clear selection
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCategories.map(categoryId => (
            <Badge
              key={categoryId}
              variant="secondary"
              className="text-xs"
            >
              {getCategoryDisplayName(categoryId)}
              <button
                type="button"
                onClick={() => handleRemove(categoryId)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className="sr-only">Remove category</span>
                <span className="text-xs">×</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
