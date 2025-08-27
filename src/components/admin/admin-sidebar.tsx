'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Shield, Building2, Users, Settings, Plus } from 'lucide-react'

interface AdminSidebarProps {
  userRole?: string | null
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newEnvironmentName, setNewEnvironmentName] = useState('')
  const [newEnvironmentSlug, setNewEnvironmentSlug] = useState('')
  const router = useRouter()

  const isAdmin = userRole === 'admin'

  const handleCreateEnvironment = async () => {
    if (!newEnvironmentName || !newEnvironmentSlug) return

    try {
      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newEnvironmentName,
          slug: newEnvironmentSlug,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsCreateDialogOpen(false)
        setNewEnvironmentName('')
        setNewEnvironmentSlug('')
        router.push(`/${data.slug}`)
      }
    } catch (error) {
      console.error('Error creating environment:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          {isAdmin && (
            <Badge variant="secondary" className="ml-auto">
              Admin
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/admin">
            <Shield className="mr-2 h-4 w-4" />
            Dashboard
          </a>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/admin/environments">
            <Building2 className="mr-2 h-4 w-4" />
            Environments
          </a>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </a>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/admin/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </a>
        </Button>
      </div>

      {isAdmin && (
        <div className="p-4 border-t">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Environment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Environment</DialogTitle>
                <DialogDescription>
                  Create a new environment for a store or organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Environment Name</Label>
                  <Input
                    id="name"
                    value={newEnvironmentName}
                    onChange={(e) => setNewEnvironmentName(e.target.value)}
                    placeholder="Enter environment name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Environment Slug</Label>
                  <Input
                    id="slug"
                    value={newEnvironmentSlug}
                    onChange={(e) => setNewEnvironmentSlug(e.target.value)}
                    placeholder="Enter environment slug"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEnvironment}>
                  Create Environment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
