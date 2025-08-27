'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Mail } from 'lucide-react'

export function TestEmailButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTestEmail = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test Email from Grady Dashboard',
          template: 'invitation',
          data: {
            environmentName: 'Test Environment',
            role: 'store_manager',
            inviteUrl: 'https://eventably.lt/invite/test123',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      })

      if (response.ok) {
        toast({
          title: 'Test email sent',
          description: 'Check the console for email details',
        })
      } else {
        throw new Error('Failed to send test email')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleTestEmail} 
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      <Mail className="mr-2 h-4 w-4" />
      {isLoading ? 'Sending...' : 'Send Test Email'}
    </Button>
  )
}
