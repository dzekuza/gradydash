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
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, Plus, Key, Users, Mail } from 'lucide-react'
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

interface InviteCodesSectionProps {
  partnerId: string
  className?: string
}

export function InviteCodesSection({ partnerId, className }: InviteCodesSectionProps) {
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
        .eq('is_active', true)
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

  const copyInviteLink = async (code: string) => {
    const inviteLink = `${window.location.origin}/register?invite=${code}`
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast({
        title: 'Invite link copied',
        description: 'Direct registration link copied to clipboard',
      })
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Invitation Codes
          </CardTitle>
          <CardDescription>
            Share these codes with new managers to join your partner dashboard
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

          {/* Active invite codes */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Active Invite Codes</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : inviteCodes.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No active invite codes</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate your first invite code to start inviting team members.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inviteCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-background"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-lg font-bold bg-muted px-2 py-1 rounded">
                            {code.code}
                          </div>
                          <Badge variant="secondary">
                            {code.used_count}/{code.max_uses} uses
                          </Badge>
                          {code.expires_at && (
                            <Badge variant="outline">
                              Expires {new Date(code.expires_at).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Created {new Date(code.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(code.code)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to invite new managers:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">1</div>
                <div>Generate an invite code above</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">2</div>
                <div>Share the code or direct link with the new manager</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">3</div>
                <div>They&apos;ll register as a Partner and use the code to join your dashboard</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
