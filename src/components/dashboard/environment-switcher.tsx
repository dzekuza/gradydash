'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEnvironmentAction } from '@/lib/db/environments/create-environment-action'

interface Environment {
  id: string
  name: string
  slug: string
}

interface EnvironmentSwitcherProps {
  environments: Environment[]
  currentEnvironment?: Environment
}

export function EnvironmentSwitcher({
  environments,
  currentEnvironment,
}: EnvironmentSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [value, setValue] = React.useState(currentEnvironment?.slug || '')
  const [isCreating, setIsCreating] = React.useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEnvironmentSelect = (environmentSlug: string) => {
    setValue(environmentSlug)
    setOpen(false)
    router.push(`/${environmentSlug}`)
  }

  const handleCreateEnvironment = async (formData: FormData) => {
    setIsCreating(true)
    
    try {
      await createEnvironmentAction(formData)
      setShowCreateDialog(false)
      toast({
        title: 'Environment created',
        description: 'Your new environment has been created successfully.',
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to create environment:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create environment',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select an environment"
            className="w-full justify-between"
          >
            {currentEnvironment ? currentEnvironment.name : 'Select environment...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search environments..." />
            <CommandList>
              <CommandEmpty>No environment found.</CommandEmpty>
              <CommandGroup>
                {environments.map((environment) => (
                  <CommandItem
                    key={environment.id}
                    value={environment.slug}
                    onSelect={() => handleEnvironmentSelect(environment.slug)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === environment.slug ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {environment.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Environment
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Environment</DialogTitle>
            <DialogDescription>
              Create a new environment for a reseller.
            </DialogDescription>
          </DialogHeader>
          <form action={handleCreateEnvironment}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter environment name"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="environment-slug"
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                  required
                  disabled={isCreating}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Environment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
