'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Plus, X, Mail } from 'lucide-react'

export interface MemberInvitation {
  email: string
  role: 'store_manager'
}

interface MemberInvitationsProps {
  invitations: MemberInvitation[]
  onInvitationsChange: (invitations: MemberInvitation[]) => void
  disabled?: boolean
}

export function MemberInvitations({ 
  invitations, 
  onInvitationsChange, 
  disabled = false 
}: MemberInvitationsProps) {
  const [newEmail, setNewEmail] = useState('')

  const addInvitation = () => {
    if (!newEmail.trim()) return
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail.trim())) {
      alert('Please enter a valid email address')
      return
    }

    // Check if email already exists
    if (invitations.some(inv => inv.email.toLowerCase() === newEmail.toLowerCase())) {
      alert('This email is already in the invitation list')
      return
    }

    const newInvitation: MemberInvitation = {
      email: newEmail.trim(),
      role: 'store_manager'
    }

    onInvitationsChange([...invitations, newInvitation])
    setNewEmail('')
  }

  const removeInvitation = (index: number) => {
    const updatedInvitations = invitations.filter((_, i) => i !== index)
    onInvitationsChange(updatedInvitations)
  }



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInvitation()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Invite Partner Dashboard Managers (Optional)</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Invite team members to manage this partner&apos;s dashboard. They will receive an email invitation.
        </p>
      </div>

      {/* Add new invitation */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
          />
        </div>
        <div className="w-32 px-3 py-2 text-sm bg-muted rounded-md">
          Manager
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInvitation}
          disabled={disabled || !newEmail.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Invitations list */}
      {invitations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Invitations ({invitations.length})</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {invitations.map((invitation, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{invitation.email}</span>
                <div className="w-24 h-8 px-2 py-1 text-xs bg-muted rounded-md flex items-center">
                  Manager
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInvitation(index)}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
