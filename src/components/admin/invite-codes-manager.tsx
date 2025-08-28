'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Copy, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InviteCode {
  id: string
  code: string
  max_uses: number
  used_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

interface InviteCodesManagerProps {
  partnerId: string
  className?: string
}

export function InviteCodesManager({ partnerId, className }: InviteCodesManagerProps) {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maxUses, setMaxUses] = useState(1)
  const [expiresInDays, setExpiresInDays] = useState(30)
  const { toast } = useToast()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadInviteCodes = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load invite codes')
        return
      }

      setInviteCodes(data || [])
    } catch (err) {
      setError('Failed to load invite codes')
    } finally {
      setIsLoading(false)
    }
  }, [partnerId, supabase])

  useEffect(() => {
    loadInviteCodes()
  }, [loadInviteCodes])

  const generateInviteCode = async () => {
    setIsCreating(true)
    setError(null)

    try {
      // Generate a random 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const expiresAt = expiresInDays > 0 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { data, error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          partner_id: partnerId,
          max_uses: maxUses,
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (error) {
        setError('Failed to create invite code')
        return
      }

      setInviteCodes([data, ...inviteCodes])
      toast({
        title: 'Invite code created',
        description: `Code: ${code}`,
      })
    } catch (err) {
      setError('Failed to create invite code')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast({
        title: 'Copied to clipboard',
        description: 'Invite code copied successfully',
      })
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the code manually',
        variant: 'destructive',
      })
    }
  }

  const deleteInviteCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .delete()
        .eq('id', id)

      if (error) {
        setError('Failed to delete invite code')
        return
      }

      setInviteCodes(inviteCodes.filter(code => code.id !== id))
      toast({
        title: 'Invite code deleted',
        description: 'The invite code has been removed',
      })
    } catch (err) {
      setError('Failed to delete invite code')
    }
  }

  const toggleInviteCode = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) {
        setError('Failed to update invite code')
        return
      }

      setInviteCodes(inviteCodes.map(code => 
        code.id === id ? { ...code, is_active: !isActive } : code
      ))
      toast({
        title: 'Invite code updated',
        description: `Code ${isActive ? 'deactivated' : 'activated'}`,
      })
    } catch (err) {
      setError('Failed to update invite code')
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Invite Codes</CardTitle>
          <CardDescription>
            Create invite codes for partners to join your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Create new invite code */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxUses">Max Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="0"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 0)}
                  className="mt-1"
                  placeholder="0 = never expires"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={generateInviteCode} 
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Code
                </Button>
              </div>
            </div>
          </div>

          {/* Invite codes list */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Active Invite Codes</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : inviteCodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No invite codes created yet
              </p>
            ) : (
              <div className="space-y-2">
                {inviteCodes.map((code) => (
                  <div
                    key={code.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      code.is_active ? 'bg-background' : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-lg font-bold">{code.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {code.used_count}/{code.max_uses} uses
                        {code.expires_at && (
                          <span className="ml-2">
                            • Expires {new Date(code.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleInviteCode(code.id, code.is_active)}
                      >
                        {code.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInviteCode(code.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
